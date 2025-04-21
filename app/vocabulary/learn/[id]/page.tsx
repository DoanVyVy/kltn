"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/trpc/client";
import { LearningStats } from "./_types";
import { useAudio } from "./_hooks/useAudio";
import { NavigationHeader } from "./_components/NavigationHeader";
import { ProgressHeader } from "./_components/ProgressHeader";
import { CelebrationScreen } from "./_components/CelebrationScreen";
import Navigation from "@/components/navigation";
import { DefinitionMatching } from "./_components/Flashcard";
import { VocabularyWord } from "@prisma/client";
import { SpellingPractice } from "./_components/Typing";
import { WordCard } from "./_components/WordChoice/WordCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Volume2, Check, X, HelpCircle } from "lucide-react";

export default function LearnVocabularyPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  // Queries - Lấy từ vựng từ API
  const { data: vocabularyWords, isLoading: isWordsLoading } =
    trpc.category.getRandomWords.useQuery(
      {
        categoryId: categoryId,
        size: 10, // Lấy 10 từ vựng mỗi lần học
      },
      {
        enabled: !!categoryId,
        refetchOnWindowFocus: false,
      }
    );

  // Lấy thông tin về khóa học
  const { data: collection, isLoading: isCollectionLoading } =
    trpc.category.getCategoryById.useQuery(categoryId, {
      enabled: !!categoryId,
    });

  const { mutateAsync } = trpc.userProcess.userAnswerFlashcard.useMutation();

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<LearningStats>({
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [questionType, setQuestionType] = useState<number>(0); // 0: Nghe chọn từ, 1: Nghĩa chọn từ, 2: Từ chọn nghĩa

  // Chuẩn bị mảng từ vựng và từ hiện tại
  const words = vocabularyWords || [];
  const currentWord = words[currentIndex];

  const { isPlaying: isAudioPlaying, play: playAudio } = useAudio(
    currentWord?.audioUrl || ""
  );

  // Tạo danh sách đáp án từ dữ liệu hiện có
  const generateAnswerOptions = () => {
    let options: string[] = [];
    if (!currentWord || words.length < 4) return [];

    // Danh sách từ ngẫu nhiên từ danh sách từ vựng
    const otherOptions: string[] = [];
    const wordsCopy = [...words]; // Tạo bản sao để tránh thay đổi mảng gốc

    // Loại trừ từ hiện tại
    const filteredWords = wordsCopy.filter(
      (word) => word.wordId !== currentWord.wordId
    );

    // Chọn ngẫu nhiên 3 từ khác
    while (otherOptions.length < 3 && filteredWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length);
      if (questionType === 0 || questionType === 1) {
        // Trường hợp nghe hoặc nghĩa -> chọn từ
        otherOptions.push(filteredWords[randomIndex].word);
      } else {
        // Trường hợp từ -> chọn nghĩa
        otherOptions.push(filteredWords[randomIndex].definition);
      }
      filteredWords.splice(randomIndex, 1);
    }

    // Thêm câu trả lời đúng vào danh sách
    if (questionType === 0 || questionType === 1) {
      options = [currentWord.word, ...otherOptions];
    } else {
      options = [currentWord.definition, ...otherOptions];
    }

    // Xáo trộn thứ tự các đáp án
    return options.sort(() => Math.random() - 0.5);
  };

  const [answerOptions, setAnswerOptions] = useState<string[]>([]);

  // Tạo đáp án khi từ vựng hoặc loại câu hỏi thay đổi
  useEffect(() => {
    if (currentWord) {
      const newOptions = generateAnswerOptions();
      setAnswerOptions(newOptions);
    }
  }, [currentWord, questionType]);

  // Tạo loại câu hỏi khi chuyển sang từ mới
  useEffect(() => {
    const newQuestionType = Math.floor(Math.random() * 3);
    setQuestionType(newQuestionType);
  }, [currentIndex]);

  const utils = trpc.useUtils();

  useEffect(() => {
    setProgress((currentIndex / (words?.length || 1)) * 100);
  }, [currentIndex, words?.length]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || showAnswer) return;

    setSelectedAnswer(answer);
    let correct = false;

    if (questionType === 0 || questionType === 1) {
      // Nghe hoặc nghĩa -> chọn từ
      correct =
        answer.toLocaleUpperCase().trim() ===
        currentWord?.word.toLocaleUpperCase().trim();
    } else {
      // Từ -> chọn nghĩa
      correct = answer.trim() === currentWord?.definition.trim();
    }

    setIsCorrect(correct);
    setStats((prev) => ({
      ...prev,
      [correct ? "correct" : "incorrect"]:
        prev[correct ? "correct" : "incorrect"] + 1,
    }));

    setShowAnswer(true);

    // Phát âm thanh khi trả lời
    if (currentWord?.audioUrl && questionType !== 0) {
      playAudio();
    }

    // Nếu trả lời đúng, đợi 4 giây rồi chuyển sang từ tiếp theo
    if (correct) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(4);
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            handleNext();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Nếu trả lời sai, bắt đầu bộ đếm thời gian dài hơn
      startCountdownTimer();
    }

    if (currentWord) {
      mutateAsync({
        categoryId: collection?.categoryId!,
        correct: correct,
        wordId: currentWord.wordId,
      }).finally(() => {
        utils.userProcess.getCategoryProcesses.invalidate();
      });
    }
  };

  const handleNext = () => {
    if (words && currentIndex < words.length - 1) {
      // Reset states
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowAnswer(false);

      // Animate to next word
      setCurrentIndex(currentIndex + 1);
    } else {
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => {
        router.push(`/vocabulary/${collection?.categoryId}`);
      }, 3000);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setStats((prev) => ({
      ...prev,
      skipped: prev.skipped + 1,
    }));
    // Phát âm thanh khi hiển thị đáp án
    if (currentWord?.audioUrl) {
      playAudio();
    }
  };

  const handlePlayAudio = () => {
    playAudio();
  };

  const handleFinish = () => {
    router.push(`/vocabulary/${collection?.categoryId}`);
  };

  const handleBack = () => {
    router.push(`/vocabulary/${collection?.categoryId}`);
  };

  // Hàm thiết lập countdown timer
  const startCountdownTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeLeft(30); // 30 giây cho câu trả lời sai

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          // Nếu thời gian hết, chuyển sang từ mới nếu đã hiển thị đáp án
          if (showAnswer) {
            handleNext();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Reset timer khi từ vựng thay đổi hoặc khi hiển thị đáp án
  useEffect(() => {
    if (showAnswer) {
      startCountdownTimer();
    } else {
      // Nếu không hiển thị đáp án, dừng đếm ngược
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, showAnswer]);

  // Auto phát âm khi câu hỏi là nghe chọn từ
  useEffect(() => {
    if (questionType === 0 && currentWord?.audioUrl && !showAnswer) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [questionType, currentWord, showAnswer]);

  // Loading state
  if (isWordsLoading || isCollectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
      </div>
    );
  }

  // Kiểm tra nếu không có từ vựng nào
  if (words.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-game-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-game-accent mb-4">
            Không có từ vựng
          </h1>
          <p className="text-game-accent/70 mb-6">
            Khóa học này chưa có từ vựng nào. Vui lòng chọn khóa học khác.
          </p>
          <button
            className="game-button"
            onClick={() => router.push("/vocabulary")}
          >
            Quay lại Trang Từ Vựng
          </button>
        </div>
      </div>
    );
  }

  const renderQuestionContent = () => {
    if (!currentWord) return null;

    switch (questionType) {
      case 0: // Nghe phát âm chọn từ
        return (
          <>
            <div className="mb-6 flex flex-col items-center space-y-4">
              <h3 className="text-xl font-medium text-game-accent">
                Nghe và chọn từ phù hợp
              </h3>
              <button
                onClick={handlePlayAudio}
                className={`h-32 w-32 rounded-full bg-gradient-to-r from-game-primary to-game-secondary text-white transition-all ${
                  isAudioPlaying ? "animate-pulse" : ""
                }`}
              >
                <Volume2 className="h-16 w-16 mx-auto" />
              </button>
              {showAnswer && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                  initial={{ opacity: 0, y: -20 }}
                >
                  <p className="text-2xl font-medium text-game-accent">
                    {currentWord.word}
                  </p>
                  <p className="text-sm text-game-accent/70">
                    {currentWord.pronunciation}
                  </p>
                </motion.div>
              )}
            </div>
          </>
        );
      case 1: // Đọc nghĩa tiếng việt chọn từ tiếng anh
        return (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-game-accent mb-4">
                Chọn từ tiếng Anh phù hợp với nghĩa sau:
              </h3>
              <Card className="border-2 border-gray-100 bg-gray-50 shadow-none p-6 rounded-2xl">
                <p className="text-xl text-game-accent font-medium">
                  {currentWord.definition}
                </p>
              </Card>
              {showAnswer && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                  initial={{ opacity: 0, y: -20 }}
                >
                  <p className="text-2xl font-medium text-game-accent">
                    {currentWord.word}
                  </p>
                  <p className="text-sm text-game-accent/70">
                    {currentWord.pronunciation}
                  </p>
                </motion.div>
              )}
            </div>
          </>
        );
      case 2: // Nhìn từ vựng chọn nghĩa
        return (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-game-accent mb-4">
                Chọn nghĩa phù hợp với từ sau:
              </h3>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-game-primary">
                  {currentWord.word}
                </p>
                <p className="text-lg text-gray-500">
                  {currentWord.pronunciation}
                </p>
              </div>
              {showAnswer && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                  initial={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-2 border-green-100 bg-green-50 shadow-none p-4 rounded-2xl">
                    <p className="text-lg text-green-700 font-medium">
                      {currentWord.definition}
                    </p>
                  </Card>
                </motion.div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <NavigationHeader
          collection={collection || undefined}
          onBack={handleBack}
        />

        <ProgressHeader
          currentIndex={currentIndex}
          totalItems={words?.length || 0}
          progress={progress}
          stats={stats}
        />

        <AnimatePresence mode="wait">
          {showCelebration ? (
            <CelebrationScreen stats={stats} onFinish={handleFinish} />
          ) : (
            <motion.div
              key={currentIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center"
            >
              <Card className="w-full max-w-2xl overflow-hidden bg-white rounded-3xl shadow-lg border-0">
                <div className="p-8 h-full flex flex-col">
                  {renderQuestionContent()}

                  <div className="grid grid-cols-2 gap-3 mb-6 flex-grow">
                    {answerOptions.map((option) => (
                      <motion.button
                        key={option}
                        onClick={() => handleSelectAnswer(option)}
                        className={`
                          relative h-16 rounded-2xl border-2 font-medium text-lg transition-all
                          ${
                            showAnswer
                              ? questionType === 0 || questionType === 1
                                ? option === currentWord?.word
                                  ? "border-green-400 bg-green-50 text-green-700"
                                  : selectedAnswer === option
                                  ? "border-red-400 bg-red-50 text-red-700"
                                  : "border-gray-200 bg-gray-50 text-gray-400"
                                : option === currentWord?.definition
                                ? "border-green-400 bg-green-50 text-green-700"
                                : selectedAnswer === option
                                ? "border-red-400 bg-red-50 text-red-700"
                                : "border-gray-200 bg-gray-50 text-gray-400"
                              : "border-game-primary/20 bg-white hover:border-game-primary hover:bg-game-primary/5 text-game-accent shadow-sm hover:shadow"
                          }
                        `}
                        disabled={showAnswer || selectedAnswer !== null}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option}
                        {showAnswer &&
                          (questionType === 0 || questionType === 1
                            ? option === currentWord?.word
                            : option === currentWord?.definition) && (
                            <motion.div
                              animate={{ scale: 1 }}
                              className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 shadow-md"
                              initial={{ scale: 0 }}
                            >
                              <Check className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        {showAnswer &&
                          selectedAnswer === option &&
                          (questionType === 0 || questionType === 1
                            ? option !== currentWord?.word
                            : option !== currentWord?.definition) && (
                            <motion.div
                              animate={{ scale: 1 }}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 shadow-md"
                              initial={{ scale: 0 }}
                            >
                              <X className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-auto">
                    {showAnswer && (
                      <div className="flex justify-center">
                        <Button
                          className="game-button rounded-full px-6"
                          onClick={handleNext}
                        >
                          Từ tiếp theo
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {!showAnswer && !selectedAnswer && (
                      <div className="flex justify-center">
                        <Button
                          className="rounded-full px-6 border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100"
                          onClick={handleShowAnswer}
                          variant="outline"
                        >
                          <HelpCircle className="mr-2 h-4 w-4" />
                          Hiện đáp án
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {isCorrect === false && showAnswer && currentWord && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                >
                  <h4 className="mb-2 font-medium text-game-accent">Ví dụ:</h4>
                  <p
                    className="text-game-accent/70 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: (currentWord.exampleSentence || "").replace(
                        "____",
                        `<span class="font-bold text-game-primary">${currentWord.word}</span>`
                      ),
                    }}
                  />

                  {/* Hiển thị thời gian còn lại và nút chuyển tiếp */}
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      {currentWord.pronunciation && (
                        <p className="text-sm text-gray-500">
                          Phát âm:{" "}
                          <span className="font-medium">
                            {currentWord.pronunciation}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {timeLeft > 0 && (
                        <p className="text-sm text-gray-500">
                          Chuyển tiếp sau:{" "}
                          <span className="font-medium">{timeLeft}s</span>
                        </p>
                      )}
                      <Button
                        className="game-button rounded-full px-6"
                        onClick={handleNext}
                      >
                        Từ tiếp theo
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
