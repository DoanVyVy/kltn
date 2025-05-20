"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Check,
  X,
  RefreshCw,
  Clock,
  Trophy,
  Calendar,
  ChevronRight,
  Sparkles,
  Loader2,
  PlayCircle,
  Square,
  AlertCircle,
  BarChart3,
  FileText,
  ZoomIn,
  Volume,
  BadgeHelp,
  Volume2,
  Activity,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
// Replace unavailable icons with standard ones
// Using Volume2 for VolumeUp, and Activity for Waveform
import { Button } from "@/components/ui/button";
import {
  PronunciationContent,
  PronunciationFeedback,
  TranscriptionResult,
} from "@/types/pronunciation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/trpc/client";

// Audio processing utilities
const audioContext =
  typeof window !== "undefined"
    ? new (window.AudioContext || (window as any).webkitAudioContext)()
    : null;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const pulseAnimation = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
};

export default function PronunciationCheckGame() {
  const router = useRouter();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Content and game state
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [pronunciationContents, setPronunciationContents] = useState<
    PronunciationContent[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [maxRecordingTime] = useState(15); // Maximum recording time in seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] =
    useState<TranscriptionResult | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [feedbacks, setFeedbacks] = useState<PronunciationFeedback[]>([]);
  const [currentFeedback, setCurrentFeedback] =
    useState<PronunciationFeedback | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [showWordAnalysis, setShowWordAnalysis] = useState(false);
  const [audioFrequencyData, setAudioFrequencyData] = useState<number[]>([]);
  const [showWaveform, setShowWaveform] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [userPerformanceHistory, setUserPerformanceHistory] = useState<
    number[]
  >([]);
  const [pronunciationCache] = useState<Map<string, PronunciationFeedback>>(
    new Map()
  );
  const [phoneticGuides, setPhoneticGuides] = useState<Map<string, string>>(
    new Map()
  );
  const [gameStats, setGameStats] = useState({
    sessionsCompleted: 0,
    streak: 0,
    averageScore: 0,
  });
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [useRealisticTranscription, setUseRealisticTranscription] =
    useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Không còn sử dụng dữ liệu mẫu, chỉ sử dụng dữ liệu từ database
  // Game data fetching
  const {
    data: gameData,
    isLoading: isLoadingGameData,
    isError: isErrorGameData,
  } = trpc.games.getPronunciationGame.useQuery(
    {
      limit: 15,
      difficulty: difficultyLevel,
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2, // Retry twice
      onSuccess: (data) => {
        if (data?.content && data.content.length > 0) {
          console.log(
            `Received ${data.content.length} pronunciation content items`
          );
          setPronunciationContents(data.content);
          setIsLoading(false);
        } else {
          toast({
            title: "Lỗi",
            description:
              "Không tìm thấy dữ liệu phát âm. Vui lòng thử lại sau.",
            variant: "destructive",
          });
          console.error("No pronunciation content data available");
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching game data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu phát âm. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        setIsLoading(false);
      },
    }
  );

  // Force loading to end after 8 seconds even if API is still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Force ending loading state after timeout");
        setIsLoading(false);
        toast({
          title: "Tải dữ liệu quá lâu",
          description:
            "Không thể tải dữ liệu phát âm. Vui lòng kiểm tra kết nối mạng và thử lại.",
          variant: "destructive",
        });
      }
    }, 8000); // 8 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (gameData?.content) {
      setPronunciationContents(gameData.content);
      setIsLoading(false);
    }
  }, [gameData]);

  // User stats fetching
  const { data: userStats } = trpc.userProcess.getGameStats.useQuery(
    undefined,
    {
      onSuccess: (data) => {
        if (data) {
          setGameStats({
            sessionsCompleted: data.pronunciationSessions || 0,
            streak: data.streak || 0,
            averageScore: data.pronunciationScore || 0,
          });
        }
      },
    }
  );

  // Mutation to add experience when winning
  const addExperienceMutation = trpc.userProcess.addExperience.useMutation({
    onSuccess: () => {
      toast({
        title: "Experience gained!",
        description: `You earned 50 XP for completing the pronunciation check!`,
        variant: "default",
      });
    },
  });

  // Track game completion in user stats
  const completeGameMutation = trpc.userProcess.completeGame.useMutation({
    onSuccess: (data) => {
      if (data) {
        setGameStats({
          sessionsCompleted:
            data.pronunciationSessions || gameStats.sessionsCompleted,
          streak: data.streak || gameStats.streak,
          averageScore: data.pronunciationScore || gameStats.averageScore,
        });
      }
    },
  });

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (userAudioUrl) {
        URL.revokeObjectURL(userAudioUrl);
      }
    };
  }, []);

  // Fix for the "Maximum update depth exceeded" error
  useEffect(() => {
    // Only update performance history when currentFeedback changes
    if (currentFeedback) {
      // Use functional update to avoid dependency on userPerformanceHistory
      setUserPerformanceHistory((prevHistory) => {
        const newHistory = [...prevHistory, currentFeedback.overall];

        // Check for difficulty adjustment but don't update in this effect
        if (newHistory.length >= 3) {
          const recentAverage =
            newHistory.slice(-3).reduce((a, b) => a + b, 0) / 3;

          // Schedule difficulty adjustment for next render cycle
          setTimeout(() => {
            if (recentAverage > 85 && difficultyLevel < 3) {
              setDifficultyLevel((prev) => prev + 1);
              toast({
                title: "Level Up!",
                description: "You've advanced to a more challenging level!",
                variant: "default",
              });
            } else if (recentAverage < 60 && difficultyLevel > 1) {
              setDifficultyLevel((prev) => prev - 1);
              toast({
                title: "Adjusting Difficulty",
                description:
                  "We've adjusted the difficulty to help you improve.",
                variant: "default",
              });
            }
          }, 0);
        }

        return newHistory;
      });
    }
    // Only depend on currentFeedback, not on derived state
  }, [currentFeedback, toast]);

  useEffect(() => {
    if (isRedirecting && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isRedirecting && redirectCountdown === 0) {
      router.push("/games");
    }
  }, [isRedirecting, redirectCountdown, router]); // Toggle realistic transcription mode
  const toggleRealisticTranscription = () => {
    setUseRealisticTranscription(!useRealisticTranscription);
    toast({
      title: !useRealisticTranscription
        ? "Phiên âm thực tế đã bật"
        : "Phiên âm thực tế đã tắt",
      description: !useRealisticTranscription
        ? "Hệ thống sẽ mô phỏng việc nhận dạng giọng nói thực tế với các lỗi ngắt quãng tự nhiên"
        : "Hệ thống sẽ sử dụng phương pháp nhận dạng giọng nói tiêu chuẩn",
      variant: "default",
    });
  };
  // Audio processing is now handled by the pronunciation service
  // Audio conversion is now handled by the pronunciation service

  const playOriginalAudio = () => {
    if (!audioRef.current) return;
    const content = pronunciationContents[currentContentIndex];
    if (!content) {
      toast({
        title: "Content not available",
        description: "Unable to play audio for this content",
        variant: "destructive",
      });
      return;
    }

    if (content.audioUrl) {
      audioRef.current.src = content.audioUrl;
      audioRef.current.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(content.content);
      utterance.lang = selectedLanguage === "vi" ? "vi-VN" : "en-US";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const playUserAudio = () => {
    if (!userAudioUrl || !audioRef.current) return;

    audioRef.current.src = userAudioUrl;
    audioRef.current.play();
  };
  const startRecording = async () => {
    try {
      // Clear current feedback and transcription when starting a new recording
      setCurrentFeedback(null);
      setTranscriptionResult(null);

      // Clear any cached audio data or feedback
      const currentContent = getCurrentContent();
      if (currentContent) {
        const cacheKey = `${currentContent.content}_${difficultyLevel}_${selectedLanguage}`;
        pronunciationCache.delete(cacheKey);
        console.log("Cleared cached pronunciation feedback before recording");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setUserAudioUrl(url);

        setTranscriptionResult(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingTime) {
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description:
          "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    )
      return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop());
  };
  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);

    try {
      // Get the current content to use as the reference text
      const currentContent = pronunciationContents[currentContentIndex];
      if (!currentContent) {
        throw new Error("No content available to transcribe");
      }
      const promptText = currentContent.content;

      // Import the pronunciation service dynamically
      const pronunciationService = (
        await import("@/services/pronunciation-service")
      ).default;

      // Use the pronunciation service's analyzePronunciation method
      // which will handle audio processing and return analysis with transcription
      const analysisResult = await pronunciationService.analyzePronunciation(
        audioBlob,
        promptText
      );

      // Create a transcription result using the transcribed text from analysis
      // If no transcribed text is available, fall back to the prompt text
      const transcript = analysisResult.transcribedText || promptText;
      const result: TranscriptionResult = {
        transcript: transcript,
        confidence: 0.9, // We don't get a confidence score from the service
        success: true,
        source: "pronunciation-api",
      };

      setTranscriptionResult(result);

      toast({
        title: "Transcription Complete",
        description: "Your speech has been processed and analyzed",
        variant: "default",
      });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast({
        title: "Transcription Error",
        description: "Could not transcribe your audio. Please try again.",
        variant: "destructive",
      }); // Create a fallback transcription using the reference text
      const currentContent = pronunciationContents[currentContentIndex];
      const fallbackTranscript = currentContent
        ? currentContent.content
        : "No content available";
      const fallbackResult: TranscriptionResult = {
        transcript: fallbackTranscript,
        confidence: 0.5,
        success: false,
        source: "fallback",
      };
      setTranscriptionResult(fallbackResult);
    } finally {
      setIsTranscribing(false);
    }
  };
  const evaluatePronunciation = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);

    try {
      // Import the pronunciation service dynamically
      const pronunciationService = (
        await import("@/services/pronunciation-service")
      ).default;
      const currentContent = pronunciationContents[currentContentIndex];

      // Check if content exists
      if (!currentContent) {
        throw new Error("No content available to evaluate");
      }

      // Create a fallback transcription if needed
      if (!transcriptionResult) {
        const fallbackTranscription: TranscriptionResult = {
          transcript: currentContent.content, // Use reference text as fallback
          confidence: 0.8,
          success: true,
          source: "simplified-fallback",
        };
        setTranscriptionResult(fallbackTranscription);
      }

      // Use either existing transcript or fallback to reference text
      const transcribedText =
        transcriptionResult?.transcript || currentContent.content;

      console.log(
        "Đang đánh giá phát âm với văn bản tham chiếu:",
        transcribedText
      );
      const textToEvaluate = currentContent.content;
      const cacheKey = `${textToEvaluate}_${difficultyLevel}_${selectedLanguage}`;
      let feedback: PronunciationFeedback | null = null;

      // Always perform a new assessment when "try again" is used
      // Never use cached feedback to ensure we get fresh Gemini API feedback
      const isRetry = attemptsLeft < 3;
      console.log(`Is retry attempt: ${isRetry}, always using new assessment`);

      try {
        console.log("Performing new pronunciation assessment");
        // Pass the raw audio blob to the pronunciation service
        // The service will handle audio processing internally
        feedback = await pronunciationService.analyzePronunciation(
          audioBlob,
          textToEvaluate
        );
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }

      if (!feedback) {
        throw new Error(
          "Failed to get pronunciation feedback after multiple retries"
        );
      }

      // Update transcribed text in feedback if not already set
      if (!feedback.transcribedText) {
        feedback.transcribedText = transcribedText;
      }

      setCurrentFeedback(feedback);
      setFeedbacks([...feedbacks, feedback]);

      if (feedback.wordAnalysis) {
        const newPhoneticGuides = new Map(phoneticGuides);
        feedback.wordAnalysis.forEach((analysis) => {
          if (!phoneticGuides.has(analysis.word.toLowerCase())) {
            newPhoneticGuides.set(
              analysis.word.toLowerCase(),
              generatePhoneticGuide(analysis.word)
            );
          }
        });
        setPhoneticGuides(newPhoneticGuides);
      }
      const isSuccess = feedback.overall >= 75;

      if (isSuccess) {
        setMessage("Excellent pronunciation! You've completed this challenge.");

        addExperienceMutation.mutate({ amount: 50, source: "practice_game" });
        completeGameMutation.mutate({
          gameType: "pronunciation-check",
          score: feedback.overall,
          difficultyLevel: difficultyLevel,
        });

        setTimeout(() => {
          // Move to the next content instead of redirecting
          moveToNextContent();
        }, 60000);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);

        if (remaining <= 0) {
          setGameOver(true);
          setMessage("You've used all your attempts. Try again!");
        } else {
          setMessage(`Try again! You have ${remaining} attempts left.`);
          setTimeout(() => setMessage(null), 3000);
        }
      }
    } catch (error) {
      console.error("Error evaluating pronunciation:", error);
      toast({
        title: "Evaluation Error",
        description: "Could not evaluate your pronunciation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const analyzeWithDirectAPI = async () => {
    if (!audioBlob) {
      toast({
        title: "Không có bản ghi âm",
        description: "Vui lòng ghi âm giọng nói của bạn trước khi phân tích.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const currentContent = pronunciationContents[currentContentIndex];
      if (!currentContent) {
        throw new Error("No content available to analyze");
      }
      const promptText = currentContent.content;

      // Import the pronunciation service dynamically
      const pronunciationService = (
        await import("@/services/pronunciation-service")
      ).default;

      // Send the raw audio blob directly to the pronunciation service
      // The service will handle audio processing internally
      const analysisResult = await pronunciationService.analyzePronunciation(
        audioBlob,
        promptText
      );

      console.log("Direct API analysis result:", analysisResult);

      // The pronunciation service returns a PronunciationFeedback object
      const feedback = analysisResult;

      // Set feedback and update state
      setCurrentFeedback(feedback);
      setFeedbacks([...feedbacks, feedback]);

      // Create a transcription result using the feedback's transcribed text
      if (!transcriptionResult) {
        const transcription: TranscriptionResult = {
          transcript: feedback.transcribedText || promptText,
          confidence: 0.9,
          success: true,
          source: "pronunciation-service",
        };
        setTranscriptionResult(transcription);
      }

      toast({
        title: "Phân tích hoàn tất",
        description: "Đã phân tích phát âm của bạn thành công.",
      });

      // Handle success/failure based on score
      const isSuccess = feedback.overall >= 75;
      if (isSuccess) {
        setGameWon(true);
        setGameOver(true);
        setMessage("Phát âm tuyệt vời! Bạn đã hoàn thành thử thách này.");

        addExperienceMutation.mutate({ amount: 50, source: "practice_game" });
        completeGameMutation.mutate({
          gameType: "pronunciation-check",
          score: feedback.overall,
          difficultyLevel: difficultyLevel,
        });

        setTimeout(() => {
          setIsRedirecting(true);
        }, 3000);
      } else {
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);

        if (remaining <= 0) {
          setGameOver(true);
          setMessage("Bạn đã sử dụng hết lượt thử. Hãy thử lại!");
        } else {
          setMessage(`Thử lại! Bạn còn ${remaining} lượt thử.`);
          setTimeout(() => setMessage(null), 3000);
        }
      }
    } catch (error) {
      console.error("Error in direct API analysis:", error);
      toast({
        title: "Lỗi phân tích",
        description: "Không thể phân tích phát âm của bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePhoneticGuide = (word: string): string => {
    if (phoneticGuides.has(word.toLowerCase())) {
      return phoneticGuides.get(word.toLowerCase())!;
    }

    let phonetic = "/";
    const vowels = ["a", "e", "i", "o", "u"];
    const consonantClusters = ["ch", "sh", "th", "ph", "wh", "qu"];

    let i = 0;
    while (i < word.length) {
      let foundCluster = false;
      for (const cluster of consonantClusters) {
        if (
          i + cluster.length <= word.length &&
          word.substring(i, i + cluster.length).toLowerCase() === cluster
        ) {
          switch (cluster) {
            case "ch":
              phonetic += "tʃ";
              break;
            case "sh":
              phonetic += "ʃ";
              break;
            case "th":
              phonetic += "θ";
              break;
            case "ph":
              phonetic += "f";
              break;
            case "wh":
              phonetic += "w";
              break;
            case "qu":
              phonetic += "kw";
              break;
          }
          i += cluster.length;
          foundCluster = true;
          break;
        }
      }

      if (foundCluster) continue;

      const char = word[i].toLowerCase();
      if (vowels.includes(char)) {
        switch (char) {
          case "a":
            phonetic += "æ";
            break;
          case "e":
            phonetic += "ɛ";
            break;
          case "i":
            phonetic += "ɪ";
            break;
          case "o":
            phonetic += "ɒ";
            break;
          case "u":
            phonetic += "ʌ";
            break;
          default:
            phonetic += char;
        }
      } else {
        phonetic += char;
      }

      i++;
    }

    phonetic += "/";

    phoneticGuides.set(word.toLowerCase(), phonetic);

    return phonetic;
  };
  const renderWordComparison = () => {
    if (!currentFeedback || !transcriptionResult || !currentContent) {
      return (
        <div className="text-gray-500 italic">
          Text comparison not available
        </div>
      );
    }

    const originalWords = currentContent.content.split(/\s+/);
    const transcribedWords = transcriptionResult.transcript?.split(/\s+/) || [];

    return (
      <div className="p-2 bg-white rounded-lg">
        <div className="mb-3">
          <h4 className="text-sm font-medium">Original Text:</h4>
          <p className="p-2 bg-gray-50 rounded border border-gray-100">
            {originalWords.map((word, index) => (
              <span
                key={`orig-${index}`}
                className="inline-block bg-green-100 text-green-800 rounded px-1 py-0.5 m-0.5"
              >
                {word}
              </span>
            ))}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium">Your Speech:</h4>
          <p className="p-2 bg-gray-50 rounded border border-gray-100">
            {transcribedWords.length === 0 ? (
              <span className="text-gray-500 italic">No speech detected</span>
            ) : (
              transcribedWords.map((word, index) => {
                const isInOriginal = originalWords.some(
                  (w) => w.toLowerCase() === word.toLowerCase()
                );
                return (
                  <span
                    key={`trans-${index}`}
                    className={`inline-block rounded px-1 py-0.5 m-0.5 ${
                      isInOriginal
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {word}
                  </span>
                );
              })
            )}
          </p>
        </div>

        {originalWords.some(
          (word) =>
            !transcribedWords.some(
              (w) => w.toLowerCase() === word.toLowerCase()
            )
        ) && (
          <div className="mt-3">
            <h4 className="text-sm font-medium">Missing Words:</h4>
            <p className="p-2 bg-gray-50 rounded border border-gray-100">
              {originalWords
                .filter(
                  (word) =>
                    !transcribedWords.some(
                      (w) => w.toLowerCase() === word.toLowerCase()
                    )
                )
                .map((word, index) => (
                  <span
                    key={`miss-${index}`}
                    className="inline-block bg-red-100 text-red-800 rounded px-1 py-0.5 m-0.5"
                  >
                    {word}
                  </span>
                ))}
            </p>
          </div>
        )}
      </div>
    );
  };
  const resetGame = () => {
    resetStates();
    setAttemptsLeft(3);
    // Clear any cached pronunciation feedback for the current content
    const currentContent = getCurrentContent();
    if (currentContent) {
      // Clear all related cache entries to ensure fresh feedback
      const cacheKey = `${currentContent.content}_${difficultyLevel}_${selectedLanguage}`;
      pronunciationCache.delete(cacheKey);

      // Also clear any other cache entries for this content (with different difficulty/language)
      pronunciationCache.forEach((value, key) => {
        if (key.includes(currentContent.content)) {
          pronunciationCache.delete(key);
        }
      });

      console.log("Pronunciation cache cleared for current content");
    }

    // Reset feedback and transcription
    setCurrentFeedback(null);
    setTranscriptionResult(null);
  };

  const renderWaveform = () => {
    if (!showWaveform || audioFrequencyData.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <Activity className="h-4 w-4 mr-2 text-game-primary" />
          Audio Waveform
        </h4>
        <div className="relative h-24 bg-gray-50 rounded-lg overflow-hidden p-2 border border-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-end h-full w-full px-2">
              {audioFrequencyData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 mx-px bg-game-primary/70 rounded-t"
                  style={{
                    height: `${Math.max(4, value)}%`,
                    opacity: value > 50 ? 1 : 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWordAnalysis = () => {
    if (
      !currentFeedback?.wordAnalysis ||
      currentFeedback.wordAnalysis.length === 0
    ) {
      return (
        <div className="italic text-gray-500 text-center py-3">
          Word analysis not available
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {currentFeedback.wordAnalysis.map((analysis, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              analysis.correctlyPronounced
                ? "bg-green-50 border border-green-100"
                : "bg-red-50 border border-red-100"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="font-medium">{analysis.word}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {phoneticGuides.get(analysis.word.toLowerCase()) ||
                    generatePhoneticGuide(analysis.word)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1 text-gray-400 hover:text-game-primary"
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(
                      analysis.word
                    );
                    utterance.lang =
                      selectedLanguage === "vi" ? "vi-VN" : "en-US";
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                  }}
                >
                  <Volume className="h-3 w-3" />
                </Button>
              </div>
              {analysis.correctlyPronounced ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-700">{analysis.feedback}</p>
          </div>
        ))}
      </div>
    );
  };

  const resetStates = () => {
    setCurrentFeedback(null);
    setTranscriptionResult(null);
    setAudioBlob(null);
    setUserAudioUrl(null);
    setAttemptsLeft(3);
    setMessage(null);
    setGameWon(false);
    setGameOver(false);
    setShowWordAnalysis(false);
    setShowWaveform(false);
    setAudioFrequencyData([]);
  };

  const getCurrentContent = () => {
    if (pronunciationContents.length >= 3) {
      const contentGroups = [
        pronunciationContents.filter((c) => c.type === "word"),
        pronunciationContents.filter((c) => c.type === "sentence"),
        pronunciationContents.filter((c) => c.type === "paragraph"),
      ];

      const levelContents =
        contentGroups[difficultyLevel - 1] || pronunciationContents;

      const contentIndex = currentContentIndex % levelContents.length;
      return (
        levelContents[contentIndex] ||
        pronunciationContents[currentContentIndex]
      );
    }

    return pronunciationContents[currentContentIndex];
  };
  const moveToNextContent = () => {
    if (currentContentIndex < pronunciationContents.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
      resetStates();
    } else {
      // End of game - completed all content
      setGameOver(true);
      setGameWon(true);
      setMessage(
        "Congratulations! You've completed all pronunciation challenges!"
      );

      // Award XP if not already awarded
      if (!gameWon) {
        addExperienceMutation.mutate({ amount: 50, source: "practice_game" });
        completeGameMutation.mutate({
          gameType: "pronunciation-check",
          score: currentFeedback?.overall || 75,
          difficultyLevel: difficultyLevel,
        });
      }

      // Start redirect countdown after a delay
      setTimeout(() => {
        setIsRedirecting(true);
      }, 3000);
    }
  };

  const currentContent = getCurrentContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-background to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-game-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-game-accent">Loading pronunciation challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-background to-white">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-game-accent hover:bg-white/50 rounded-full"
            onClick={() => router.push("/games")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
        </motion.div>

        <motion.div
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-game-accent mb-2">
              Pronunciation Check
              <motion.span
                className="inline-block ml-2"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <Sparkles className="h-5 w-5 text-amber-500" />
              </motion.span>
            </h1>
            <p className="text-game-accent/80 flex items-center">
              Practice your English pronunciation with AI feedback
              <Badge
                variant="outline"
                className={`ml-4 ${
                  difficultyLevel === 1
                    ? "bg-green-50 text-green-700"
                    : difficultyLevel === 2
                    ? "bg-blue-50 text-blue-700"
                    : "bg-purple-50 text-purple-700"
                }`}
              >
                Level {difficultyLevel}
              </Badge>
              {/* Settings button */}
              <Button
                variant="ghost"
                size="icon"
                className="ml-4 text-game-accent/70 hover:text-game-accent hover:bg-white/50"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </p>
          </motion.div>

          {/* Right side - Attempts indicator */}
          <motion.div
            className="flex items-center gap-4 mt-4 md:mt-0"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                attemptsLeft <= 1
                  ? {
                      scale: [1, 1.05, 1],
                      transition: {
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                      },
                    }
                  : {}
              }
            >
              <Badge
                variant="outline"
                className={`bg-white text-game-accent border-game-primary/20 px-3 py-1.5 text-sm rounded-full shadow-sm ${
                  attemptsLeft <= 1 ? "border-red-500" : ""
                }`}
              >
                <Clock
                  className={`mr-2 h-4 w-4 ${
                    attemptsLeft <= 1 ? "text-red-500" : "text-amber-500"
                  }`}
                />
                {attemptsLeft} attempts left
              </Badge>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Settings panel (collapsible) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Card className="border-dashed border-game-primary/30 bg-white/80">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-game-primary" />
                    Cài đặt nhận dạng giọng nói
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 py-2">
                  <div className="flex items-center justify-between bg-game-primary/5 p-3 rounded-lg">
                    <div>
                      <h3 className="font-medium text-game-accent">
                        Phiên âm thực tế
                      </h3>
                      <p className="text-sm text-game-accent/70 max-w-lg">
                        Khi bật, hệ thống sẽ mô phỏng việc nhận dạng giọng nói
                        thực tế với các lỗi và ngắt quãng tự nhiên như trong các
                        hệ thống thực tế. Điều này giúp bạn tập làm quen với
                        việc đọc, lỗi ngắt quãng, lặp từ, và các lỗi phổ biến.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`p-0 h-12 w-12 ${
                        useRealisticTranscription
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                      onClick={toggleRealisticTranscription}
                    >
                      {useRealisticTranscription ? (
                        <ToggleRight className="h-12 w-12" />
                      ) : (
                        <ToggleLeft className="h-12 w-12" />
                      )}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <p className="text-xs text-game-accent/60 italic">
                    Thiết lập này giúp phần mềm nhận dạng giống với giọng nói
                    thực tế. Nếu bạn gặp vấn đề với việc nhận dạng, hãy thử tắt
                    tính năng này.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Game area */}
          <motion.div
            className="md:col-span-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="bg-white border-0 shadow-lg rounded-xl text-game-accent overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    {" "}
                    <CardTitle>Pronunciation Challenge</CardTitle>
                    <CardDescription className="text-game-accent/70">
                      {currentContent && currentContent.type === "word"
                        ? "Pronounce this word correctly"
                        : currentContent && currentContent.type === "sentence"
                        ? "Read this sentence with natural intonation"
                        : currentContent
                        ? "Read this paragraph with clarity and fluency"
                        : "Loading content..."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Content to pronounce */}{" "}
                <motion.div
                  className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center"
                  variants={itemVariants}
                >
                  <h3 className="text-xl md:text-2xl font-medium text-game-accent mb-2">
                    {currentContent
                      ? currentContent.content
                      : "Loading content..."}
                  </h3>
                  {currentContent && currentContent.translation && (
                    <p className="text-sm text-game-accent/70">
                      {currentContent.translation}
                    </p>
                  )}{" "}
                  {currentContent && (
                    <motion.div
                      className="mt-4"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    ></motion.div>
                  )}
                </motion.div>
                {/* Display waveform when available */}
                {showWaveform && renderWaveform()}
                {/* Transcription result */}
                <AnimatePresence>
                  {transcriptionResult && !isProcessing && !currentFeedback && (
                    <motion.div
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Speech Recognition Result
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(transcriptionResult.confidence * 100)}%
                          confidence
                        </Badge>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-100">
                        {transcriptionResult.transcript ? (
                          <p className="text-gray-800">
                            {transcriptionResult.transcript}
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">
                            No speech detected. Please try again.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Recording controls */}
                {!gameOver && !currentFeedback && (
                  <motion.div
                    className="flex flex-col items-center space-y-4"
                    variants={itemVariants}
                  >
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-game-primary"
                        style={{
                          width: `${(recordingTime / maxRecordingTime) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="text-center text-sm text-game-accent/70">
                      {isRecording
                        ? `Recording: ${recordingTime}s / ${maxRecordingTime}s`
                        : "Press the mic button to start recording"}
                    </div>

                    {isRecording ? (
                      <motion.div
                        className="flex flex-col items-center space-y-2"
                        animate="pulse"
                        variants={pulseAnimation}
                      >
                        <motion.div
                          className="h-16 w-16 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={stopRecording}
                        >
                          <Square className="h-8 w-8 text-red-500" />
                        </motion.div>
                        <span className="text-sm font-medium text-red-500">
                          Stop
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="flex flex-col items-center space-y-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="h-16 w-16 rounded-full bg-game-primary/10 border-4 border-game-primary flex items-center justify-center cursor-pointer"
                          onClick={startRecording}
                        >
                          <Mic className="h-8 w-8 text-game-primary" />
                        </motion.div>
                        <span className="text-sm font-medium text-game-accent">
                          Record your pronunciation
                        </span>
                      </motion.div>
                    )}

                    {userAudioUrl && !isRecording && (
                      <div className="mt-4 flex flex-col items-center space-y-4">
                        <div className="flex flex-wrap justify-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              className="rounded-full border-game-primary/20"
                              onClick={playUserAudio}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Play recording
                            </Button>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {" "}
                            <Button
                              variant="outline"
                              className="rounded-full border-game-primary/20"
                              onClick={() => {
                                // Clear any cached result for the current content before re-recording
                                const currentContent = getCurrentContent();
                                if (currentContent) {
                                  const cacheKey = `${currentContent.content}_${difficultyLevel}_${selectedLanguage}`;
                                  pronunciationCache.delete(cacheKey);
                                }
                                startRecording();
                              }}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Re-record
                            </Button>
                          </motion.div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="game-button rounded-full"
                            onClick={evaluatePronunciation}
                            disabled={isProcessing || isProcessingAudio}
                          >
                            {isProcessing || isProcessingAudio ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isProcessingAudio
                                  ? "Enhancing audio..."
                                  : "Analyzing..."}
                              </>
                            ) : (
                              <>Submit for evaluation</>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}
                {/* Feedback display */}
                <AnimatePresence>
                  {currentFeedback && (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-medium mb-2">
                          Pronunciation Feedback
                        </h3>
                        <div className="inline-block rounded-full bg-white px-4 py-2 border shadow-sm">
                          <div className="flex items-center justify-center">
                            <span
                              className={`text-2xl font-bold ${
                                currentFeedback.overall >= 75
                                  ? "text-green-600"
                                  : currentFeedback.overall >= 60
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {currentFeedback.overall}%
                            </span>
                            <span className="ml-1 text-sm text-game-accent/70">
                              overall score
                            </span>
                          </div>
                        </div>
                      </div>{" "}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Accuracy
                          </h4>
                          <div className="relative pt-1">
                            <Progress
                              value={currentFeedback.details.accuracy}
                              className="h-2"
                            />
                            <span className="text-lg font-medium text-game-primary mt-1 block">
                              {currentFeedback.details.accuracy}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Fluency
                          </h4>
                          <div className="relative pt-1">
                            <Progress
                              value={currentFeedback.details.fluency}
                              className="h-2"
                            />
                            <span className="text-lg font-medium text-game-primary mt-1 block">
                              {currentFeedback.details.fluency}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Intonation
                          </h4>
                          <div className="relative pt-1">
                            <Progress
                              value={currentFeedback.details.prosody}
                              className="h-2"
                            />
                            <span className="text-lg font-medium text-game-primary mt-1 block">
                              {currentFeedback.details.prosody}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">
                            Text Match
                          </h4>
                          <div className="relative pt-1">
                            <Progress
                              value={currentFeedback.details.textMatch || 0}
                              className="h-2"
                            />
                            <span className="text-lg font-medium text-game-primary mt-1 block">
                              {currentFeedback.details.textMatch || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Voice Metrics - Pitch & Energy */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                            <Volume2 className="h-4 w-4 mr-2 text-blue-500" />
                            Pitch Mean
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-medium text-blue-600">
                              {currentFeedback.pitchMean?.toFixed(2) || "N/A"}{" "}
                              Hz
                            </span>
                            <div className="bg-white p-2 rounded-lg">
                              <Badge className="bg-blue-100 text-blue-700 border-none">
                                {currentFeedback.pitchMean &&
                                currentFeedback.pitchMean > 180
                                  ? "High pitch"
                                  : currentFeedback.pitchMean &&
                                    currentFeedback.pitchMean > 120
                                  ? "Normal pitch"
                                  : "Low pitch"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Average pitch of your voice. Optimal range varies by
                            gender/age.
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-purple-500" />
                            Energy Mean
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-medium text-purple-600">
                              {currentFeedback.energyMean?.toFixed(4) || "N/A"}
                            </span>
                            <div className="bg-white p-2 rounded-lg">
                              <Badge className="bg-purple-100 text-purple-700 border-none">
                                {currentFeedback.energyMean &&
                                currentFeedback.energyMean > 0.025
                                  ? "Strong voice"
                                  : currentFeedback.energyMean &&
                                    currentFeedback.energyMean > 0.01
                                  ? "Average volume"
                                  : "Low volume"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Voice loudness/intensity. Higher values indicate
                            stronger pronunciation.
                          </p>
                        </div>
                      </div>
                      {/* Word Analysis (collapsible) */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="bg-gray-50 p-3 flex items-center justify-between cursor-pointer"
                          onClick={() => setShowWordAnalysis(!showWordAnalysis)}
                        >
                          <h3 className="font-medium text-game-accent flex items-center">
                            <ZoomIn className="mr-2 h-4 w-4" />
                            Detailed Word Analysis with IPA Phonetics
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${
                                showWordAnalysis ? "rotate-90" : ""
                              }`}
                            />
                          </Button>
                        </div>

                        {showWordAnalysis && (
                          <div className="p-3">
                            <div className="flex items-center mb-3 text-sm text-gray-500">
                              <BadgeHelp className="h-4 w-4 mr-1" />
                              <span>
                                Tap on the speaker icon to hear the correct
                                pronunciation of each word
                              </span>
                            </div>
                            {renderWordAnalysis()}
                          </div>
                        )}
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Feedback & Tips
                        </h4>
                        <ul className="space-y-2 pl-4">
                          {currentFeedback.feedback.map((tip, index) => (
                            <li
                              key={index}
                              className="text-game-accent list-disc"
                            >
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Phoneme Analysis Section */}
                      {currentFeedback.expectedPhonemes &&
                        currentFeedback.expectedPhonemes.length > 0 && (
                          <Card className="border border-gray-200 mt-4">
                            <CardHeader className="py-3">
                              <CardTitle className="text-base flex items-center">
                                <BadgeHelp className="h-4 w-4 mr-2 text-amber-500" />
                                Phoneme Analysis
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 text-xs h-6 hover:bg-amber-50"
                                  onClick={() => {
                                    toast({
                                      title: "Phoneme Analysis",
                                      description:
                                        "Phonemes are the smallest units of sound that distinguish one word from another. This analysis compares the expected phonemes with what you actually pronounced.",
                                      variant: "default",
                                    });
                                  }}
                                >
                                  What's this?
                                </Button>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                                      Expected Phonemes
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-1 border border-gray-100">
                                      {currentFeedback.expectedPhonemes?.map(
                                        (phoneme, index) => (
                                          <Badge
                                            key={`exp-${index}`}
                                            variant="outline"
                                            className="bg-blue-50 text-blue-700 border-blue-100"
                                          >
                                            {phoneme}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                                      Your Phonemes
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-1 border border-gray-100">
                                      {currentFeedback.userPhonemes?.map(
                                        (phoneme, index) => (
                                          <Badge
                                            key={`user-${index}`}
                                            variant="outline"
                                            className={
                                              currentFeedback.correctPhonemes?.includes(
                                                phoneme
                                              )
                                                ? "bg-green-50 text-green-700 border-green-100"
                                                : "bg-red-50 text-red-700 border-red-100"
                                            }
                                          >
                                            {phoneme}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                                      Correct Phonemes
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-3 min-h-[80px] flex flex-wrap gap-1 border border-gray-100">
                                      {currentFeedback.correctPhonemes?.map(
                                        (phoneme, index) => (
                                          <Badge
                                            key={`corr-${index}`}
                                            variant="outline"
                                            className="bg-green-50 text-green-700 border-green-100"
                                          >
                                            {phoneme}
                                          </Badge>
                                        )
                                      )}
                                      {currentFeedback.correctPhonemes &&
                                        currentFeedback.expectedPhonemes &&
                                        currentFeedback.correctPhonemes
                                          .length === 0 && (
                                          <span className="text-gray-400 italic text-sm">
                                            No correct phonemes detected
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </div>

                                {currentFeedback.mistakes &&
                                  currentFeedback.mistakes.length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                                        Pronunciation Errors
                                      </h4>
                                      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                        <table className="w-full text-sm">
                                          <thead>
                                            <tr className="text-left text-gray-500">
                                              <th className="p-2">Position</th>
                                              <th className="p-2">Expected</th>
                                              <th className="p-2">You said</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {currentFeedback.mistakes.map(
                                              (mistake, index) => (
                                                <tr
                                                  key={`mistake-${index}`}
                                                  className="border-t border-red-200"
                                                >
                                                  <td className="p-2">
                                                    {mistake.position + 1}
                                                  </td>
                                                  <td className="p-2">
                                                    <Badge className="bg-blue-100 text-blue-700 border-none">
                                                      {mistake.expected}
                                                    </Badge>
                                                  </td>
                                                  <td className="p-2">
                                                    <Badge className="bg-red-100 text-red-700 border-none">
                                                      {mistake.actual}
                                                    </Badge>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      {/* Phoneme Explainer - Help users understand phoneme analysis */}
                      {currentFeedback.expectedPhonemes &&
                        currentFeedback.expectedPhonemes.length > 0 && (
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                            <div className="flex items-start">
                              <BadgeHelp className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-amber-800 mb-1">
                                  Understanding Phoneme Analysis
                                </h4>
                                <div className="text-sm text-amber-700">
                                  <p className="mb-1">
                                    Phonemes are distinct units of sound in a
                                    language. Improving your pronunciation means
                                    getting better at producing the correct
                                    phonemes.
                                  </p>
                                  <ul className="list-disc list-inside space-y-1 text-xs">
                                    <li>
                                      <span className="font-medium">
                                        Expected phonemes
                                      </span>
                                      : The sounds you should make for perfect
                                      pronunciation
                                    </li>
                                    <li>
                                      <span className="font-medium">
                                        Your phonemes
                                      </span>
                                      : The sounds we detected in your speech
                                    </li>
                                    <li>
                                      <span className="font-medium">
                                        Correct phonemes
                                      </span>
                                      : The sounds you pronounced correctly
                                    </li>
                                    <li>
                                      <span className="font-medium">
                                        Pitch &amp; Energy
                                      </span>
                                      : Your voice characteristics that affect
                                      how natural you sound
                                    </li>
                                  </ul>
                                  <p className="mt-2 text-xs">
                                    Focus on the mistakes highlighted in red and
                                    try to match the expected phonemes for
                                    better scores.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      <div className="flex justify-center space-x-4 mt-4">
                        {!gameOver && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              className="rounded-full border-game-primary/20"
                              onClick={resetGame}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Try Again
                            </Button>
                          </motion.div>
                        )}

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="game-button rounded-full"
                            onClick={moveToNextContent}
                          >
                            Next Challenge
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Message alert */}
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert
                        className={`${
                          gameWon
                            ? "bg-green-50 border-green-200 text-green-700"
                            : gameOver
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        } rounded-xl`}
                      >
                        <AlertDescription>
                          {message}
                          {gameWon && (
                            <span className="ml-2 font-semibold">+50 XP</span>
                          )}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              {gameOver && !isRedirecting && (
                <CardFooter className="flex justify-between">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {" "}
                    <Button
                      variant="outline"
                      className="border-game-primary/20 text-game-accent hover:bg-game-primary/10 rounded-full"
                      onClick={() => {
                        resetGame();
                        // Start recording immediately after reset
                        setTimeout(() => startRecording(), 100);
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </motion.div>

                  {gameWon && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        delay: 0.5,
                      }}
                    >
                      <Button
                        className="game-button rounded-full"
                        onClick={() => router.push("/games")}
                      >
                        Back to Games
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </CardFooter>
              )}

              {/* Redirect countdown */}
              {isRedirecting && (
                <CardFooter>
                  <div className="w-full text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-game-accent/70"
                    >
                      Going back to games in{" "}
                      <span className="font-bold text-game-primary">
                        {redirectCountdown}
                      </span>{" "}
                      seconds...
                    </motion.div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </motion.div>

          {/* Stats and info */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-white border-0 shadow-lg rounded-xl text-game-accent">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-amber-500" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
                      whileHover={{
                        y: -5,
                        backgroundColor: "rgba(215, 108, 130, 0.05)",
                      }}
                    >
                      <motion.div
                        className="text-2xl font-bold text-game-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          delay: 0.2,
                        }}
                      >
                        {gameStats.sessionsCompleted}
                      </motion.div>
                      <div className="text-sm text-game-accent/70">
                        Sessions Completed
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100"
                      whileHover={{
                        y: -5,
                        backgroundColor: "rgba(215, 108, 130, 0.05)",
                      }}
                    >
                      <motion.div
                        className="text-2xl font-bold text-game-primary"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          delay: 0.3,
                        }}
                      >
                        {gameStats.averageScore}%
                      </motion.div>
                      <div className="text-sm text-game-accent/70">
                        Average Score
                      </div>
                    </motion.div>
                  </div>

                  {/* Difficulty level indicator */}
                  <motion.div
                    className={`border rounded-xl p-3 text-center ${
                      difficultyLevel === 1
                        ? "bg-green-50 border-green-100 text-green-700"
                        : difficultyLevel === 2
                        ? "bg-blue-50 border-blue-100 text-blue-700"
                        : "bg-purple-50 border-purple-100 text-purple-700"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-medium flex items-center justify-center">
                      <BadgeHelp className="h-4 w-4 mr-1" />
                      Current Difficulty Level
                    </h3>
                    <p className="text-sm mt-1">
                      {difficultyLevel === 1
                        ? "Beginner - Focus on single words and simple sentences"
                        : difficultyLevel === 2
                        ? "Intermediate - Longer sentences with varied intonation"
                        : "Advanced - Complex paragraphs and fluent speech"}
                    </p>
                    <div className="mt-2 bg-white/50 rounded-full h-2 w-full">
                      <div
                        className={`h-2 rounded-full ${
                          difficultyLevel === 1
                            ? "bg-green-500 w-1/3"
                            : difficultyLevel === 2
                            ? "bg-blue-500 w-2/3"
                            : "bg-purple-500 w-full"
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* Experience reward highlight */}
                  <motion.div
                    className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-medium text-amber-700 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Reward
                    </h3>
                    <p className="text-sm text-amber-600">
                      Complete this challenge for{" "}
                      <span className="font-bold">50 XP</span>
                    </p>
                  </motion.div>

                  {/* Pronunciation score chart */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1 text-game-primary" />
                      Recent Scores
                    </h3>
                    <div className="h-24 flex items-end justify-between">
                      {[...feedbacks]
                        .reverse()
                        .slice(0, 5)
                        .map((feedback, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-end"
                          >
                            <div
                              className="w-6 rounded-t-sm"
                              style={{
                                height: `${(feedback.overall / 100) * 80}px`,
                                backgroundColor:
                                  feedback.overall >= 75
                                    ? "#22c55e"
                                    : "#f97316",
                              }}
                            />
                            <div className="text-xs mt-1 text-gray-500">
                              {feedback.overall}%
                            </div>
                          </div>
                        ))}
                      {/* Fill with empty placeholders if not enough data */}
                      {Array.from({
                        length: Math.max(0, 5 - feedbacks.length),
                      }).map((_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className="flex flex-col items-center justify-end"
                        >
                          <div className="w-6 h-0 rounded-t-sm bg-gray-200" />
                          <div className="text-xs mt-1 text-gray-300">-</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audio processing info */}
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-medium mb-2 flex items-center text-blue-700">
                      <Activity className="h-4 w-4 mr-2" />
                      Multi-language Support
                    </h3>
                    <p className="text-sm text-blue-700/80">
                      {selectedLanguage === "vi"
                        ? "Bạn đang sử dụng chế độ tiếng Việt. Hệ thống sẽ nhận dạng và đánh giá phát âm tiếng Việt."
                        : selectedLanguage === "auto"
                        ? "Auto-detect mode will try to recognize the language you're speaking."
                        : "English mode is selected. The system will evaluate English pronunciation."}
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">How to Play</h3>
                    <ul className="space-y-2 text-sm text-game-accent/70 list-disc list-inside">
                      <li>Listen to the correct pronunciation</li>
                      <li>Record yourself saying the word/sentence</li>
                      <li>Submit your recording for AI evaluation</li>
                      <li>Review your score and detailed feedback</li>
                      <li>Use the phonetic guides to improve pronunciation</li>
                      <li>You need to achieve at least 75% to pass</li>
                      <li>Practice consistently to unlock harder levels</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
