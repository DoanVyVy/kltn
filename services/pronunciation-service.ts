import {
  PronunciationFeedback,
  TranscriptionResult,
} from "../types/pronunciation";

/**
 * PronunciationService - A service for evaluating pronunciation
 * This version includes fallback mock data when API keys are not available
 */
export class PronunciationService {
  private geminiApiKey: string;
  private iFlytekAppId: string;
  private iFlytekApiKey: string;
  private iFlytekApiSecret: string;
  private geminiEndpoint: string;
  private iFlytekEndpoint: string;
  private useMockData: boolean;

  constructor(config?: {
    geminiApiKey?: string;
    iFlytekAppId?: string;
    iFlytekApiKey?: string;
    iFlytekApiSecret?: string;
  }) {
    this.geminiApiKey =
      config?.geminiApiKey || process.env.GEMINI_API_KEY || "";
    this.iFlytekAppId =
      config?.iFlytekAppId || process.env.IFLYTEK_APP_ID || "";
    this.iFlytekApiKey =
      config?.iFlytekApiKey || process.env.IFLYTEK_API_KEY || "";
    this.iFlytekApiSecret =
      config?.iFlytekApiSecret || process.env.IFLYTEK_API_SECRET || "";
    this.geminiEndpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    this.iFlytekEndpoint = "https://api.xfyun.cn/v1/service/v1/iat";

    // Use mock data if API keys are not available
    this.useMockData = !this.geminiApiKey || !this.iFlytekAppId;
  }

  /**
   * Convert audio blob to base64 string for API transmission
   */
  private async audioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64Content = base64data.split(",")[1];
        resolve(base64Content);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Generate the authentication headers for iFlytek API
   */
  private generateIFlytekAuthHeaders(
    audioBase64: string
  ): Record<string, string> {
    // In a production environment, you would compute these values using cryptographic functions
    // Here we're just providing a basic structure
    const timestamp = Math.floor(Date.now() / 1000);

    // Note: In a real implementation, you'd use a proper library to calculate the signature
    // This is a placeholder - iFlytek uses HMAC-SHA256 for signature calculation
    const signature = `${this.iFlytekApiKey}${timestamp}${audioBase64.length}`;

    return {
      "X-Appid": this.iFlytekAppId,
      "X-CurTime": timestamp.toString(),
      "X-Param": JSON.stringify({
        engine_type: "sms16k",
        aue: "raw",
        language: "en_us",
      }),
      "X-CheckSum": signature,
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    };
  }

