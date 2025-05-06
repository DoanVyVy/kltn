"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  Clock,
  BarChart2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { GrammarQuiz } from "@/components/grammar/grammar-quiz";
import { GrammarReference } from "@/components/grammar/grammar-reference";
import { useGrammarPracticeGenerator } from "@/components/grammar/grammar-practice-generator";

export default function GrammarQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId") as string)
    : null;

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    categoryId
  );
  const [selectedGrammarId, setSelectedGrammarId] = useState<number | null>(
    null
  );
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Get all grammar categories
  const { data: categories = [], isLoading: isCategoriesLoading } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: false,
    });

  // Get grammar contents of the selected category
  const { data: grammarContents = [], isLoading: isGrammarLoading } =
    trpc.grammarContent.getAll.useQuery(
      {
        categoryId: selectedCategoryId || 0,
        page: 1,
        limit: 100,
      },
      {
        enabled: !!selectedCategoryId,
      }
    );

  // Get single grammar point
  const { data: selectedGrammar, isLoading: isSelectedGrammarLoading } =
    trpc.grammarContent.getById.useQuery(
      { contentId: selectedGrammarId || 0 },
      { enabled: !!selectedGrammarId }
    );

  // Get user progress data for tracking completed quizzes
  const { data: userProgress = [], isLoading: isProgressLoading } =
    trpc.userProcess.getCategoryProcesses.useQuery();

  // Generate exercises for the selected grammar
  const exercises = useGrammarPracticeGenerator(selectedGrammar || null);

  // Filter grammar contents based on search
  const filteredGrammarContents = grammarContents.filter(
    (grammar) =>
      grammar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grammar.explanation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get studied categories IDs
  const studiedCategoriesIds = userProgress
    .filter((progress) => progress.processPercentage > 0)
    .map((progress) => progress.categoryId);

  // Filter categories by tab
  const filteredCategories = categories
    .filter((category) => {
      if (activeTab === "all") return true;
      if (activeTab === "learning")
        return studiedCategoriesIds.includes(category.categoryId);
      return false;
    })
    .filter((category) =>
      category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Handle category selection
  const handleCategorySelect = (catId: number) => {
    setSelectedCategoryId(catId);
    setSelectedGrammarId(null);
    setIsQuizStarted(false);
  };

  // Handle grammar selection
  const handleGrammarSelect = (grammarId: number) => {
    setSelectedGrammarId(grammarId);
    setIsQuizStarted(false);
  };

  // Handle quiz completion
  const handleQuizComplete = (score: number, total: number) => {
    toast({
      title: "Bài kiểm tra hoàn thành!",
      description: `Điểm số của bạn: ${score}/${total}`,
    });

    // Update user progress
    if (selectedCategoryId) {
      trpc.userProcess.userRegisterCategory.useQueryClient.invalidateQueries([
        "userProcess.getCategoryProcesses",
      ]);
    }
  };

  // Format difficulty level
  const formatDifficulty = (index: number, total: number) => {
    const position = index / total;
    if (position < 0.3) return "Dễ";
    if (position < 0.7) return "Trung bình";
    return "Khó";
  };

  // Get selected category
  const selectedCategory = categories.find(
    (cat) => cat.categoryId === selectedCategoryId
  );

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/grammar")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-game-accent">
                Bài tập ngữ pháp
              </h1>
              <p className="text-sm text-game-accent/70">
                Luyện tập và kiểm tra kiến thức ngữ pháp của bạn
              </p>
            </div>
          </div>
        </div>

        {isQuizStarted ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setIsQuizStarted(false)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsReferenceOpen(true)}
                className="gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                <BookOpen className="h-4 w-4" />
                Xem lại ngữ pháp
              </Button>
            </div>

            <GrammarQuiz
              exercises={exercises}
              grammarTitle={selectedGrammar?.title || ""}
              onComplete={handleQuizComplete}
              onExit={() => setIsQuizStarted(false)}
            />

            <Dialog open={isReferenceOpen} onOpenChange={setIsReferenceOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Thông tin ngữ pháp</DialogTitle>
                  <DialogDescription>
                    Xem lại kiến thức ngữ pháp trước khi làm bài kiểm tra
                  </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-hidden">
                  <GrammarReference grammar={selectedGrammar || null} />
                </div>

                <DialogFooter>
                  <Button onClick={() => setIsReferenceOpen(false)}>
                    Đóng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Tìm kiếm ngữ pháp hoặc khóa học..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Lọc
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Sidebar: Grammar categories */}
              <div className="space-y-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="learning">Đang học</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative">
                  <h2 className="mb-3 text-lg font-semibold text-game-accent">
                    Phần ngữ pháp
                  </h2>
                  <ScrollArea className="h-[560px]">
                    <div className="space-y-2 pr-4">
                      {isCategoriesLoading ? (
                        <div className="flex justify-center py-10">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
                        </div>
                      ) : filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <Card
                            key={category.categoryId}
                            className={`overflow-hidden transition-all hover:shadow-md ${
                              selectedCategoryId === category.categoryId
                                ? "border-game-primary bg-game-primary/5"
                                : "bg-white/90"
                            }`}
                            onClick={() =>
                              handleCategorySelect(category.categoryId)
                            }
                          >
                            <CardHeader className="p-4">
                              <CardTitle className="flex items-center justify-between text-base">
                                <span className="line-clamp-1">
                                  {category.categoryName}
                                </span>
                                {studiedCategoriesIds.includes(
                                  category.categoryId
                                ) && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-xs">
                                {category.totalGrammar || 0} điểm ngữ pháp
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))
                      ) : (
                        <div className="py-10 text-center text-gray-500">
                          <p>Không tìm thấy phần ngữ pháp nào</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Main Content: Grammar points or select message */}
              <div className="md:col-span-2">
                {selectedCategoryId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-game-accent">
                        {selectedCategory?.categoryName || "Điểm ngữ pháp"}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCategoryInfo(true)}
                        className="text-sm"
                      >
                        Thông tin
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {isGrammarLoading ? (
                        <div className="flex justify-center py-10">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
                        </div>
                      ) : filteredGrammarContents.length > 0 ? (
                        filteredGrammarContents.map((grammar, index) => (
                          <motion.div
                            key={grammar.contentId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Card
                              className={`overflow-hidden transition-all hover:shadow-md ${
                                selectedGrammarId === grammar.contentId
                                  ? "border-game-primary bg-game-primary/5"
                                  : "bg-white/90"
                              }`}
                              onClick={() =>
                                handleGrammarSelect(grammar.contentId)
                              }
                            >
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="line-clamp-1 text-base">
                                    {grammar.title}
                                  </CardTitle>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${
                                        formatDifficulty(
                                          index,
                                          filteredGrammarContents.length
                                        ) === "Dễ"
                                          ? "bg-green-50 text-green-700"
                                          : formatDifficulty(
                                              index,
                                              filteredGrammarContents.length
                                            ) === "Trung bình"
                                          ? "bg-amber-50 text-amber-700"
                                          : "bg-red-50 text-red-700"
                                      }
                                    `}
                                  >
                                    {formatDifficulty(
                                      index,
                                      filteredGrammarContents.length
                                    )}
                                  </Badge>
                                </div>
                                <CardDescription className="line-clamp-2 text-xs">
                                  {grammar.explanation.substring(0, 100)}...
                                </CardDescription>
                              </CardHeader>
                              <CardFooter className="flex gap-2 bg-gray-50 p-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGrammarSelect(grammar.contentId);
                                    setIsReferenceOpen(true);
                                  }}
                                >
                                  <BookOpen className="mr-2 h-3.5 w-3.5" />
                                  Học ngữ pháp
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-game-primary text-white hover:bg-game-primary/90"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGrammarSelect(grammar.contentId);
                                    setIsQuizStarted(true);
                                  }}
                                >
                                  <BarChart2 className="mr-2 h-3.5 w-3.5" />
                                  Làm bài tập
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-10 text-center">
                          <BookOpen className="mb-4 h-10 w-10 text-gray-400" />
                          <h3 className="mb-1 text-lg font-medium">
                            Không tìm thấy ngữ pháp nào
                          </h3>
                          <p className="text-sm text-gray-500">
                            Thử thay đổi từ khóa tìm kiếm của bạn
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
                    <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-xl font-medium">
                      Chọn một phần ngữ pháp
                    </h3>
                    <p className="mb-6 max-w-md text-gray-500">
                      Hãy chọn một phần ngữ pháp từ danh sách bên trái để xem
                      các điểm ngữ pháp và làm bài tập
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category information dialog */}
        <Dialog open={showCategoryInfo} onOpenChange={setShowCategoryInfo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory?.categoryName || "Thông tin phần ngữ pháp"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 font-medium">Mô tả</h3>
                <p className="text-sm text-gray-600">
                  {selectedCategory?.description || "Không có mô tả chi tiết."}
                </p>
              </div>

              <div>
                <h3 className="mb-1 font-medium">Số lượng điểm ngữ pháp</h3>
                <p className="text-sm font-medium text-game-primary">
                  {selectedCategory?.totalGrammar || 0} điểm
                </p>
              </div>

              <div>
                <h3 className="mb-1 font-medium">Tiến trình học tập</h3>
                {userProgress.find(
                  (progress) => progress.categoryId === selectedCategoryId
                ) ? (
                  <div className="text-sm text-green-600">
                    <CheckCircle className="mr-2 inline-block h-4 w-4" />
                    Đã bắt đầu học
                  </div>
                ) : (
                  <div className="text-sm text-amber-600">
                    <Clock className="mr-2 inline-block h-4 w-4" />
                    Chưa bắt đầu học
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowCategoryInfo(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
