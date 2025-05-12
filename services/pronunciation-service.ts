import {
  PronunciationFeedback,
  TranscriptionResult,
  WordAnalysis,
} from "../types/pronunciation";

/**
 * Simplified PronunciationService
 * Creates 16kHz WAV files and calls the analysis API endpoint
 */
export class PronunciationService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext lazily on first use
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
  }

  /**
   * Convert audio blob to WAV format with 16kHz sample rate
   * @param audioBlob Raw audio blob from MediaRecorder
   * @returns Promise with processed WAV blob at 16kHz
   */
  private async processAudioTo16kHz(audioBlob: Blob): Promise<Blob> {
    if (!this.audioContext) {
      if (typeof window !== "undefined") {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } else {
        console.warn("AudioContext unavailable");
        return audioBlob; // Return original if no audio context
      }
    }

    try {
      console.log("Processing audio to 16kHz WAV format...");

      // Convert Blob to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();

      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create offline context with 16kHz sample rate
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.duration * 16000,
        16000 // Target sample rate: 16kHz
      );

      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      // Render audio at 16kHz
      const renderedBuffer = await offlineContext.startRendering();

      // Convert the resampled buffer to WAV
      const wavBlob = await this.audioBufferToWav(renderedBuffer);

      return wavBlob;
    } catch (error) {
      console.error("Error processing audio to 16kHz:", error);
      return audioBlob; // Return original on error
    }
  }

  /**
   * Convert AudioBuffer to WAV blob with specified sample rate
   */
  private async audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2; // 16-bit = 2 bytes per sample
    const sampleRate = buffer.sampleRate;
    const data = new Uint8Array(44 + length); // WAV header is 44 bytes

    // WAV Header
    // "RIFF" chunk descriptor
    this.writeString(data, 0, "RIFF");
    data[4] = (length + 36) & 0xff;
    data[5] = ((length + 36) >> 8) & 0xff;
    data[6] = ((length + 36) >> 16) & 0xff;
    data[7] = ((length + 36) >> 24) & 0xff;

    // "WAVE" format
    this.writeString(data, 8, "WAVE");

    // "fmt " sub-chunk
    this.writeString(data, 12, "fmt ");
    data[16] = 16; // PCM format = 16
    data[17] = 0;
    data[18] = 0;
    data[19] = 0;

    data[20] = 1; // PCM format = 1
    data[21] = 0;

    data[22] = numOfChannels;
    data[23] = 0;

    // Sample rate
    data[24] = sampleRate & 0xff;
    data[25] = (sampleRate >> 8) & 0xff;
    data[26] = (sampleRate >> 16) & 0xff;
    data[27] = (sampleRate >> 24) & 0xff;

    // Byte rate: SampleRate * NumChannels * BitsPerSample/8
    const byteRate = sampleRate * numOfChannels * 2;
    data[28] = byteRate & 0xff;
    data[29] = (byteRate >> 8) & 0xff;
    data[30] = (byteRate >> 16) & 0xff;
    data[31] = (byteRate >> 24) & 0xff;

    // Block align: NumChannels * BitsPerSample/8
    data[32] = numOfChannels * 2;
    data[33] = 0;

    // Bits per sample
    data[34] = 16; // 16 bits
    data[35] = 0;

    // "data" sub-chunk
    this.writeString(data, 36, "data");
    data[40] = length & 0xff;
    data[41] = (length >> 8) & 0xff;
    data[42] = (length >> 16) & 0xff;
    data[43] = (length >> 24) & 0xff;

    // Write PCM samples
    let index = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChannels; channel++) {
        // Convert float to int16
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i])
        );
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;

        // Write sample in little-endian format
        data[index++] = int16 & 0xff;
        data[index++] = (int16 >> 8) & 0xff;
      }
    }

    return new Blob([data], { type: "audio/wav" });
  }

  /**
   * Helper function to write string to Uint8Array at offset
   */
  private writeString(data: Uint8Array, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      data[offset + i] = str.charCodeAt(i);
    }
  }

  /**
   * Send audio recording to analysis API
   * @param audioBlob Audio recording from client
   * @param transcript Text that user was attempting to pronounce
   * @returns Assessment results
   */
  public async analyzePronunciation(
    audioBlob: Blob,
    transcript: string
  ): Promise<PronunciationFeedback> {
    try {
      console.log("Processing audio for analysis...");

      // Convert to 16kHz WAV format
      const processedAudio = await this.processAudioTo16kHz(audioBlob);

      // Create FormData for the API
      const formData = new FormData();
      formData.append("audio", processedAudio, "recording.wav");
      formData.append("transcript", transcript);

      console.log("Sending to pronunciation analysis API...");
      const response = await fetch("http://127.0.0.1:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis API error: ${response.status}`);
      }

      const analysisResult = await response.json();
      console.log("Analysis result:", analysisResult);

      // Get enhanced feedback from Gemini
      const enhancedFeedback = await this.getGeminiFeedback(
        analysisResult,
        transcript
      );

      return enhancedFeedback;
    } catch (error) {
      console.error("Error in pronunciation analysis:", error);
      throw error;
    }
  }

  /**
   * Convert analysis result to user-friendly feedback using Gemini API
   * @param analysisResult Raw analysis result from pronunciation API
   * @param transcript Original text prompt
   * @returns Enhanced feedback
   */
  private async getGeminiFeedback(
    analysisResult: any,
    transcript: string
  ): Promise<PronunciationFeedback> {
    try {
      // If not in a browser environment or in SSR, return simplified feedback
      if (typeof window === "undefined") {
        return this.createBasicFeedback(analysisResult, transcript);
      }

      console.log("Getting enhanced feedback from Gemini...");

      const promptText = `
        You are a pronunciation assessment expert. Analyze the following pronunciation data and provide helpful, friendly feedback:
        
        Original text: "${transcript}"
        
        Analysis data:
        - Score: ${analysisResult.score}
        - Expected phonemes: ${JSON.stringify(analysisResult.expected_phonemes)}
        - User phonemes: ${JSON.stringify(analysisResult.user_phonemes)}
        - Correct phonemes: ${JSON.stringify(analysisResult.correct_phonemes)}
        - Mistakes: ${JSON.stringify(analysisResult.mistakes)}
        - Pitch mean: ${analysisResult.pitch_mean}
        - Energy mean: ${analysisResult.energy_mean}
        
        Based on this data, create a JSON object with the following structure:
        {
          "overall": number, // Overall pronunciation score (0-100)
          "details": {
            "accuracy": number, // Accuracy score (0-100)
            "fluency": number,  // Fluency score (0-100)
            "prosody": number   // Prosody/intonation score (0-100)
          },
          "feedback": string[], // 2-3 helpful and specific feedback points
          "wordAnalysis": [     // Analysis for individual words
            {
              "word": string,
              "correctlyPronounced": boolean,
              "feedback": string // Specific feedback for this word
            }
          ]
        }
        
        Only respond with the JSON object, no other text.
      `;

      // Call the internal Gemini proxy API
      const response = await fetch("/api/ai-proxy/gemini/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
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
      const textContent = result.candidates[0].content.parts[0].text;

      try {
        // Parse the JSON response from Gemini
        const feedbackData = JSON.parse(textContent);

        // Create a valid PronunciationFeedback object
        return {
          overall: feedbackData.overall,
          details: feedbackData.details,
          feedback: feedbackData.feedback,
          wordAnalysis: feedbackData.wordAnalysis,
          transcribedText: transcript, // We don't have actual transcription
          originalText: transcript,
        };
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        return this.createBasicFeedback(analysisResult, transcript);
      }
    } catch (error) {
      console.error("Error getting enhanced feedback:", error);
      return this.createBasicFeedback(analysisResult, transcript);
    }
  }

  /**
   * Create basic feedback from analysis result when Gemini is unavailable
   */
  private createBasicFeedback(
    analysisResult: any,
    transcript: string
  ): PronunciationFeedback {
    const score = analysisResult.score || 0;

    // Create word analysis based on mistakes
    const words = transcript.split(/\s+/);
    const wordAnalysis: WordAnalysis[] = words.map((word, index) => {
      const hasError = analysisResult.mistakes?.some(
        (m: any) => m.position === index
      );

      return {
        word,
        correctlyPronounced: !hasError,
        feedback: hasError
          ? "This word needs improvement"
          : "Pronounced correctly",
      };
    });

    // Create basic feedback
    return {
      overall: score,
      details: {
        accuracy: score, // Use the same score as overall
        fluency: Math.min(100, score + 5), // Slightly higher than score
        prosody: Math.max(0, score - 5), // Slightly lower than score
      },
      feedback: [
        score > 75
          ? "Your pronunciation is good!"
          : "Your pronunciation needs some improvement.",
        "Try practicing the words marked as incorrect.",
      ],
      wordAnalysis,
      transcribedText: transcript, // We don't have actual transcription
      originalText: transcript,
    };
  }
}

// Export default instance
const pronunciationService = new PronunciationService();
export default pronunciationService;
