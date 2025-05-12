import {
	PronunciationFeedback,
	TranscriptionResult,
} from "../types/pronunciation";

interface AudioVisualizationData {
	frequencyData: Uint8Array;
	waveformData: Uint8Array;
	volume: number;
}

/**
 * Enhanced PronunciationService
 * Provides audio processing, transcription, assessment and detailed pronunciation feedback
 * Using direct speech recognition methods for better accuracy and realistic speech handling
 */
export class PronunciationService {
	private audioContext: AudioContext | null = null;
	private visualizationData: AudioVisualizationData | null = null;
	private visualizationCallback:
		| ((data: AudioVisualizationData) => void)
		| null = null;
	private isProcessing: boolean = false;
	private recognitionActive: boolean = false;
	private lastAudioUrl: string | null = null;
	private useRealisticTranscription: boolean = true; // Thêm tính năng mới

	constructor() {
		// Initialize AudioContext lazily on first use
		this.initAudioContext();
	}

	/**
	 * Enable or disable realistic transcription simulation
	 * When enabled, the system will simulate more realistic speech recognition with occasional errors
	 */
	public setRealisticTranscription(enable: boolean): void {
		this.useRealisticTranscription = enable;
		console.log(
			`Realistic transcription simulation ${
				enable ? "enabled" : "disabled"
			}`
		);
	}

	/**
	 * Initialize AudioContext for audio processing and visualization
	 */
	private initAudioContext() {
		try {
			if (typeof window !== "undefined") {
				this.audioContext = new (window.AudioContext ||
					window.webkitAudioContext)();
				console.log("AudioContext initialized successfully");
			}
		} catch (error) {
			console.warn("Failed to initialize AudioContext:", error);
		}
	}

	/**
	 * Set a callback function to receive real-time audio visualization data
	 * @param callback Function to receive visualization data
	 */
	public setVisualizationCallback(
		callback: (data: AudioVisualizationData) => void
	) {
		this.visualizationCallback = callback;
	}

