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

// Tự tạo component ConfettiExplosion đơn giản thay thế
const ConfettiExplosion = (props: {
  force?: number;
  duration?: number;
  particleCount?: number;
  width?: number;
}) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl">🎉</div>
      </div>
    </div>
  );
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
  const [practiceSentence, setPracticeSentence] = useState("");
  const [userPracticeAnswer, setUserPracticeAnswer] = useState("");
  const [isPracticeCorrect, setIsPracticeCorrect] = useState<boolean | null>(
    null
  );

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

  // Generate example sentences for practice
  const generateExampleSentence = () => {
    if (!currentGrammar || !currentGrammar.examples) return "";

    // Split examples by line break and filter empty lines
    const exampleLines = currentGrammar.examples
      .split("\n")
      .filter((line) => line.trim().length > 0);

    if (exampleLines.length === 0) return "";

    // Get a random example
    const randomIndex = Math.floor(Math.random() * exampleLines.length);
    const example = exampleLines[randomIndex];

    // Create a practice version by replacing key grammar elements with blanks
    let practiceSentence = example;

    // This is a simplified approach - in a real app, you'd want more sophisticated logic
    // to identify the grammar pattern being taught
    if (currentGrammar.title.includes("Tense")) {
      // For tenses, try to blank out the verb
      practiceSentence = example.replace(
        /\b(is|am|are|was|were|have|has|had|will|would)\b/i,
        "____"
      );
    } else if (currentGrammar.title.includes("Conditional")) {
      // For conditionals, blank out part of the condition
      practiceSentence = example.replace(
        /\b(if|would|could|should|might)\b/i,
        "____"
      );
    } else {
      // General approach - blank out a word from the example
      const words = example.split(" ");
      const randomWordIndex = Math.floor(Math.random() * words.length);
      if (words[randomWordIndex].length > 3) {
        // Only blank out meaningful words
        words[randomWordIndex] = "____";
        practiceSentence = words.join(" ");
      }
    }

    return practiceSentence;
  };

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
    setPracticeSentence("");
    setUserPracticeAnswer("");
    setIsPracticeCorrect(null);

    // Generate a new practice sentence
    if (activeTab === "practice") {
      setTimeout(() => {
        const newPracticeSentence = generateExampleSentence();
        setPracticeSentence(newPracticeSentence);
      }, 100);
    }
  };

  const goToPreviousGrammar = () => {
    if (currentGrammarIndex <= 0) return;

    setCurrentGrammarIndex((prev) => prev - 1);
    setIsAnswerCorrect(null);
    setUserAnswer("");
    setShowHint(false);
    setShowExample(false);
    setPracticeSentence("");
    setUserPracticeAnswer("");
    setIsPracticeCorrect(null);

    // Generate a new practice sentence
    if (activeTab === "practice") {
      setTimeout(() => {
        const newPracticeSentence = generateExampleSentence();
        setPracticeSentence(newPracticeSentence);
      }, 100);
    }
  };

  // Generate practice sentence when switching to practice tab
  useEffect(() => {
    if (activeTab === "practice" && currentGrammar) {
      const newPracticeSentence = generateExampleSentence();
      setPracticeSentence(newPracticeSentence);
    }
  }, [activeTab, currentGrammar]);

  // Verify practice answer
  const checkPracticeAnswer = () => {
    if (!currentGrammar || !currentGrammar.examples || !practiceSentence)
      return;

    // This is a simplified approach to checking answers
    // In a real application, you'd want more sophisticated logic

    // Basic check: user input should not be empty
    if (!userPracticeAnswer.trim()) {
      setIsPracticeCorrect(false);
      return;
    }

    // Very basic matching - just check if the answer contains key terms from the grammar
    // This should be replaced with proper grammar checking in a real app
    const keyTerms = getKeyTermsFromGrammar(currentGrammar);
    const isCorrect = keyTerms.some((term) =>
      userPracticeAnswer.toLowerCase().includes(term.toLowerCase())
    );

    setIsPracticeCorrect(isCorrect);

    if (isCorrect) {
      setIsExploding(true);
      setTimeout(() => {
        setIsExploding(false);
      }, 2000);
    }
  };

  // Utility function to extract key terms from grammar content
  const getKeyTermsFromGrammar = (grammar: any) => {
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
        {isExploding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <ConfettiExplosion
              force={0.8}
              duration={3000}
              particleCount={250}
              width={1600}
            />
          </div>
        )}

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
          <TabsList className="grid w-full grid-cols-2 bg-game-background">
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
          </TabsList>

          {/* Tab học */}
          <TabsContent value="learn" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`learn-${currentGrammarIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="game-card overflow-hidden">
                  <CardHeader className="bg-white pb-3">
                    <CardTitle className="text-xl text-game-accent">
                      {currentGrammar?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {/* Giải thích ngữ pháp */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-game-primary">
                            Giải thích
                          </h3>
                          <div className="rounded-md bg-gray-50 p-4 text-gray-800">
                            <p style={{ whiteSpace: "pre-line" }}>
                              {currentGrammar?.explanation}
                            </p>
                          </div>
                        </div>

                        {/* Ví dụ */}
                        {currentGrammar?.examples && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-game-primary">
                                Ví dụ
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-gray-500"
                                onClick={() => setShowExample(!showExample)}
                              >
                                {showExample ? "Ẩn" : "Hiển thị"}
                              </Button>
                            </div>

                            {showExample && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-md bg-gray-50 p-4 text-gray-800"
                              >
                                <p style={{ whiteSpace: "pre-line" }}>
                                  {currentGrammar?.examples}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Ghi chú */}
                        {currentGrammar?.notes && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-game-primary">
                                Ghi chú
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-gray-500"
                                onClick={() => setShowHint(!showHint)}
                              >
                                {showHint ? "Ẩn" : "Hiển thị"}
                              </Button>
                            </div>

                            {showHint && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-md bg-gray-50 p-4 text-gray-800"
                              >
                                <p style={{ whiteSpace: "pre-line" }}>
                                  {currentGrammar?.notes}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="bg-gray-50 p-4">
                    <div className="flex w-full items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={goToPreviousGrammar}
                        disabled={currentGrammarIndex === 0}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button className="game-button" onClick={goToNextGrammar}>
                        {currentGrammarIndex >= grammarContents.length - 1
                          ? "Hoàn thành"
                          : "Tiếp theo"}
                        {currentGrammarIndex < grammarContents.length - 1 && (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
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
                      {practiceSentence ? (
                        <div className="space-y-4">
                          <div className="rounded-md bg-gray-50 p-4">
                            <p className="text-center text-lg font-medium text-gray-800">
                              {practiceSentence}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Đáp án của bạn:
                            </label>
                            <Textarea
                              placeholder="Nhập câu trả lời của bạn..."
                              value={userPracticeAnswer}
                              onChange={(e) =>
                                setUserPracticeAnswer(e.target.value)
                              }
                              className="min-h-[80px] resize-none"
                            />
                          </div>

                          {isPracticeCorrect !== null && (
                            <div
                              className={`mt-4 rounded-md p-3 ${
                                isPracticeCorrect
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              <div className="flex items-center">
                                {isPracticeCorrect ? (
                                  <>
                                    <Check className="mr-2 h-5 w-5 text-green-500" />
                                    <p>
                                      Chính xác! Bạn đã hiểu ngữ pháp này rồi.
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <X className="mr-2 h-5 w-5 text-red-500" />
                                    <p>
                                      Chưa chính xác. Hãy thử lại hoặc xem lại
                                      phần học.
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Edit className="mb-3 h-12 w-12 text-gray-300" />
                          <p className="text-gray-500">
                            Không thể tạo câu luyện tập từ ví dụ cho ngữ pháp
                            này.
                          </p>
                          <p className="mt-2 text-sm text-gray-400">
                            Hãy xem phần học trước khi tiếp tục
                          </p>
                        </div>
                      )}
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

                      {practiceSentence && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newPracticeSentence =
                              generateExampleSentence();
                            setPracticeSentence(newPracticeSentence);
                            setUserPracticeAnswer("");
                            setIsPracticeCorrect(null);
                          }}
                          className="gap-1"
                        >
                          <Timer className="h-4 w-4" />
                          Câu mới
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {practiceSentence && isPracticeCorrect === null && (
                        <Button
                          onClick={checkPracticeAnswer}
                          className="game-button"
                          disabled={!userPracticeAnswer.trim()}
                        >
                          Kiểm tra
                        </Button>
                      )}

                      {(isPracticeCorrect !== null || !practiceSentence) && (
                        <Button
                          className="game-button"
                          onClick={goToNextGrammar}
                        >
                          {currentGrammarIndex >= grammarContents.length - 1
                            ? "Hoàn thành"
                            : "Tiếp theo"}
                          {currentGrammarIndex < grammarContents.length - 1 && (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
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
