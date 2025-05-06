// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Award,
  Timer,
  Edit,
  Info,
  Lightbulb,
  BookOpenCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import Navigation from "@/components/navigation";
import { useToast } from "@/components/ui/use-toast";

// Import new components
import { GrammarFlashcard } from "./_components/Flashcard";
import { GrammarGame } from "./_components/Flashcard/GrammarGame";
import confetti from 'canvas-confetti';

// Định nghĩa kiểu dữ liệu
interface Grammar {
  contentId: number;
  categoryId: number;
  title: string;
  explanation: string;
  examples?: string;
  notes?: string;
  orderIndex?: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  totalGrammar: number;
}

// Tự tạo component ConfettiExplosion đơn giản
const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

export default function LearnGrammarPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);
  const { toast } = useToast();

  // States
  const [activeTab, setActiveTab] = useState<string>("learn");
  const [currentGrammarIndex, setCurrentGrammarIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedGame, setCompletedGame] = useState(false);

  // Get grammar contents for the selected category
  const { data: grammarContents = [], isLoading: isGrammarLoading } =
    trpc.grammarContent.getAll.useQuery({
      categoryId: categoryId,
      page: 1,
      limit: 100,
    });

  // Get category details
  const { data: category, isLoading: isCategoryLoading } =
    trpc.category.getCategoryById.useQuery(categoryId);

  // Create current grammar item
  const currentGrammar = useMemo(() => {
    if (!grammarContents || grammarContents.length === 0) return null;
    return grammarContents[currentGrammarIndex];
  }, [grammarContents, currentGrammarIndex]);

  // Update progress to the server
  const { mutate: updateProgress } =
    trpc.userProcess.userRegisterCategory.useMutation({
      onSuccess: () => {
        toast({
          title: "Tiến độ đã được cập nhật",
          description: "Chúc mừng bạn đã học thêm nội dung ngữ pháp mới!",
        });
      },
    });

  // Handle navigation between grammar items
  const goToNextGrammar = () => {
    if (!grammarContents || currentGrammarIndex >= grammarContents.length - 1) {
      // End of grammar contents
      setIsExploding(true);
      triggerConfetti();
      updateProgress({
        categoryId: categoryId,
      });
      setTimeout(() => {
        router.push(`/grammar`);
      }, 3000);
      return;
    }

    // Update progress
    updateProgress({
      categoryId: categoryId,
    });

    // Reset states and go to next grammar item
    setCurrentGrammarIndex((prev) => prev + 1);
    setIsAnswerCorrect(null);
    setUserAnswer("");
    setShowHint(false);
    setShowExample(false);
    setShowAnswer(false);
    setCompletedGame(false);
  };

  const goToPreviousGrammar = () => {
    if (currentGrammarIndex <= 0) return;

    setCurrentGrammarIndex((prev) => prev - 1);
    setIsAnswerCorrect(null);
    setUserAnswer("");
    setShowHint(false);
    setShowExample(false);
    setShowAnswer(false);
    setCompletedGame(false);
  };

  // Handle user answer
  const handleUserAnswerChange = (answer: string) => {
    setUserAnswer(answer);
  };

  // Check user answer against grammar rules
  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    // Check if answer is correct based on grammar rules
    // This is a simplified version - in a real app, you'd have more sophisticated checks
    let isCorrect = false;
    
    if (currentGrammar) {
      // Get key terms from the grammar title and content
      const keyTerms = getKeyTermsFromGrammar(currentGrammar);
      
      // Check if the answer contains any of the key terms
      isCorrect = keyTerms.some(term => 
        userAnswer.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setIsAnswerCorrect(isCorrect);
    setShowAnswer(true);
    
    if (isCorrect) {
      triggerConfetti();
    }
  };

  // Show answer directly
  const handleShowAnswer = () => {
    setShowAnswer(true);
    setIsAnswerCorrect(false);
  };

  // Handle game completion
  const handleGameComplete = (success: boolean) => {
    setCompletedGame(true);
    if (success) {
      triggerConfetti();
    }
  };

  // Utility function to extract key terms from grammar content
  const getKeyTermsFromGrammar = (grammar: Grammar) => {
    if (!grammar) return [];

    let terms: string[] = [];

    // Extract from title
    if (grammar.title) {
      const titleWords = grammar.title.split(" ");
      terms = terms.concat(
        titleWords.filter((word: string) => word.length > 3)
      );
    }

    // For specific grammar types, add relevant terms
    if (grammar.title.includes("Present Simple")) {
      terms = terms.concat(["do", "does", "am", "is", "are"]);
    } else if (grammar.title.includes("Past Simple")) {
      terms = terms.concat(["did", "was", "were"]);
    } else if (grammar.title.includes("Present Perfect")) {
      terms = terms.concat(["have", "has", "been"]);
    } else if (grammar.title.includes("Future")) {
      terms = terms.concat(["will", "going to", "shall"]);
    } else if (grammar.title.includes("Conditional")) {
      terms = terms.concat(["if", "would", "should", "could", "might"]);
    }

    return terms;
  };

  // Loading state
  if (isGrammarLoading || isCategoryLoading) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  // No grammar content
  if (!grammarContents || grammarContents.length === 0) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button
            className="mb-6 flex items-center gap-2"
            variant="ghost"
            onClick={() => router.push("/grammar")}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              Không có nội dung ngữ pháp
            </h3>
            <p className="mb-6 max-w-md text-gray-500">
              Khóa học này chưa có nội dung ngữ pháp hoặc đã bị lỗi. Vui lòng
              thử lại sau.
            </p>
            <Button
              className="game-button"
              onClick={() => router.push("/grammar")}
            >
              Quay lại trang ngữ pháp
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            className="flex items-center gap-2"
            variant="ghost"
            onClick={() => router.push("/grammar")}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowInfoDialog(true)}
            >
              <Info className="h-4 w-4" />
              Thông tin
            </Button>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold text-game-accent">
            {category?.categoryName || "Khóa học ngữ pháp"}
          </h1>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-game-primary">
              Điểm ngữ pháp {currentGrammarIndex + 1}/{grammarContents.length}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-game-accent">Tiến độ</span>
              <Progress
                value={(currentGrammarIndex / grammarContents.length) * 100}
                className="h-2 w-32 bg-white"
              />
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-game-background">
            <TabsTrigger
              value="learn"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Học
            </TabsTrigger>
            <TabsTrigger
              value="practice"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Luyện tập
            </TabsTrigger>
            <TabsTrigger
              value="game"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Trò chơi
            </TabsTrigger>
          </TabsList>

          {/* Tab học với Flashcard mới */}
          <TabsContent value="learn" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`learn-${currentGrammarIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col">
                  <GrammarFlashcard
                    currentGrammar={currentGrammar}
                    currentIndex={currentGrammarIndex}
                    showAnswer={showAnswer}
                    userAnswer={userAnswer}
                    isCorrect={isAnswerCorrect}
                    onNext={goToNextGrammar}
                    onUserAnswerChange={handleUserAnswerChange}
                    onCheckAnswer={checkAnswer}
                    onShowAnswer={handleShowAnswer}
                  />
                  
                  <div className="mt-6 flex justify-between px-2">
                    <Button
                      variant="outline"
                      onClick={goToPreviousGrammar}
                      disabled={currentGrammarIndex === 0}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước đó
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab("game");
                        setCompletedGame(false);
                      }}
                      className="gap-1 border-amber-200 text-amber-600"
                    >
                      <Award className="h-4 w-4" />
                      Chơi game
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Tab luyện tập */}
          <TabsContent value="practice" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`practice-${currentGrammarIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="game-card overflow-hidden">
                  <CardHeader className="bg-white pb-3">
                    <CardTitle className="text-xl text-game-accent">
                      Luyện tập: {currentGrammar?.title}
                    </CardTitle>
                    <CardDescription>
                      Điền vào chỗ trống để hoàn thành câu theo ngữ pháp đã học
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="space-y-6">
                      {/* Phần gợi ý ngữ pháp */}
                      <div className="rounded-md bg-blue-50 p-4">
                        <div className="mb-2 flex items-center">
                          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                          <h3 className="font-medium text-game-primary">
                            Gợi ý ngữ pháp
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          {currentGrammar?.explanation?.substring(0, 150)}
                          {currentGrammar?.explanation &&
                          currentGrammar.explanation.length > 150
                            ? "..."
                            : ""}
                        </p>
                      </div>

                      {/* Câu luyện tập */}
                      <div className="space-y-4">
                        {currentGrammar?.examples ? (
                          <div className="rounded-md bg-gray-50 p-4">
                            <h4 className="mb-3 font-medium text-gray-700">Các ví dụ:</h4>
                            <div className="space-y-2">
                              {currentGrammar.examples.split("\n")
                                .filter(line => line.trim().length > 0)
                                .slice(0, 3)
                                .map((example, idx) => (
                                  <p key={idx} className="text-gray-800">{example}</p>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md bg-gray-50 p-4 text-center text-gray-500">
                            Không có ví dụ cho điểm ngữ pháp này
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Tạo một câu sử dụng ngữ pháp này:
                          </label>
                          <Textarea
                            placeholder="Viết câu của bạn sử dụng ngữ pháp đã học..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="min-h-[120px] resize-none"
                          />
                        </div>

                        {showAnswer && (
                          <div
                            className={`mt-4 rounded-md p-3 ${
                              isAnswerCorrect
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <div className="flex items-center">
                              {isAnswerCorrect ? (
                                <>
                                  <Check className="mr-2 h-5 w-5 text-green-500" />
                                  <div>
                                    <p className="font-medium">Rất tốt!</p>
                                    <p className="text-sm">
                                      Câu của bạn đã sử dụng đúng cấu trúc ngữ pháp.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <BookOpenCheck className="mr-2 h-5 w-5 text-amber-500" />
                                  <div>
                                    <p className="font-medium">Gợi ý:</p>
                                    <p className="text-sm">
                                      Hãy xem lại phần giải thích và thử sử dụng cấu trúc ngữ pháp "{currentGrammar?.title}" một cách đúng đắn.
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={goToPreviousGrammar}
                        disabled={currentGrammarIndex === 0}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!showAnswer && (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleShowAnswer}
                            className="border-blue-200 text-blue-600"
                          >
                            <Info className="mr-2 h-4 w-4" />
                            Xem gợi ý
                          </Button>
                          <Button
                            onClick={checkAnswer}
                            className="game-button"
                            disabled={!userAnswer.trim()}
                          >
                            Kiểm tra
                          </Button>
                        </>
                      )}

                      {showAnswer && (
                        <Button
                          className="game-button"
                          onClick={goToNextGrammar}
                        >
                          {currentGrammarIndex >= grammarContents.length - 1
                            ? "Hoàn thành"
                            : "Tiếp theo"}
                          {currentGrammarIndex < grammarContents.length - 1 && (
                            <ChevronRight className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Tab trò chơi */}
          <TabsContent value="game" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`game-${currentGrammarIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col">
                  <GrammarGame 
                    grammar={currentGrammar}
                    onComplete={handleGameComplete}
                  />
                  
                  {completedGame && (
                    <div className="mt-6 flex justify-between px-2">
                      <Button
                        variant="outline"
                        onClick={goToPreviousGrammar}
                        disabled={currentGrammarIndex === 0}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước đó
                      </Button>
                      
                      <Button
                        className="game-button"
                        onClick={goToNextGrammar}
                      >
                        {currentGrammarIndex >= grammarContents.length - 1
                          ? "Hoàn thành"
                          : "Tiếp theo"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Dialog hiển thị thông tin khóa học */}
        <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl text-game-accent">
                Thông tin khóa học
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="mb-1 font-medium text-game-primary">
                  Tên khóa học
                </h3>
                <p>{category?.categoryName}</p>
              </div>

              <div>
                <h3 className="mb-1 font-medium text-game-primary">Mô tả</h3>
                <p>{category?.description || "Không có mô tả"}</p>
              </div>

              <div>
                <h3 className="mb-1 font-medium text-game-primary">Nội dung</h3>
                <p>{grammarContents.length} điểm ngữ pháp</p>
              </div>

              <div>
                <h3 className="mb-1 font-medium text-game-primary">
                  Tiến độ hiện tại
                </h3>
                <Progress
                  value={(currentGrammarIndex / grammarContents.length) * 100}
                  className="h-2 w-full bg-white"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Đã học {currentGrammarIndex}/{grammarContents.length} điểm ngữ
                  pháp
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="game-button"
                onClick={() => setShowInfoDialog(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
