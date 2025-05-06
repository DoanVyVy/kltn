"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Book,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "react-hot-toast";

interface ReviewGrammar {
  contentId: number;
  title: string;
  content: string;
  explanation: string;
  examples?: string[];
  categoryId: number;
  category?: {
    categoryId: number;
    categoryName: string;
  };
  addedAt?: string;
}

export default function GrammarReviewSession() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewGrammars, setReviewGrammars] = useState<ReviewGrammar[]>([]);
  const [completedGrammars, setCompletedGrammars] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionType, setQuestionType] = useState<number>(0); // 0: Quy tắc chọn ví dụ, 1: Ví dụ chọn quy tắc
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Truy vấn danh sách ngữ pháp cần ôn tập
  const { data: reviewGrammarsData, isLoading: isReviewGrammarsLoading } =
    trpc.userReviewGrammars.getReviewGrammars.useQuery(
      {
        page: 1,
        limit: 100,
      },
      {
        onSuccess: (data: any) => {
          if (data && data.grammars && data.grammars.length > 0) {
            setReviewGrammars(data.grammars);
            setLoading(false);
          } else {
            setLoading(false);
            toast.error("Không có ngữ pháp nào trong danh sách ôn tập");
          }
        },
        onError: (error) => {
          setLoading(false);
          console.error("Lỗi khi tải danh sách ngữ pháp:", error);
          toast.error("Có lỗi xảy ra khi tải danh sách ngữ pháp");
        },
        retry: 1,
        retryDelay: 1000,
      }
    );

  // Nếu dữ liệu đã tải xong nhưng reviewGrammars chưa được cập nhật
  useEffect(() => {
    if (
      !isReviewGrammarsLoading &&
      reviewGrammarsData?.grammars &&
      reviewGrammarsData.grammars.length > 0 &&
      reviewGrammars.length === 0
    ) {
      setReviewGrammars(reviewGrammarsData.grammars);
      setLoading(false);
    } else if (
      !isReviewGrammarsLoading &&
      (!reviewGrammarsData?.grammars ||
        reviewGrammarsData.grammars.length === 0) &&
      loading
    ) {
      setLoading(false);
    }
  }, [
    isReviewGrammarsLoading,
    reviewGrammarsData,
    reviewGrammars.length,
    loading,
  ]);

  // Xóa ngữ pháp khỏi danh sách ôn tập
  const removeFromReviewMutation =
    trpc.userReviewGrammars.removeFromReview.useMutation({
      onSuccess: () => {
        toast.success("Đã xóa ngữ pháp khỏi danh sách ôn tập");
      },
    });

  // Lấy ngữ pháp hiện tại
  const currentGrammar = reviewGrammars[currentIndex];

  // Tạo đáp án khi ngữ pháp hoặc loại câu hỏi thay đổi
  useEffect(() => {
    if (currentGrammar) {
      const newOptions = generateAnswerOptions();
      setAnswerOptions(newOptions);
    }
  }, [currentGrammar, questionType]);

  // Tạo loại câu hỏi khi chuyển sang ngữ pháp mới
  useEffect(() => {
    const newQuestionType = Math.floor(Math.random() * 2);
    setQuestionType(newQuestionType);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowAnswer(false);
  }, [currentIndex]);

  // Tạo danh sách đáp án từ dữ liệu hiện có
  const generateAnswerOptions = () => {
    let options: string[] = [];
    if (!currentGrammar || reviewGrammars.length < 4) return [];

    // Danh sách ngữ pháp ngẫu nhiên từ danh sách
    const otherOptions: string[] = [];
    const grammarsCopy = [...reviewGrammars]; // Tạo bản sao để tránh thay đổi mảng gốc

    // Loại trừ ngữ pháp hiện tại
    const filteredGrammars = grammarsCopy.filter(
      (grammar) => grammar.contentId !== currentGrammar.contentId
    );

    // Chọn ngẫu nhiên 3 ngữ pháp khác
    while (otherOptions.length < 3 && filteredGrammars.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredGrammars.length);
      if (questionType === 0) {
        // Trường hợp quy tắc -> chọn ví dụ
        if (
          filteredGrammars[randomIndex].examples &&
          filteredGrammars[randomIndex].examples.length > 0
        ) {
          const randomExampleIndex = Math.floor(
            Math.random() * filteredGrammars[randomIndex].examples!.length
          );
          otherOptions.push(
            filteredGrammars[randomIndex].examples![randomExampleIndex]
          );
        } else {
          otherOptions.push("Không có ví dụ cho quy tắc này");
        }
      } else {
        // Trường hợp ví dụ -> chọn quy tắc
        otherOptions.push(filteredGrammars[randomIndex].title);
      }
      filteredGrammars.splice(randomIndex, 1);
    }

    // Thêm câu trả lời đúng vào danh sách
    if (questionType === 0) {
      // Quy tắc -> chọn ví dụ
      if (currentGrammar.examples && currentGrammar.examples.length > 0) {
        const randomCorrectExampleIndex = Math.floor(
          Math.random() * currentGrammar.examples.length
        );
        options = [
          currentGrammar.examples[randomCorrectExampleIndex],
          ...otherOptions,
        ];
      } else {
        // Nếu không có ví dụ, chuyển sang loại câu hỏi khác
        setQuestionType(1);
        return generateAnswerOptions();
      }
    } else {
      // Ví dụ -> chọn quy tắc
      options = [currentGrammar.title, ...otherOptions];
    }

    // Xáo trộn thứ tự các đáp án
    return options.sort(() => Math.random() - 0.5);
  };

  // Xử lý đánh dấu ngữ pháp đã hoàn thành
  const handleComplete = () => {
    if (currentIndex < reviewGrammars.length) {
      const contentId = reviewGrammars[currentIndex].contentId;
      if (!completedGrammars.includes(contentId)) {
        setCompletedGrammars([...completedGrammars, contentId]);
      }
      goToNext();
    }
  };

  // Xử lý xóa ngữ pháp khỏi danh sách ôn tập
  const handleRemoveFromReview = () => {
    if (currentIndex < reviewGrammars.length) {
      const grammarId = reviewGrammars[currentIndex].contentId;
      removeFromReviewMutation.mutate({ grammarId });
      // Xóa ngữ pháp khỏi danh sách hiện tại
      const updatedGrammars = [...reviewGrammars];
      updatedGrammars.splice(currentIndex, 1);
      setReviewGrammars(updatedGrammars);
      // Nếu không còn ngữ pháp nào, quay lại trang danh sách ngữ pháp đã học
      if (updatedGrammars.length === 0) {
        toast.success("Bạn đã hoàn thành tất cả các ngữ pháp!");
        router.push("/grammar/learned");
      } else if (currentIndex >= updatedGrammars.length) {
        // Nếu xóa ngữ pháp cuối cùng, quay lại ngữ pháp trước đó
        setCurrentIndex(updatedGrammars.length - 1);
      }
      setShowAnswer(false);
    }
  };

  // Xử lý chuyển đến ngữ pháp tiếp theo
  const goToNext = () => {
    if (currentIndex < reviewGrammars.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Đã hoàn thành tất cả các ngữ pháp
      toast.success("Bạn đã xem qua tất cả các ngữ pháp!");
      setCurrentIndex(0);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  // Xử lý quay lại ngữ pháp trước đó
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  // Xử lý trộn ngẫu nhiên danh sách ngữ pháp
  const shuffleGrammars = () => {
    const shuffled = [...reviewGrammars].sort(() => Math.random() - 0.5);
    setReviewGrammars(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    toast.success("Đã trộn ngẫu nhiên danh sách ngữ pháp");
  };

  // Xử lý khi chọn đáp án
  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer || showAnswer) return;

    setSelectedAnswer(answer);
    let correct = false;

    if (questionType === 0) {
      // Quy tắc -> chọn ví dụ
      correct = currentGrammar?.examples?.includes(answer) || false;
    } else {
      // Ví dụ -> chọn quy tắc
      correct = answer === currentGrammar?.title;
    }

    setIsCorrect(correct);
    setShowAnswer(true);

    // Nếu trả lời đúng, đợi 4 giây rồi chuyển sang ngữ pháp tiếp theo
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
      // Nếu trả lời sai, đợi 10 giây rồi chuyển sang ngữ pháp tiếp theo
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
  };

  // Hàm render nội dung câu hỏi theo từng loại
  const renderQuestionContent = () => {
    if (!currentGrammar) return null;

    switch (questionType) {
      case 0: // Quy tắc -> chọn ví dụ
        return (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-game-accent mb-4">
                Chọn ví dụ phù hợp với quy tắc sau:
              </h3>
              <Card className="border-2 border-gray-100 bg-gray-50 shadow-none p-6 rounded-2xl">
                <h4 className="text-lg font-medium text-game-secondary mb-2">
                  {currentGrammar.title}
                </h4>
                <p className="text-base text-game-accent">
                  {currentGrammar.explanation}
                </p>
              </Card>
            </div>
          </>
        );
      case 1: // Ví dụ -> chọn quy tắc
        return (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-medium text-game-accent mb-4">
                Chọn quy tắc ngữ pháp phù hợp với ví dụ sau:
              </h3>
              <Card className="border-2 border-gray-100 bg-gray-50 shadow-none p-6 rounded-2xl">
                {currentGrammar.examples &&
                currentGrammar.examples.length > 0 ? (
                  <div className="space-y-3">
                    {currentGrammar.examples.map((example, index) => (
                      <p
                        key={index}
                        className="text-base text-game-accent font-medium"
                      >
                        {example}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-game-accent italic">
                    Không có ví dụ cho quy tắc này
                  </p>
                )}
              </Card>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (loading || isReviewGrammarsLoading) {
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

  if (reviewGrammars.length === 0) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center flex-col items-center py-20 text-center">
            <Brain className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Không có ngữ pháp cần ôn tập
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Bạn chưa thêm ngữ pháp nào vào danh sách ôn tập hoặc đã ôn tập hết
              tất cả các quy tắc.
            </p>
            <Button
              className="game-button"
              onClick={() => router.push("/grammar/learned")}
            >
              Quay lại danh sách ngữ pháp đã học
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
              onClick={() => router.push("/grammar/learned")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-game-accent">
              Ôn tập ngữ pháp
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-gray-100/80 px-2 py-1 text-gray-700"
            >
              {currentIndex + 1}/{reviewGrammars.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-white/90"
              onClick={shuffleGrammars}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {answerOptions.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleSelectAnswer(option)}
                    className={`
                      relative p-4 h-auto min-h-16 rounded-2xl border-2 font-medium text-lg transition-all
                      ${
                        showAnswer
                          ? questionType === 0
                            ? currentGrammar?.examples?.includes(option)
                              ? "border-green-400 bg-green-50 text-green-700"
                              : selectedAnswer === option
                              ? "border-red-400 bg-red-50 text-red-700"
                              : "border-gray-200 bg-gray-50 text-gray-400"
                            : option === currentGrammar?.title
                            ? "border-green-400 bg-green-50 text-green-700"
                            : selectedAnswer === option
                            ? "border-red-400 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                          : "border-game-secondary/20 bg-white hover:border-game-secondary hover:bg-game-secondary/5 text-game-accent shadow-sm hover:shadow"
                      }
                    `}
                    disabled={showAnswer || selectedAnswer !== null}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                    {showAnswer &&
                      (questionType === 0
                        ? currentGrammar?.examples?.includes(option)
                        : option === currentGrammar?.title) && (
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
                      (questionType === 0
                        ? !currentGrammar?.examples?.includes(option)
                        : option !== currentGrammar?.title) && (
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

              {showAnswer && (
                <div className="mb-6 border-t border-gray-100 pt-4">
                  <h3 className="mb-2 text-lg font-medium text-gray-700">
                    Giải thích:
                  </h3>
                  <p className="text-gray-600">{currentGrammar?.explanation}</p>

                  {currentGrammar?.examples &&
                    currentGrammar.examples.length > 0 && (
                      <>
                        <h4 className="mt-4 mb-2 text-lg font-medium text-gray-700">
                          Các ví dụ:
                        </h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {currentGrammar.examples.map((example, idx) => (
                            <li key={idx} className="text-gray-600">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
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
