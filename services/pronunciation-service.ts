import { PronunciationFeedback, WordAnalysis } from "../types/pronunciation";

export class PronunciationService {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  private async processAudioTo16kHz(audioBlob: Blob): Promise<Blob> {
    if (!this.audioContext) {
      if (typeof window !== "undefined") {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } else {
        console.warn("AudioContext unavailable");
        return audioBlob;
      }
    }

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.duration * 16000,
        16000
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      return await this.audioBufferToWav(renderedBuffer);
    } catch (error) {
      console.error("Error processing audio to 16kHz:", error);
      return audioBlob;
    }
  }

  private async audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2;
    const sampleRate = buffer.sampleRate;
    const data = new Uint8Array(44 + length);

    this.writeString(data, 0, "RIFF");
    const fileSize = length + 36;
    data[4] = fileSize & 0xff;
    data[5] = (fileSize >> 8) & 0xff;
    data[6] = (fileSize >> 16) & 0xff;
    data[7] = (fileSize >> 24) & 0xff;

    this.writeString(data, 8, "WAVE");
    this.writeString(data, 12, "fmt ");
    data[16] = 16;
    data[20] = 1;
    data[22] = numOfChannels;
    data[24] = sampleRate & 0xff;
    data[25] = (sampleRate >> 8) & 0xff;
    data[26] = (sampleRate >> 16) & 0xff;
    data[27] = (sampleRate >> 24) & 0xff;

    const byteRate = sampleRate * numOfChannels * 2;
    data[28] = byteRate & 0xff;
    data[29] = (byteRate >> 8) & 0xff;
    data[30] = (byteRate >> 16) & 0xff;
    data[31] = (byteRate >> 24) & 0xff;

    data[32] = numOfChannels * 2;
    data[34] = 16;

    this.writeString(data, 36, "data");
    data[40] = length & 0xff;
    data[41] = (length >> 8) & 0xff;
    data[42] = (length >> 16) & 0xff;
    data[43] = (length >> 24) & 0xff;

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numOfChannels; c++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
        const s = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        data[offset++] = s & 0xff;
        data[offset++] = (s >> 8) & 0xff;
      }
    }

    return new Blob([data], { type: "audio/wav" });
  }

  private writeString(data: Uint8Array, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      data[offset + i] = str.charCodeAt(i);
    }
  }

  public async analyzePronunciation(
    audioBlob: Blob,
    transcript: string
  ): Promise<PronunciationFeedback> {
    const processedAudio = await this.processAudioTo16kHz(audioBlob);

    const formData = new FormData();
    formData.append("audio", processedAudio, "recording.wav");
    formData.append("transcript", transcript);

    const response = await fetch("http://127.0.0.1:8000/analyze/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    console.log("API analysis result:", result);

    const feedback = await this.getGeminiFeedback(result, transcript);
    return feedback;
  }

  private async getGeminiFeedback(
    analysisResult: any,
    transcript: string
  ): Promise<PronunciationFeedback> {
    const promptText = `
  Bạn là chuyên gia đánh giá phát âm. Hãy phân tích dữ liệu sau và tạo phản hồi hữu ích bằng TIẾNG VIỆT:
  
  Original text: "${transcript}"
  
  Analysis:
  - Score: ${analysisResult.score}
  - Expected phonemes: ${JSON.stringify(analysisResult.expected_phonemes)}
  - User phonemes: ${JSON.stringify(analysisResult.user_phonemes)}
  - Correct phonemes: ${JSON.stringify(analysisResult.correct_phonemes)}
  - Mistakes: ${JSON.stringify(analysisResult.mistakes)}
  - Pitch mean: ${analysisResult.pitch_mean}
  - Energy mean: ${analysisResult.energy_mean}
  
  Trả về JSON với cấu trúc sau:
  {
    "overall": number,
    "details": {
      "accuracy": number,
      "fluency": number,
      "prosody": number,
      "textMatch": number
    },
    "feedback": string[],
    "wordAnalysis": [
      {
        "word": string,
        "correctlyPronounced": boolean,
        "feedback": string
      }
    ]
  }
  
  LƯU Ý: chỉ trả JSON thuần, không có giải thích hay chú thích nào khác.
    `;

    const response = await fetch("/api/ai-proxy/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini response raw:", rawText);

    try {
      // ✅ Xử lý markdown-style response (```json ... ```)
      const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        ...parsed,
        transcribedText: transcript,
        originalText: transcript,
        expectedPhonemes: analysisResult.expected_phonemes,
        userPhonemes: analysisResult.user_phonemes,
        correctPhonemes: analysisResult.correct_phonemes,
        mistakes: analysisResult.mistakes,
        pitchMean: analysisResult.pitch_mean,
        energyMean: analysisResult.energy_mean,
      };
    } catch (err) {
      console.error("Gemini JSON parse error:", err);
      throw new Error("Gemini trả JSON sai định dạng");
    }
  }
}

const pronunciationService = new PronunciationService();
export default pronunciationService;
