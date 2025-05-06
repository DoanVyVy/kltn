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
import pronunciationService from "@/services/pronunciation-service";
import {
  PronunciationContent,
  PronunciationFeedback,
  TranscriptionResult,
  WordAnalysis,
} from "@/types/pronunciation";

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

  // Sample content for testing - this would come from API in production
  const sampleContents: PronunciationContent[] = [
    {
      id: 1,
      type: "word",
      content: "Vocabulary",
      audioUrl: "/audio/vocabulary.mp3",
      translation: "Từ vựng",
    },
    {
      id: 2,
      type: "sentence",
      content: "Learning English requires consistent practice.",
      audioUrl: "/audio/sentence1.mp3",
      translation: "Học tiếng Anh đòi hỏi thực hành đều đặn.",
    },
    {
      id: 3,
      type: "paragraph",
      content:
        "The more you practice speaking, the more confident you will become.",
      audioUrl: "/audio/paragraph1.mp3",
      translation:
        "Bạn càng luyện tập nói nhiều, bạn sẽ càng trở nên tự tin hơn.",
    },
  ];

  // Game data fetching
  const {
    data: gameData,
    isLoading: isLoadingGameData,
    isError: isErrorGameData,
  } = trpc.games.getPronunciationGame.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once
    onSuccess: (data) => {
      if (data?.content) {
        setPronunciationContents(data.content);
      } else {
        setPronunciationContents(sampleContents);
      }
      setIsLoading(false);
    },
    onError: () => {
      console.log("Error fetching game data, using sample content");
      setPronunciationContents(sampleContents);
      setIsLoading(false);
    },
  });

  // Force loading to end after 5 seconds even if API is still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Force ending loading state after timeout");
        setPronunciationContents(sampleContents);
        setIsLoading(false);
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

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
        variant: "success",
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
                variant: "success",
              });
            } else if (recentAverage < 60 && difficultyLevel > 1) {
              setDifficultyLevel((prev) => prev - 1);
              toast({
                title: "Adjusting Difficulty",
                description:
                  "We've adjusted the difficulty to help you improve.",
                variant: "info",
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
  }, [isRedirecting, redirectCountdown, router]);

  // Toggle realistic transcription and update the service config
  const toggleRealisticTranscription = () => {
    setUseRealisticTranscription(!useRealisticTranscription);
    pronunciationService.setRealisticTranscription(!useRealisticTranscription);
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

  // Initialize realistic transcription mode on component mount
  useEffect(() => {
    pronunciationService.setRealisticTranscription(useRealisticTranscription);
  }, []);

  const preprocessAudio = async (audioBlob: Blob): Promise<Blob> => {
    if (!audioContext) return audioBlob;

    try {
      setIsProcessingAudio(true);
      toast({
        title: "Processing Audio",
        description: "Enhancing audio quality for better recognition...",
        variant: "default",
      });

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const noiseThreshold = 0.01;
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);

        for (let i = 0; i < inputData.length; i++) {
          outputData[i] =
            Math.abs(inputData[i]) < noiseThreshold ? 0 : inputData[i];
        }
      }

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = newBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();

      const wavBlob = await convertToWav(renderedBuffer);

      setIsProcessingAudio(false);
      return wavBlob;
    } catch (error) {
      console.error("Error preprocessing audio:", error);
      setIsProcessingAudio(false);
      return audioBlob;
    }
  };

  const convertToWav = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numOfChannels = buffer.numberOfChannels;
      const length = buffer.length * numOfChannels * 2;
      const sampleRate = buffer.sampleRate;
      const data = new Uint8Array(44 + length);

      writeString(data, 0, "RIFF");
      data[4] = (length + 36) & 0xff;
      data[5] = ((length + 36) >> 8) & 0xff;
      data[6] = ((length + 36) >> 16) & 0xff;
      data[7] = ((length + 36) >> 24) & 0xff;
      writeString(data, 8, "WAVE");
      writeString(data, 12, "fmt ");
      data[16] = 16;
      data[20] = 1;
      data[22] = numOfChannels;
      data[24] = sampleRate & 0xff;
      data[25] = (sampleRate >> 8) & 0xff;
      data[26] = (sampleRate >> 16) & 0xff;
      data[27] = (sampleRate >> 24) & 0xff;
      const bytesPerSecond = sampleRate * numOfChannels * 2;
      data[28] = bytesPerSecond & 0xff;
      data[29] = (bytesPerSecond >> 8) & 0xff;
      data[30] = (bytesPerSecond >> 16) & 0xff;
      data[31] = (bytesPerSecond >> 24) & 0xff;
      data[32] = numOfChannels * 2;
      data[34] = 16;
      writeString(data, 36, "data");
      data[40] = length & 0xff;
      data[41] = (length >> 8) & 0xff;
      data[42] = (length >> 16) & 0xff;
      data[43] = (length >> 24) & 0xff;

      let index = 44;
      for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
          const sample = Math.max(
            -1,
            Math.min(1, buffer.getChannelData(channel)[i])
          );
          const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          data[index++] = int16 & 0xff;
          data[index++] = (int16 >> 8) & 0xff;
        }
      }

      resolve(new Blob([data], { type: "audio/wav" }));
    });
  };

  const writeString = (data: Uint8Array, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      data[offset + i] = str.charCodeAt(i);
    }
  };

  const playOriginalAudio = () => {
    if (!audioRef.current) return;

    const content = pronunciationContents[currentContentIndex];
    if (content?.audioUrl) {
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
      const processedAudioBlob = await preprocessAudio(audioBlob);

      const result = await pronunciationService.transcribeAudio(
        processedAudioBlob,
        currentContent.content,
        selectedLanguage
      );
      setTranscriptionResult(result);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast({
        title: "Transcription Error",
        description: "Could not transcribe your audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const evaluatePronunciation = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);

    try {
      const processedAudioBlob = await preprocessAudio(audioBlob);
      const currentContent = pronunciationContents[currentContentIndex];
      let transcribedText = transcriptionResult?.transcript;

      // Chỉ transcribe nếu chưa có kết quả từ trước
      if (!transcribedText) {
        setIsTranscribing(true);
        const transcription = await pronunciationService.transcribeAudio(
          processedAudioBlob,
          "", // Bỏ tham số reference text để tránh việc sử dụng nó làm fallback
          selectedLanguage
        );

        setTranscriptionResult(transcription);
        transcribedText = transcription.transcript;

        // Kiểm tra xem có phải kết quả từ fallback không
        if (
          transcription.source?.includes("reference") ||
          transcription.source?.includes("fallback")
        ) {
          toast({
            title: "Không thể nhận dạng giọng nói",
            description:
              "Không thể nhận dạng giọng nói của bạn. Vui lòng thử lại với giọng nói rõ ràng hơn.",
            variant: "warning",
          });
          setIsTranscribing(false);
          setIsProcessing(false);
          return;
        }

        setIsTranscribing(false);
      }

      // Nếu không phát hiện được giọng nói hoặc transcript rỗng
      if (!transcribedText || transcribedText.trim().length === 0) {
        toast({
          title: "Không có giọng nói",
          description:
            "Không thể nhận dạng bất kỳ giọng nói nào. Vui lòng nói rõ hơn và thử lại.",
          variant: "warning",
        });
        setIsProcessing(false);
        return;
      }

      console.log(
        "Đang đánh giá phát âm với văn bản nhận dạng:",
        transcribedText
      );

      const textToEvaluate = currentContent.content;
      const cacheKey = `${textToEvaluate}_${transcribedText}_${difficultyLevel}_${selectedLanguage}`;

      let feedback: PronunciationFeedback | null = null;

      if (pronunciationCache.has(cacheKey)) {
        feedback = pronunciationCache.get(cacheKey)!;
        console.log("Using cached pronunciation feedback");
      } else {
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries && !feedback) {
          try {
            feedback = await pronunciationService.evaluatePronunciation(
              processedAudioBlob,
              textToEvaluate,
              transcribedText,
              selectedLanguage
            );

            pronunciationCache.set(cacheKey, feedback);
          } catch (error) {
            retries++;
            console.error(`API call failed, retry ${retries}/${maxRetries}`);
            if (retries >= maxRetries) throw error;
            await new Promise((r) => setTimeout(r, 1000 * retries));
          }
        }
      }

      if (!feedback) {
        throw new Error(
          "Failed to get pronunciation feedback after multiple retries"
        );
      }

      // Cập nhật transcribedText trong feedback
      feedback.transcribedText = transcribedText;

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
        setGameWon(true);
        setGameOver(true);
        setMessage("Excellent pronunciation! You've completed this challenge.");

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
    if (!currentFeedback || !transcriptionResult) {
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
      // End of game
      setGameOver(true);
      setGameWon(true);
      setMessage("You've completed all pronunciation challenges!");

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
                    <CardTitle>Pronunciation Challenge</CardTitle>
                    <CardDescription className="text-game-accent/70">
                      {currentContent.type === "word"
                        ? "Pronounce this word correctly"
                        : currentContent.type === "sentence"
                        ? "Read this sentence with natural intonation"
                        : "Read this paragraph with clarity and fluency"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm bg-blue-50 text-blue-700 rounded-md px-2 py-1 border border-blue-100"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                      <option value="auto">Auto-detect</option>
                    </select>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                      {currentContent.type === "word"
                        ? "Word"
                        : currentContent.type === "sentence"
                        ? "Sentence"
                        : "Paragraph"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Content to pronounce */}
                <motion.div
                  className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center"
                  variants={itemVariants}
                >
                  <h3 className="text-xl md:text-2xl font-medium text-game-accent mb-2">
                    {currentContent.content}
                  </h3>
                  {currentContent.translation && (
                    <p className="text-sm text-game-accent/70">
                      {currentContent.translation}
                    </p>
                  )}
                  <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      className="rounded-full border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={playOriginalAudio}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Listen to correct pronunciation
                    </Button>
                  </motion.div>
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
                            <Button
                              variant="outline"
                              className="rounded-full border-game-primary/20"
                              onClick={startRecording}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Re-record
                            </Button>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              className="rounded-full border-game-primary/20"
                              onClick={transcribeAudio}
                              disabled={isTranscribing || !!transcriptionResult}
                            >
                              {isTranscribing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Transcribing...
                                </>
                              ) : transcriptionResult ? (
                                <>
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                  Transcribed
                                </>
                              ) : (
                                <>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Transcribe audio
                                </>
                              )}
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
                      </div>

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

                      {/* Text comparison */}
                      <Card className="border border-gray-200">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Text Comparison
                            </CardTitle>
                            <div className="flex items-center gap-1">
                              <Badge className="bg-green-100 text-green-700 border-none">
                                Correct
                              </Badge>
                              <Badge className="bg-yellow-100 text-yellow-700 border-none">
                                Added
                              </Badge>
                              <Badge className="bg-red-100 text-red-700 border-none">
                                Missed
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>{renderWordComparison()}</CardContent>
                      </Card>

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

                      <div className="flex justify-center space-x-4">
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
                    <Button
                      variant="outline"
                      className="border-game-primary/20 text-game-accent hover:bg-game-primary/10 rounded-full"
                      onClick={resetGame}
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
