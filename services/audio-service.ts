import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

/**
 * AudioService - A service for generating and managing audio files using iFlytek TTS API
 *
 * This service provides functions for text-to-speech conversion and audio storage
 */
export class AudioService {
  private iFlytekAppId: string;
  private iFlytekApiKey: string;
  private iFlytekApiSecret: string;
  private iFlytekTtsEndpoint: string;
  private s3Client: S3Client;
  private s3Bucket: string;
  private s3Endpoint: string;

  constructor(config?: {
    iFlytekAppId?: string;
    iFlytekApiKey?: string;
    iFlytekApiSecret?: string;
    s3Region?: string;
    s3Endpoint?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
    s3Bucket?: string;
  }) {
    // iFlytek configuration
    this.iFlytekAppId =
      config?.iFlytekAppId || process.env.IFLYTEK_APP_ID || "";
    this.iFlytekApiKey =
      config?.iFlytekApiKey || process.env.IFLYTEK_API_KEY || "";
    this.iFlytekApiSecret =
      config?.iFlytekApiSecret || process.env.IFLYTEK_API_SECRET || "";
    this.iFlytekTtsEndpoint = "https://api.xfyun.cn/v1/service/v1/tts";

    // S3 storage configuration
    this.s3Endpoint =
      config?.s3Endpoint ||
      process.env.S3_ENDPOINT ||
      "https://c6f952415d166f10dba466d2755d4432.r2.cloudflarestorage.com";
    this.s3Bucket = config?.s3Bucket || process.env.S3_BUCKET || "resources";

    // Initialize S3 client
    this.s3Client = new S3Client({
      region: config?.s3Region || "auto",
      endpoint: this.s3Endpoint,
      credentials: {
        accessKeyId:
          config?.s3AccessKey ||
          process.env.S3_ACCESS_KEY ||
          "0825f746929c757893995908a5a2e4f7",
        secretAccessKey:
          config?.s3SecretKey ||
          process.env.S3_SECRET_KEY ||
          "38a8f554b20bde8f0d9d13abfd498dfca6fd77ed99e8c893c6f4465a510b4bf2",
      },
    });
  }

  /**
   * Generate authentication headers for iFlytek API
   */
  private generateIFlytekAuthHeaders(text: string): Record<string, string> {
    // In a production environment, you would compute these values using cryptographic functions
    const timestamp = Math.floor(Date.now() / 1000);

    // Note: In a real implementation, you'd use a proper library to calculate the signature
    // This is a placeholder - iFlytek uses HMAC-SHA256 for signature calculation
    const signature = `${this.iFlytekApiKey}${timestamp}${text.length}`;

    return {
      "X-Appid": this.iFlytekAppId,
      "X-CurTime": timestamp.toString(),
      "X-Param": JSON.stringify({
        aue: "lame", // MP3 format
        auf: "audio/L16;rate=16000",
        voice_name: "xiaoyan", // Default Chinese voice
        speed: 50,
        volume: 50,
        pitch: 50,
        engine_type: "aisound",
      }),
      "X-CheckSum": signature,
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    };
  }

  /**
   * Select a random English voice from iFlytek
   */
  private randomEnglishVoice(): string {
    // iFlytek English voice options
    const voices = [
      "catherine", // British English
      "henry", // American English
      "vimary", // American English
      "william", // American English
    ];
    return voices[Math.floor(Math.random() * voices.length)];
  }

  /**
   * Convert text to speech using iFlytek TTS API
   *
   * @param text - The text to convert to speech
   * @param voiceName - The voice to use (optional)
   * @returns The URL of the generated audio file
   */
  async textToSpeech(text: string, voiceName?: string): Promise<string> {
    try {
      // Generate unique ID for the audio file
      const audioId = uuidv4();
      const localFilePath = `./tmp/${audioId}.mp3`;
      const s3Key = `audio/${audioId}.mp3`;

      // Ensure tmp directory exists
      if (!fs.existsSync("./tmp")) {
        fs.mkdirSync("./tmp", { recursive: true });
      }

      // Voice selection
      const voice = voiceName || this.randomEnglishVoice();

      // Generate headers for the API request
      const headers = this.generateIFlytekAuthHeaders(text);

      // Prepare request body
      const formData = new URLSearchParams();
      formData.append("text", text);

      // Make the API request
      const response = await fetch(this.iFlytekTtsEndpoint, {
        method: "POST",
        headers: headers,
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(
          `iFlytek TTS API request failed with status ${response.status}`
        );
      }

      // Save the audio blob to a local file
      const audioBuffer = await response.arrayBuffer();
      fs.writeFileSync(localFilePath, Buffer.from(audioBuffer));

      // Upload to S3
      await this.uploadToS3(localFilePath, s3Key);

      // Clean up local file
      fs.unlinkSync(localFilePath);

      // Return the URL of the uploaded file
      return `${this.s3Endpoint.replace(
        "https://",
        "https://r2.huuhoang.id.vn/"
      )}/${s3Key}`;
    } catch (error) {
      console.error("Error generating audio:", error);
      throw error;
    }
  }

  /**
   * Upload file to S3 storage
   *
   * @param filePath - Local path of the file
   * @param key - S3 key (path) for the file
   */
  private async uploadToS3(filePath: string, key: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath);
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: fileStream,
        ContentType: "audio/mpeg",
        ContentLength: fs.statSync(filePath).size,
      })
    );
  }

  /**
   * Batch process a list of words and generate audio for each
   *
   * @param words - List of words to process
   */
  async batchGenerateAudio(
    words: { wordId: number; word: string }[]
  ): Promise<Record<number, string>> {
    const results: Record<number, string> = {};

    for (const word of words) {
      try {
        console.log(`Generating audio for word: ${word.word}`);
        const audioUrl = await this.textToSpeech(word.word);
        results[word.wordId] = audioUrl;

        // Add a delay to avoid rate limiting
        await this.sleep(1000);
      } catch (error) {
        console.error(`Error processing word ${word.word}:`, error);
      }
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new AudioService();