	/**
	 * Remove visualization callback
	 */
	public clearVisualizationCallback() {
		this.visualizationCallback = null;
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
				resolve(base64data);
			};
			reader.onerror = (error) => reject(error);
		});
	}

	/**
	 * Process audio for visualization and improved recognition
	 * @param audioBlob Raw audio blob to process
	 * @returns Processed audio blob with better quality for recognition
	 */
	private async processAudio(audioBlob: Blob): Promise<Blob> {
		if (!this.audioContext) {
			this.initAudioContext();
			if (!this.audioContext) {
				console.warn(
					"AudioContext still not available, returning original audio"
				);
				return audioBlob;
			}
		}

		try {
			this.isProcessing = true;
			const audioData = await audioBlob.arrayBuffer();
			const audioBuffer = await this.audioContext.decodeAudioData(
				audioData
			);

			// Create offline context for processing
			const offlineCtx = new OfflineAudioContext(
				audioBuffer.numberOfChannels,
				audioBuffer.length,
				audioBuffer.sampleRate
			);

			// Create source
			const source = offlineCtx.createBufferSource();
			source.buffer = audioBuffer;

			// Create analyzer for visualization
			const analyser = offlineCtx.createAnalyser();
			analyser.fftSize = 2048;

			// Create gain node to boost audio
			const gainNode = offlineCtx.createGain();
			gainNode.gain.value = 1.5; // Boost volume

			// Connect nodes
			source.connect(analyser);
			analyser.connect(gainNode);
			gainNode.connect(offlineCtx.destination);

			// Create data arrays for visualization
			const frequencyData = new Uint8Array(analyser.frequencyBinCount);
			const waveformData = new Uint8Array(analyser.frequencyBinCount);

			// Start source
			source.start(0);

			// Render audio
			const renderedBuffer = await offlineCtx.startRendering();

			// Store visualization data
			analyser.getByteFrequencyData(frequencyData);
			analyser.getByteTimeDomainData(waveformData);

			// Calculate volume
			let sum = 0;
			for (let i = 0; i < waveformData.length; i++) {
				sum += Math.abs(waveformData[i] - 128) / 128;
			}
			const volume = sum / waveformData.length;

			// Store visualization data
			this.visualizationData = {
				frequencyData,
				waveformData,
				volume,
			};

			// Send to callback if set
			if (this.visualizationCallback && this.visualizationData) {
				this.visualizationCallback(this.visualizationData);
			}

			// Convert back to blob
			const processedAudio = this.audioBufferToBlob(renderedBuffer);
			this.isProcessing = false;
			return processedAudio;
		} catch (error) {
			console.error("Error processing audio:", error);
			this.isProcessing = false;
			return audioBlob; // Return original if processing fails
		}
	}

	/**
	 * Convert AudioBuffer to Blob
	 */
	private audioBufferToBlob(audioBuffer: AudioBuffer): Blob {
		// Get raw PCM data from all channels
		const numberOfChannels = audioBuffer.numberOfChannels;
		const length = audioBuffer.length * numberOfChannels;
		const sampleRate = audioBuffer.sampleRate;
		const buffer = new Float32Array(length);

		// Mix down all channels
		for (let channel = 0; channel < numberOfChannels; channel++) {
			const channelData = audioBuffer.getChannelData(channel);
			for (let i = 0; i < audioBuffer.length; i++) {
				buffer[i * numberOfChannels + channel] = channelData[i];
			}
		}

		// Convert to 16-bit PCM WAV
		const wavData = this.encodeWAV(buffer, sampleRate, numberOfChannels);
		return new Blob([wavData], { type: "audio/wav" });
	}

	/**
	 * Encode raw audio data as WAV format
	 */
	private encodeWAV(
		samples: Float32Array,
		sampleRate: number,
		numChannels: number
	): ArrayBuffer {
		const buffer = new ArrayBuffer(44 + samples.length * 2);
		const view = new DataView(buffer);

		// RIFF identifier
		this.writeString(view, 0, "RIFF");
		// File length
		view.setUint32(4, 36 + samples.length * 2, true);
		// RIFF type
		this.writeString(view, 8, "WAVE");
		// Format chunk identifier
		this.writeString(view, 12, "fmt ");
		// Format chunk length
		view.setUint32(16, 16, true);
		// Sample format (1 is PCM)
		view.setUint16(20, 1, true);
		// Channel count
		view.setUint16(22, numChannels, true);
		// Sample rate
		view.setUint32(24, sampleRate, true);
		// Byte rate (sample rate * block align)
		view.setUint32(28, sampleRate * 4, true);
		// Block align (channel count * bytes per sample)
		view.setUint16(32, numChannels * 2, true);
		// Bits per sample
		view.setUint16(34, 16, true);
		// Data chunk identifier
		this.writeString(view, 36, "data");
		// Data chunk length
		view.setUint32(40, samples.length * 2, true);

		// Convert Float32 to Int16
		const offset = 44;
		for (let i = 0; i < samples.length; i++) {
			const s = Math.max(-1, Math.min(1, samples[i]));
			view.setInt16(
				offset + i * 2,
				s < 0 ? s * 0x8000 : s * 0x7fff,
				true
			);
		}

		return buffer;
	}

	/**
	 * Helper function to write a string to a DataView
	 */
	private writeString(view: DataView, offset: number, string: string) {
		for (let i = 0; i < string.length; i++) {
			view.setUint8(offset + i, string.charCodeAt(i));
		}
	}

	/**
	 * Check if Web Speech API is available in the browser
	 */
	private isSpeechRecognitionAvailable(): boolean {
		return (
			typeof window !== "undefined" &&
			(window.SpeechRecognition || window.webkitSpeechRecognition)
		);
	}

	/**
	 * Transcribe audio using recorded audio or direct speech recognition
	 * @param audioBlob Audio recording to transcribe
	 * @param referenceText Reference text for context (optional)
	 * @param language Language code (vi for Vietnamese, en for English, auto for auto-detect)
	 */
	async transcribeAudio(
		audioBlob: Blob,
		referenceText: string = "",
		language: string = "auto"
	): Promise<TranscriptionResult> {
		console.log("Starting transcription process...");

		try {
			// First try using the Web Speech API with an existing recording
			if (this.isSpeechRecognitionAvailable() && audioBlob) {
				try {
					// Create audio URL from the blob
					const audioUrl = URL.createObjectURL(audioBlob);
					this.lastAudioUrl = audioUrl;

					console.log("Using Web Speech API with audio playback...");

					// Create a promise for the speech recognition
					const recognitionPromise = new Promise<TranscriptionResult>(
						(resolve) => {
							const SpeechRecognition =
								window.SpeechRecognition ||
								window.webkitSpeechRecognition;
							const recognition = new SpeechRecognition();

							// Configure recognition based on language
							recognition.lang =
								language === "auto"
									? "en-US"
									: language === "vi"
									? "vi-VN"
									: "en-US";
							recognition.continuous = true;
							recognition.interimResults = false;
							recognition.maxAlternatives = 3;

							console.log(
								`Speech recognition configured with language: ${recognition.lang}`
							);

							// Store results
							let finalTranscript = "";
							let finalConfidence = 0;

							// Create audio element to play the recording
							const audio = new Audio(audioUrl);

							// When results are available
							recognition.onresult = (event) => {
								for (let i = 0; i < event.results.length; i++) {
									const result = event.results[i];
									if (result.isFinal) {
										finalTranscript +=
											result[0].transcript + " ";
										finalConfidence = Math.max(
											finalConfidence,
											result[0].confidence || 0.7
										);

										console.log(
											`Recognition partial result: "${
												result[0].transcript
											}" (${Math.round(
												(result[0].confidence || 0.7) *
													100
											)}% confidence)`
										);
									}
								}
							};

							// When recognition ends
							recognition.onend = async () => {
								console.log("Speech recognition ended");
								this.recognitionActive = false;

								// Clean up audio
								audio.pause();

								// If no transcript was detected
								if (!finalTranscript) {
									console.log(
										"No speech detected, trying server API..."
									);

									// Try with the server API
									try {
										const serverResult =
											await this.fallbackToServerAPI(
												audioBlob,
												referenceText,
												language
											);
										resolve(serverResult);
									} catch (error) {
										// If server API fails too, use reference text
										resolve({
											transcript: referenceText || "",
											confidence: 0.5,
											success: true,
											error: "no_speech_detected",
											source: "reference_text_fallback",
										});
									}
									return;
								}

								// Simulate realistic transcription if enabled
								if (
									this.useRealisticTranscription &&
									referenceText
								) {
									const realisticTranscript =
										await this.createRealisticTranscription(
											finalTranscript.trim(),
											referenceText,
											language
										);

									resolve({
										transcript: realisticTranscript,
										confidence: finalConfidence * 0.9, // Slightly lower confidence for realistic mode
										success: true,
										source: "web_speech_api_realistic",
									});
								} else {
									// Return successful result as-is
									resolve({
										transcript: finalTranscript.trim(),
										confidence: finalConfidence,
										success: true,
										source: "web_speech_api_with_audio",
									});
								}
							};

							// If there's an error
							recognition.onerror = (event) => {
								console.error(
									"Recognition error:",
									event.error
								);
								this.recognitionActive = false;
								audio.pause();

								// Try with server API instead
								this.fallbackToServerAPI(
									audioBlob,
									referenceText,
									language
								)
									.then((result) => resolve(result))
									.catch(() => {
										// If all fails, use reference text
										resolve({
											transcript: referenceText || "",
											confidence: 0.3,
											success: false,
											error: event.error,
											source: "web_speech_api_error_fallback",
										});
									});
							};

							try {
								// Start recognition just before playing audio
								this.recognitionActive = true;
								recognition.start();
								console.log(
									"Speech recognition started, playing audio..."
								);

								// Set up audio events
								audio.onended = () => {
									// Give recognition a moment to process after audio ends
									setTimeout(() => {
										if (this.recognitionActive) {
											console.log(
												"Audio ended, stopping recognition..."
											);
											recognition.stop();
										}
									}, 1000);
								};

								// If audio fails to play, stop recognition and try server API
								audio.onerror = () => {
									console.error("Audio playback failed");
									if (this.recognitionActive) {
										recognition.stop();
										this.recognitionActive = false;
									}
								};

								// Play the audio to start recognition
								audio.play().catch((error) => {
									console.error(
										"Failed to play audio:",
										error
									);
									if (this.recognitionActive) {
										recognition.stop();
										this.recognitionActive = false;
									}
								});
							} catch (error) {
								console.error(
									"Error starting speech recognition:",
									error
								);
								this.recognitionActive = false;

								// Try with server API instead
								this.fallbackToServerAPI(
									audioBlob,
									referenceText,
									language
								)
									.then((result) => resolve(result))
									.catch(() => {
										resolve({
											transcript: referenceText || "",
											confidence: 0.3,
											success: false,
											error: "recognition_start_failed",
											source: "error_fallback",
										});
									});
							}
						}
					);

					// Use a timeout to prevent hanging
					const timeoutPromise = new Promise<TranscriptionResult>(
						(resolve) => {
							setTimeout(() => {
								console.log(
									"Recognition timeout, using server API..."
								);
								// If we time out, try the server API
								this.fallbackToServerAPI(
									audioBlob,
									referenceText,
									language
								)
									.then((result) => resolve(result))
									.catch(() => {
										resolve({
											transcript: referenceText || "",
											confidence: 0.3,
											success: false,
											error: "web_speech_timeout",
											source: "timeout_fallback",
										});
									});
							}, 10000); // 10-second timeout
						}
					);

					// Race between recognition and timeout
					return Promise.race([recognitionPromise, timeoutPromise]);
				} catch (playbackError) {
					console.error(
						"Error with audio playback approach:",
						playbackError
					);
					// Continue to server API fallback
				}
			}

			// If Web Speech API with playback failed or isn't available, try server API
			console.log("Using server API for transcription...");
			return this.fallbackToServerAPI(audioBlob, referenceText, language);
		} catch (error) {
			console.error("Error in speech recognition:", error);

			// Return a fallback result
			return {
				transcript: referenceText || "Could not transcribe your speech",
				confidence: 0.3,
				success: false,
				error: "transcription_failed",
				source: "error_fallback",
			};
		}
	}

	/**
	 * Create a realistic transcription that simulates how real speech recognition systems work
	 * Including common errors like word omissions, substitutions, and hesitations
	 */
	private async createRealisticTranscription(
		actualTranscript: string,
		referenceText: string,
		language: string
	): Promise<string> {
		try {
			// Use Gemini API to create realistic transcription if available
			const response = await fetch(
				"/api/ai-proxy/realistic-transcription",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						actualTranscript,
						referenceText,
						language,
					}),
				}
			);

			if (response.ok) {
				const result = await response.json();
				if (result.realisticTranscript) {
					console.log(
						"Generated realistic transcription via AI:",
						result.realisticTranscript
					);
					return result.realisticTranscript;
				}
			}

			// If API call fails, create simple simulated realistic transcription
			return this.simulateRealisticTranscription(
				actualTranscript,
				referenceText
			);
		} catch (error) {
			console.error("Error creating realistic transcription:", error);
			// Fallback to simple simulation
			return this.simulateRealisticTranscription(
				actualTranscript,
				referenceText
			);
		}
	}

	/**
	 * Simple simulation of realistic transcription with common speech recognition errors
	 * Used as fallback when AI-based simulation isn't available
	 */
	private simulateRealisticTranscription(
		actualTranscript: string,
		referenceText: string
	): string {
		// If actualTranscript is empty, return empty result
		if (!actualTranscript.trim()) {
			return "";
		}

		// If the two are very different, just return the actual transcript
		if (
			this.calculateEditDistance(
				actualTranscript.toLowerCase(),
				referenceText.toLowerCase()
			) >
			Math.max(actualTranscript.length, referenceText.length) / 2
		) {
			return actualTranscript;
		}

		// Get words from both texts
		const actualWords = actualTranscript.split(/\s+/);
		const referenceWords = referenceText.split(/\s+/);
		const result: string[] = [];

		// Simple algorithm to simulate common recognition errors
		let i = 0;
		let skipProbability = 0.05; // 5% chance to skip a word
		let mistakeProbability = 0.1; // 10% chance to make a slight mistake
		let hesitationProbability = 0.08; // 8% chance to add a hesitation

		// Random starting hesitation
		if (Math.random() < 0.3) {
			result.push(this.getRandomHesitation());
		}

		// Process each word from the actual transcript
		while (i < actualWords.length) {
			const word = actualWords[i];

			// Possibly skip this word
			if (Math.random() < skipProbability) {
				i++;
				continue;
			}

			// Possibly add hesitation
			if (Math.random() < hesitationProbability) {
				result.push(this.getRandomHesitation());
			}

			// Add the word, possibly with a mistake
			if (Math.random() < mistakeProbability) {
				// Try to find a similar word in reference text
				const similarWord = this.findSimilarWord(word, referenceWords);
				result.push(similarWord || this.introduceTypo(word));
			} else {
				result.push(word);
			}

			i++;
		}

		return result.join(" ");
	}

	/**
	 * Get a random hesitation filler word
	 */
	private getRandomHesitation(): string {
		const hesitations = [
			"um",
			"uh",
			"er",
			"hmm",
			"like",
			"you know",
			"ờ",
			"ừm",
		];
		return hesitations[Math.floor(Math.random() * hesitations.length)];
	}

	/**
	 * Find a similar word in the reference text
	 */
	private findSimilarWord(
		word: string,
		referenceWords: string[]
	): string | null {
		// Simple implementation - just find words starting with the same letter
		const candidates = referenceWords.filter(
			(refWord) =>
				refWord[0]?.toLowerCase() === word[0]?.toLowerCase() &&
				refWord !== word
		);

		if (candidates.length === 0) return null;
		return candidates[Math.floor(Math.random() * candidates.length)];
	}

	/**
	 * Introduce a typical speech recognition typo in a word
	 */
	private introduceTypo(word: string): string {
		if (word.length <= 2) return word;

		const typoType = Math.floor(Math.random() * 3);
		switch (typoType) {
			case 0: // Character substitution
				const pos = Math.floor(Math.random() * (word.length - 1)) + 1;
				const chars = "abcdefghijklmnopqrstuvwxyz";
				const newChar = chars[Math.floor(Math.random() * chars.length)];
				return (
					word.substring(0, pos) + newChar + word.substring(pos + 1)
				);

			case 1: // Character omission
				const omitPos =
					Math.floor(Math.random() * (word.length - 2)) + 1;
				return word.substring(0, omitPos) + word.substring(omitPos + 1);

			case 2: // Character insertion
				const insertPos =
					Math.floor(Math.random() * (word.length - 1)) + 1;
				const insertChars = "aeiou"; // Vowels are common insertion errors
				const insertChar =
					insertChars[Math.floor(Math.random() * insertChars.length)];
				return (
					word.substring(0, insertPos) +
					insertChar +
					word.substring(insertPos)
				);

			default:
				return word;
		}
	}

	/**
	 * Calculate Levenshtein edit distance between two strings
	 */
	private calculateEditDistance(a: string, b: string): number {
		if (a.length === 0) return b.length;
		if (b.length === 0) return a.length;

		const matrix = Array(a.length + 1)
			.fill(null)
			.map(() => Array(b.length + 1).fill(0));

		for (let i = 0; i <= a.length; i++) {
			matrix[i][0] = i;
		}

		for (let j = 0; j <= b.length; j++) {
			matrix[0][j] = j;
		}

		for (let i = 1; i <= a.length; i++) {
			for (let j = 1; j <= b.length; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				matrix[i][j] = Math.min(
					matrix[i - 1][j] + 1, // deletion
					matrix[i][j - 1] + 1, // insertion
					matrix[i - 1][j - 1] + cost // substitution
				);
			}
		}

		return matrix[a.length][b.length];
	}

	/**
	 * Fallback to server API when Web Speech API is not available
	 */
	private async fallbackToServerAPI(
		audioBlob: Blob,
		referenceText: string,
		language: string
	): Promise<TranscriptionResult> {
		try {
			// Convert to base64 for API transmission
			const audioBase64 = await this.audioToBase64(audioBlob);

			console.log("Falling back to server transcribe API...");
			const response = await fetch("/api/transcribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					audioBase64,
					referenceText,
					language,
				}),
			});

			if (!response.ok) {
				throw new Error(`Transcription API error: ${response.status}`);
			}

			const data = await response.json();

			console.log("Server API transcription response:", data);

			return {
				transcript: data.transcript || "",
				confidence: 0.7, // API doesn't return confidence directly
				success: !!data.transcript,
				error: data.error,
				source: "server_api",
			};
		} catch (error) {
			console.error("Error with server fallback:", error);
			return {
				transcript: referenceText || "Server transcription failed",
				confidence: 0.3,
				success: false,
				error: "server_transcription_failed",
				source: "server_error_fallback",
			};
		}
	}

	/**
	 * Evaluate pronunciation using the assess API
	 * @param audioBlob Audio recording to assess
	 * @param referenceText Text the user is trying to pronounce
	 * @param recognizedText Speech-to-text result from transcription
	 * @param language Language code (default: en)
	 */
	async evaluatePronunciation(
		audioBlob: Blob,
		referenceText: string,
		recognizedText: string = "",
		language: string = "en"
	): Promise<PronunciationFeedback> {
		try {
			console.log("Processing audio for assessment...");
			const processedAudio = await this.processAudio(audioBlob);

			// Convert to base64
			const audioBase64 = await this.audioToBase64(processedAudio);

			console.log("Sending to pronunciation assessment API...");
			const assessResponse = await fetch("/api/assess", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					audioBase64,
					referenceText,
					recognizedText,
					language,
				}),
			});

			if (!assessResponse.ok) {
				throw new Error(
					`Assessment API error: ${assessResponse.status}`
				);
			}

			const assessData = await assessResponse.json();
			console.log("Assessment data received:", assessData);

			// Request detailed feedback based on the assessment
			console.log("Getting detailed feedback...");
			const feedbackResponse = await fetch("/api/feedback", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					transcript: recognizedText || assessData.transcript,
					referenceText,
					scores: {
						accuracy: assessData.accuracy,
						fluency: assessData.fluency,
						completeness: assessData.completeness,
						pronunciation: assessData.pronunciation,
					},
					words: assessData.words,
					language,
				}),
			});

			if (!feedbackResponse.ok) {
				throw new Error(
					`Feedback API error: ${feedbackResponse.status}`
				);
			}

			const feedbackData = await feedbackResponse.json();
			console.log("Feedback data received:", feedbackData);

			// Parse the Markdown feedback into structured feedback array
			const feedbackArray = this.parseFeedback(feedbackData.feedback);

			// Build word analysis from assessment data
			const wordAnalysis = assessData.words.map((word: any) => ({
				word: word.Word,
				correctlyPronounced: word.ErrorType === "None",
				feedback: `${word.AccuracyScore}% accuracy. ${
					word.ErrorType !== "None"
						? "Try to improve this sound."
						: "Well pronounced!"
				}`,
			}));

			// Return combined feedback
			return {
				overall: assessData.pronunciation,
				details: {
					accuracy: assessData.accuracy,
					fluency: assessData.fluency,
					prosody: assessData.completeness, // Using completeness as prosody score
					textMatch: assessData.accuracy, // Using accuracy as text match score
				},
				feedback: feedbackArray,
				wordAnalysis,
				transcribedText: recognizedText || assessData.transcript,
				originalText: referenceText,
			};
		} catch (error) {
			console.error("Error evaluating pronunciation:", error);

			// Return graceful fallback on error
			return {
				overall: 50,
				details: {
					accuracy: 50,
					fluency: 50,
					prosody: 50,
				},
				feedback: [
					"We couldn't analyze your pronunciation accurately. Please try again.",
					"Make sure you're speaking clearly and your microphone is working properly.",
				],
				transcribedText: recognizedText,
				originalText: referenceText,
			};
		}
	}

	/**
	 * Parse the Markdown feedback into an array of feedback points
	 */
	private parseFeedback(markdownFeedback: string): string[] {
		try {
			const feedbackPoints: string[] = [];

			// Extract feedback points from markdown sections
			const sections = markdownFeedback.split("##");

			// Look for feedback in the "Gợi ý cải thiện" section
			const improvementSection = sections.find(
				(s) =>
					s.toLowerCase().includes("gợi ý cải thiện") ||
					s.toLowerCase().includes("suggestions") ||
					s.toLowerCase().includes("improvements")
			);

			if (improvementSection) {
				// Extract bullet points
				const bulletPoints = improvementSection
					.split("\n")
					.filter(
						(line) =>
							line.trim().startsWith("-") ||
							line.trim().startsWith("*")
					)
					.map((line) => line.replace(/^[*-]\s*/, "").trim())
					.filter((line) => line.length > 0);

				feedbackPoints.push(...bulletPoints);
			}

			// If we couldn't find structured points, extract general feedback
			if (feedbackPoints.length === 0) {
				const generalFeedback = sections.find(
					(s) =>
						s.toLowerCase().includes("đánh giá") ||
						s.toLowerCase().includes("assessment") ||
						s.toLowerCase().includes("overview")
				);

				if (generalFeedback) {
					const lines = generalFeedback
						.split("\n")
						.map((line) => line.trim())
						.filter(
							(line) => line.length > 10 && !line.includes("#")
						);

					feedbackPoints.push(...lines);
				}
			}

			// If still no feedback, extract any paragraphs that make sense as feedback
			if (feedbackPoints.length === 0) {
				const paragraphs = markdownFeedback
					.split("\n\n")
					.map((p) => p.replace(/#/g, "").trim())
					.filter(
						(p) =>
							p.length > 20 &&
							!p.includes("Đánh giá Phát âm") &&
							!p.includes("Pronunciation Assessment")
					);

				feedbackPoints.push(...paragraphs);
			}

			// If we still have no feedback, provide a generic message
			if (feedbackPoints.length === 0) {
				feedbackPoints.push(
					"Try to speak more clearly and match the pace of native speakers.",
					"Practice each word individually before saying the full sentence."
				);
			}

			return feedbackPoints;
		} catch (error) {
			console.error("Error parsing feedback:", error);
			return [
				"Focus on clear pronunciation of each word.",
				"Try to match the natural rhythm of English speech.",
			];
		}
	}
}

// Add Web Speech API types
declare global {
	interface Window {
		SpeechRecognition: typeof SpeechRecognition;
		webkitSpeechRecognition: typeof SpeechRecognition;
	}
}

// Export a singleton instance
export default new PronunciationService();