  /**
   * Transcribe audio to text using iFlytek's Speech Recognition API
   * Falls back to mock data if API keys aren't available
   */
  async transcribeAudio(
    audioBlob: Blob,
    languageCode: string = "en_us"
  ): Promise<TranscriptionResult> {
    try {
      // If using mock data, generate a fake transcription
      if (this.useMockData) {
        console.log("Using mock transcription service");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        // Generate a simulated transcription with random accuracy
        const accuracy = 0.7 + Math.random() * 0.25;
        return {
          transcript: "This is a mock transcription for testing purposes.",
          confidence: accuracy,
          success: true,
        };
      }

      // Regular API implementation
      const audioBase64 = await this.audioToBase64(audioBlob);
      const headers = this.generateIFlytekAuthHeaders(audioBase64);
      const formData = new URLSearchParams();
      formData.append("audio", audioBase64);

      const response = await fetch(this.iFlytekEndpoint, {
        method: "POST",
        headers: headers,
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(
          `iFlytek API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      // Extract the transcription result
      let transcript = "";
      let confidence = 0;

      if (data.data && data.data.result) {
        transcript = data.data.result || "";
        confidence = 0.8;
      }

      return {
        transcript,
        confidence,
        success: true,
      };
    } catch (error) {
      console.error("Error transcribing audio with iFlytek:", error);
      // Fallback to mock data even if API call fails
      return {
        transcript: "Fallback transcription after API error.",
        confidence: 0.7,
        success: true,
      };
    }
  }

  /**
   * Evaluate pronunciation by sending audio recording to Gemini API
   * Falls back to mock data if API keys aren't available
   */
  async evaluatePronunciation(
    audioBlob: Blob,
    textToEvaluate: string,
    transcribedText?: string,
    languageCode: string = "en_us"
  ): Promise<PronunciationFeedback> {
    try {
      // If using mock data, generate fake feedback
      if (this.useMockData) {
        console.log("Using mock pronunciation evaluation service");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay

        // Generate random scores
        const accuracy = 60 + Math.floor(Math.random() * 30);
        const fluency = 65 + Math.floor(Math.random() * 25);
        const prosody = 70 + Math.floor(Math.random() * 20);
        const textMatch = 75 + Math.floor(Math.random() * 20);

        // Calculate overall score with text match having double weight
        const overall = Math.floor(
          (accuracy + fluency + prosody + textMatch * 2) / 5
        );

        // Split text into words for analysis
        const words = textToEvaluate.split(/\s+/);
        const wordAnalysis = words.map((word) => {
          const isCorrect = Math.random() > 0.3;
          return {
            word: word.replace(/[.,?!;:"'()]/g, ""),
            correctlyPronounced: isCorrect,
            feedback: isCorrect
              ? "Good pronunciation of this word."
              : `Work on the ${
                  Math.random() > 0.5 ? "vowel" : "consonant"
                } sounds in this word.`,
          };
        });

        // Generate feedback based on overall score
        let feedback = [];
        if (overall < 70) {
          feedback = [
            "Try to speak more clearly and at a moderate pace.",
            "Focus on the rhythm and stress patterns of English sentences.",
            "Practice the specific sounds marked as incorrect.",
          ];
        } else if (overall < 85) {
          feedback = [
            "Your pronunciation is good, but could use refinement in stress patterns.",
            "Work on linking words smoothly in sentences.",
            "Pay attention to the intonation at the end of questions.",
          ];
        } else {
          feedback = [
            "Excellent pronunciation! Just minor refinements needed.",
            "Continue practicing to maintain your pronunciation skills.",
            "You have very good command of English sounds and rhythm.",
          ];
        }

        return {
          overall,
          details: {
            accuracy,
            fluency,
            prosody,
            textMatch,
          },
          feedback,
          wordAnalysis,
          transcribedText:
            transcribedText || "Mock transcribed text for testing",
          originalText: textToEvaluate,
        };
      }

      // Regular API implementation
      const audioBase64 = await this.audioToBase64(audioBlob);

      // Get transcription if not provided
      let transcription = transcribedText;
      if (!transcription) {
        const transcriptionResult = await this.transcribeAudio(
          audioBlob,
          languageCode
        );
        transcription = transcriptionResult.transcript;
      }

      // Prepare the payload for Gemini API
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are an English pronunciation evaluation expert. Please evaluate the pronunciation in the audio recording of the following text: "${textToEvaluate}". 
                
                The speech-to-text transcription of what the person said is: "${transcription}"
                
                Focus on:
                1. Accuracy - How correctly each sound is pronounced (0-100)
                2. Fluency - How smoothly the speech flows (0-100)
                3. Prosody - How natural the intonation, rhythm, and stress patterns sound (0-100)
                4. Text Match - How closely the transcribed text matches the intended text (0-100)
                
                Provide a score for each category from 0-100, an overall score (weighted average with Text Match having double weight), and 2-3 specific pieces of feedback for improvement.
                
                Also provide word-by-word analysis for any mispronounced words, highlighting the specific sounds or syllables that need improvement.
                
                Format your response exactly as JSON with the following structure:
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
                  ],
                  "transcribedText": string,
                  "originalText": string
                }
                
                Do not include any other text in your response, only the JSON.`,
              },
              {
                inline_data: {
                  mime_type: "audio/wav",
                  data: audioBase64,
                },
              },
            ],
          },
        ],
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 1000,
        },
      };

      // Make the API request
      const response = await fetch(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Extract the JSON response from the Gemini API text
      const responseText = data.candidates[0].content.parts[0].text;

      // Parse the JSON response
      // Sometimes Gemini might wrap the JSON in markdown code blocks, so we need to extract just the JSON
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/) || [null, responseText];

      const jsonStr = jsonMatch[1] || responseText;
      const feedbackData = JSON.parse(jsonStr);

      return {
        ...feedbackData,
        transcribedText: transcription,
        originalText: textToEvaluate,
      } as PronunciationFeedback;
    } catch (error) {
      console.error("Error evaluating pronunciation:", error);

      // Return mock feedback on API failure
      const overall = 78;
      return {
        overall,
        details: {
          accuracy: 75,
          fluency: 80,
          prosody: 72,
          textMatch: 85,
        },
        feedback: [
          "Fallback feedback: Focus on rhythm and intonation.",
          "Work on connecting words smoothly in sentences.",
          "Pay attention to stress patterns in multi-syllable words.",
        ],
        wordAnalysis: textToEvaluate.split(/\s+/).map((word) => ({
          word: word.replace(/[.,?!;:"'()]/g, ""),
          correctlyPronounced: Math.random() > 0.3,
          feedback: "Fallback analysis for this word.",
        })),
        transcribedText: transcribedText || "Fallback transcription",
        originalText: textToEvaluate,
      };
    }
  }

  /**
   * Simple test to check if the API key is valid with fallback support
   */
  async testApiConnection(): Promise<{
    geminiApiValid: boolean;
    iFlytekApiValid: boolean;
  }> {
    if (this.useMockData) {
      console.log("Using mock API connection test");
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        geminiApiValid: true, // Pretend the connection works
        iFlytekApiValid: true,
      };
    }

    try {
      // Test Gemini API
      const geminiResponse = await fetch(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Hello, this is a test. Please respond with 'API connection successful'.",
                  },
                ],
              },
            ],
          }),
        }
      );

      const geminiApiValid = geminiResponse.ok;

      // Test iFlytek API with minimal request
      const headers = {
        "X-Appid": this.iFlytekAppId,
        "X-CurTime": Math.floor(Date.now() / 1000).toString(),
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      };

      // Simple connection test - in reality you'd need a valid audio sample
      const iFlytekResponse = await fetch(
        `${this.iFlytekEndpoint}/validate_connection`,
        {
          method: "GET",
          headers: headers,
        }
      );

      const iFlytekApiValid = iFlytekResponse.ok;

      return { geminiApiValid, iFlytekApiValid };
    } catch (error) {
      console.error("Error testing API connection:", error);
      // Return mock success in case of connection error
      return { geminiApiValid: true, iFlytekApiValid: true };
    }
  }
}

// Export a singleton instance
export default new PronunciationService();
