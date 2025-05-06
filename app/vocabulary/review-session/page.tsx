"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Book,
  Bookmark,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Volume2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "react-hot-toast";
import { useAudio } from "../learn/[id]/_hooks/useAudio";

interface ReviewWord {
  wordId: number;
  word: string;
  pronunciation?: string;
  definition: string;
  exampleSentence?: string;
  partOfSpeech?: string;
  audioUrl?: string;
  category?: {
    categoryId: number;
    categoryName: string;
  };
  categoryId: number;
  addedAt?: string;
}

export default function VocabularyReviewSession() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [completedWords, setCompletedWords] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState<number>(0); // 0: Nghe chọn từ, 1: Nghĩa chọn từ, 2: Từ chọn nghĩa
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Truy vấn danh sách từ vựng cần ôn tập
  const { data: reviewWordsData, isLoading: isReviewWordsLoading } =
    trpc.userReviewWords.getReviewWords.useQuery(
      {
        page: 1,
        limit: 100,
      },
      {
        onSuccess: (data) => {
          if (data && data.words && data.words.length > 0) {
            setReviewWords(data.words);
            setLoading(false);
          } else {
            setLoading(false);
            toast.error("Không có từ vựng nào trong danh sách ôn tập");
          }
        },
        onError: (error) => {
          setLoading(false);
          console.error("Lỗi khi tải danh sách từ vựng:", error);
          toast.error("Có lỗi xảy ra khi tải danh sách từ vựng");
        },
        retry: 1,
        retryDelay: 1000,
      }
    );

  // Nếu dữ liệu đã tải xong nhưng reviewWords chưa được cập nhật
  useEffect(() => {
    if (
      !isReviewWordsLoading &&
      reviewWordsData?.words &&
      reviewWordsData.words.length > 0 &&
      reviewWords.length === 0
    ) {
      setReviewWords(reviewWordsData.words);
      setLoading(false);
    } else if (
      !isReviewWordsLoading &&
      (!reviewWordsData?.words || reviewWordsData.words.length === 0) &&
      loading
    ) {
      setLoading(false);
    }
  }, [isReviewWordsLoading, reviewWordsData, reviewWords.length, loading]);

  // Xóa từ vựng khỏi danh sách ôn tập
  const removeFromReviewMutation =
    trpc.userReviewWords.removeFromReview.useMutation({
      onSuccess: () => {
        toast.success("Đã xóa từ vựng khỏi danh sách ôn tập");
      },
    });

  // Lấy từ vựng hiện tại
  const currentWord = reviewWords[currentIndex];

  // Audio state
  const { isPlaying: isAudioPlaying, play: playAudio } = useAudio(
    currentWord?.audioUrl || ""
  );

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
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowAnswer(false);
  }, [currentIndex]);

  // Auto phát âm khi câu hỏi là nghe chọn từ
  useEffect(() => {
    if (questionType === 0 && currentWord?.audioUrl && !showAnswer) {
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [questionType, currentWord, showAnswer]);

  // Tạo danh sách đáp án từ dữ liệu hiện có
  const generateAnswerOptions = () => {
    let options: string[] = [];
    if (!currentWord || reviewWords.length < 4) return [];

    // Danh sách từ ngẫu nhiên từ danh sách từ vựng
    const otherOptions: string[] = [];
    const wordsCopy = [...reviewWords]; // Tạo bản sao để tránh thay đổi mảng gốc

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

  // Xử lý đánh dấu từ vựng đã hoàn thành
  const handleComplete = () => {
    if (currentIndex < reviewWords.length) {
      const wordId = reviewWords[currentIndex].wordId;
      if (!completedWords.includes(wordId)) {
        setCompletedWords([...completedWords, wordId]);
      }
      goToNext();
    }
  };

  // Xử lý xóa từ vựng khỏi danh sách ôn tập
  const handleRemoveFromReview = () => {
    if (currentIndex < reviewWords.length) {
      const wordId = reviewWords[currentIndex].wordId;
      removeFromReviewMutation.mutate({ wordId });
      // Xóa từ vựng khỏi danh sách hiện tại
      const updatedWords = [...reviewWords];
      updatedWords.splice(currentIndex, 1);
      setReviewWords(updatedWords);
      // Nếu không còn từ vựng nào, quay lại trang danh sách từ vựng đã học
      if (updatedWords.length === 0) {
        toast.success("Bạn đã hoàn thành tất cả các từ vựng!");
        router.push("/vocabulary/learned");
      } else if (currentIndex >= updatedWords.length) {
        // Nếu xóa từ vựng cuối cùng, quay lại từ vựng trước đó
        setCurrentIndex(updatedWords.length - 1);
      }
      setShowAnswer(false);
    }
  };

  // Xử lý chuyển đến từ vựng tiếp theo
  const goToNext = () => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Đã hoàn thành tất cả các từ vựng
      toast.success("Bạn đã xem qua tất cả các từ vựng!");
      setCurrentIndex(0);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  // Xử lý quay lại từ vựng trước đó
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  // Xử lý trộn ngẫu nhiên danh sách từ vựng
  const shuffleWords = () => {
    const shuffled = [...reviewWords].sort(() => Math.random() - 0.5);
    setReviewWords(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    toast.success("Đã trộn ngẫu nhiên danh sách từ vựng");
  };

  // Xử lý khi chọn đáp án
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
            goToNext();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Nếu trả lời sai, đợi 10 giây rồi chuyển sang từ tiếp theo
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(10);
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            goToNext();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  // Xử lý hiển thị đáp án
  const handleShowAnswer = () => {
    setShowAnswer(true);
    // Phát âm thanh khi hiển thị đáp án
    if (currentWord?.audioUrl) {
      playAudio();
    }
  };

  const handlePlayAudio = () => {
    playAudio();
  };

  // Hàm render nội dung câu hỏi theo từng loại
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

  if (loading || isReviewWordsLoading) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center flex-col items-center py-20 text-center">
            <Book className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Không có từ vựng cần ôn tập
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Bạn chưa thêm từ vựng nào vào danh sách ôn tập hoặc đã ôn tập hết
              tất cả các từ.
            </p>
            <Button
              className="game-button"
              onClick={() => router.push("/vocabulary/learned")}
            >
              Quay lại danh sách từ vựng đã học
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Thanh tiêu đề và tiến trình */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => router.push("/vocabulary/learned")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-game-accent">
              Ôn tập từ vựng
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gray-100/80 px-2 py-1 text-gray-700"
            >
              {currentIndex + 1}/{reviewWords.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-white/90"
              onClick={shuffleWords}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Trộn thẻ
            </Button>
          </div>
        </div>

        {/* Thẻ câu hỏi trắc nghiệm */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          key={currentIndex}
          className="flex flex-col items-center"
        >
          <Card className="mx-auto w-full max-w-3xl shadow-lg transition-all hover:shadow-xl rounded-3xl border-0">
            <CardContent className="p-8">
              {renderQuestionContent()}

              <div className="grid grid-cols-2 gap-3 mb-6">
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

              {showAnswer && currentWord?.exampleSentence && (
                <div className="mb-6 border-t border-gray-100 pt-4">
                  <h3 className="mb-2 text-lg font-medium text-gray-700">
                    Ví dụ:
                  </h3>
                  <p
                    className="text-gray-600 italic"
                    dangerouslySetInnerHTML={{
                      __html: currentWord.exampleSentence.replace(
                        "____",
                        `<span class="font-bold text-game-primary">${currentWord.word}</span>`
                      ),
                    }}
                  />
                </div>
              )}

              <div className="mt-6">
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Các nút điều khiển */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            className="gap-2 bg-white hover:bg-white/90"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <Button
            variant="outline"
            className="gap-2 bg-white hover:bg-white/90 text-red-600 border-red-200 hover:text-red-700"
            onClick={handleRemoveFromReview}
          >
            <X className="h-4 w-4" />
            Xóa khỏi danh sách
          </Button>

          <Button
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleComplete}
          >
            <Check className="h-4 w-4" />
            Đã thuộc
          </Button>

          <Button
            variant="default"
            className="gap-2 game-button"
            onClick={goToNext}
          >
            Tiếp theo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Hiển thị thời gian còn lại */}
        {showAnswer && timeLeft > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Chuyển tiếp sau: <span className="font-medium">{timeLeft}s</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
