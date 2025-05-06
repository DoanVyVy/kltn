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
  VolumeUp,
  Loader2,
  PlayCircle,
  Square,
  AlertCircle,
  BarChart3,
  FileText,
  ZoomIn,
} from "lucide-react";
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

  const [gameStats, setGameStats] = useState({
    sessionsCompleted: 0,
    streak: 0,
    averageScore: 0,
  });

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

  // Game data fetching - Sửa đổi API endpoint từ games.getDailyGame sang một endpoint khác phù hợp
  const { data: gameData, isLoading: isLoadingGameData } =
    trpc.games.getPronunciationGame.useQuery(undefined, {
      staleTime: 1000 * 60 * 5, // 5 minutes
      onSuccess: (data) => {
        if (data?.content) {
          // Sử dụng dữ liệu từ API
          setPronunciationContents(data.content);
        } else {
          setPronunciationContents(sampleContents);
        }
        setIsLoading(false);
      },
      onError: () => {
        // Fallback to sample content if API fails
        setPronunciationContents(sampleContents);
        setIsLoading(false);
      },
    });

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

  // Handle automatic redirection after winning
  useEffect(() => {
    if (isRedirecting && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (isRedirecting && redirectCountdown === 0) {
      // Chuyển hướng đến trang games chính thay vì daily-games
      router.push("/games");
    }
  }, [isRedirecting, redirectCountdown, router]);

  const playOriginalAudio = () => {
    if (!audioRef.current) return;

    const content = pronunciationContents[currentContentIndex];
    if (content?.audioUrl) {
      audioRef.current.src = content.audioUrl;
      audioRef.current.play();
    } else {
      // If no audio URL, use speech synthesis
      const utterance = new SpeechSynthesisUtterance(content.content);
      utterance.lang = "en-US";
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

        // Reset transcription when recording a new attempt
        setTranscriptionResult(null);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Set up timer
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

    // Close audio tracks
    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop());
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);

    try {
      // Call the speech-to-text service
      const result = await pronunciationService.transcribeAudio(audioBlob);
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
      // First transcribe the audio if not already done
      let transcribedText = transcriptionResult?.transcript;

      if (!transcribedText) {
        setIsTranscribing(true);
        const transcription = await pronunciationService.transcribeAudio(
          audioBlob
        );
        setTranscriptionResult(transcription);
        transcribedText = transcription.transcript;
        setIsTranscribing(false);
      }

      // Now evaluate the pronunciation with the text and audio
      const currentContent = pronunciationContents[currentContentIndex];
      const textToEvaluate = currentContent.content;

      const feedback = await pronunciationService.evaluatePronunciation(
        audioBlob,
        textToEvaluate,
        transcribedText
      );

      setCurrentFeedback(feedback);
      setFeedbacks([...feedbacks, feedback]);

      // Check if game is won or over
      const isSuccess = feedback.overall >= 75; // Consider 75% as passing score

      if (isSuccess) {
        setGameWon(true);
        setGameOver(true);
        setMessage("Excellent pronunciation! You've completed this challenge.");

        // Award XP and update game stats
        addExperienceMutation.mutate({ amount: 50, source: "practice_game" });
        completeGameMutation.mutate({ gameType: "pronunciation-check" });

        // Start redirect countdown after a delay
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
        completeGameMutation.mutate({ gameType: "pronunciation-check" });
      }

      // Start redirect countdown after a delay
      setTimeout(() => {
        setIsRedirecting(true);
      }, 3000);
    }
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
  };

  const resetGame = () => {
    resetStates();
  };

  /**
   * Display function to highlight correctly and incorrectly pronounced words
   */
  const renderWordComparison = () => {
    if (
      !currentFeedback?.transcribedText ||
      !currentFeedback?.wordAnalysis ||
      currentFeedback.wordAnalysis.length === 0
    ) {
      return (
        <div className="italic text-gray-500 text-center py-3">
          Word analysis not available
        </div>
      );
    }

    // Map of words to their analysis
    const wordAnalysisMap = new Map<string, WordAnalysis>();
    currentFeedback.wordAnalysis.forEach((analysis) => {
      wordAnalysisMap.set(analysis.word.toLowerCase(), analysis);
    });

    // Original text words
    const originalWords = currentFeedback.originalText?.split(/\s+/) || [];

    // Transcribed text words
    const transcribedWords = currentFeedback.transcribedText.split(/\s+/);

    return (
      <div className="space-y-4">
        {/* Original text */}
        <div className="bg-slate-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Target Text:
          </h4>
          <div className="flex flex-wrap gap-1">
            {originalWords.map((word, index) => {
              const cleanWord = word.replace(/[.,?!;:"'()]/g, "").toLowerCase();
              const analysis = wordAnalysisMap.get(cleanWord);

              return (
                <span
                  key={`original-${index}`}
                  className={`px-1 py-0.5 rounded ${
                    analysis
                      ? analysis.correctlyPronounced
                        ? "bg-green-100"
                        : "bg-red-100"
                      : "bg-transparent"
                  }`}
                  title={analysis?.feedback || ""}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Transcribed text */}
        <div className="bg-slate-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Your Speech (Transcribed):
          </h4>
          <div className="flex flex-wrap gap-1">
            {transcribedWords.map((word, index) => {
              const cleanWord = word.replace(/[.,?!;:"'()]/g, "").toLowerCase();

              // Check if this word is in the original text
              const isInOriginal = originalWords.some(
                (w) =>
                  w.replace(/[.,?!;:"'()]/g, "").toLowerCase() === cleanWord
              );

              return (
                <span
                  key={`transcribed-${index}`}
                  className={`px-1 py-0.5 rounded ${
                    isInOriginal ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Display function to show detailed word analysis
   */
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
              <span className="font-medium">{analysis.word}</span>
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

  const currentContent = pronunciationContents[currentContentIndex];

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
            <p className="text-game-accent/80">
              Practice your English pronunciation with AI feedback
            </p>
          </motion.div>

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
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                    {currentContent.type === "word"
                      ? "Word"
                      : currentContent.type === "sentence"
                      ? "Sentence"
                      : "Paragraph"}
                  </Badge>
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
                      <VolumeUp className="mr-2 h-4 w-4" />
                      Listen to correct pronunciation
                    </Button>
                  </motion.div>
                </motion.div>

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
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
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
                            <span className="text-2xl font-bold text-game-primary">
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
                            Detailed Word Analysis
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
                          <div className="p-3">{renderWordAnalysis()}</div>
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

                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">How to Play</h3>
                    <ul className="space-y-2 text-sm text-game-accent/70 list-disc list-inside">
                      <li>Listen to the correct pronunciation</li>
                      <li>Record yourself saying the word/sentence</li>
                      <li>Submit your recording for AI evaluation</li>
                      <li>Review your score and detailed feedback</li>
                      <li>Pay attention to highlighted problem areas</li>
                      <li>You need to achieve at least 75% to pass</li>
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
