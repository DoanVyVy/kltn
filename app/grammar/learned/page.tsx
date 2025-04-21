"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Check,
  X,
  Eye,
  Clock,
  Info,
  Image,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Pagination } from "@/components/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import Navigation from "@/components/navigation";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Đăng ký plugins
dayjs.extend(relativeTime);
dayjs.locale("vi");

// Định nghĩa các interface để giải quyết vấn đề type
interface CategoryStats {
  categoryId: number;
  categoryName: string;
  totalGrammar: number;
  learnedGrammar: number;
  progress: number;
}

interface LearnedStats {
  totalLearnedGrammar: number;
  totalCategories: number;
  categoriesStats: CategoryStats[];
}

interface GrammarStats {
  correctCount: number;
  incorrectCount: number;
  totalAnswers: number;
  lastAnswered: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  totalGrammar: number;
}

interface LearnedGrammar {
  contentId: number;
  title: string;
  explanation: string;
  examples?: string;
  notes?: string;
  category?: Category;
  categoryId: number;
  stats: GrammarStats;
}

interface LearnedGrammarData {
  grammarContents: LearnedGrammar[];
  total: number;
}

export default function LearnedGrammarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const searchParam = searchParams.get("search");
  const categoryParam = searchParams.get("categoryId");

  // State
  const [currentPage, setCurrentPage] = useState(
    pageParam ? parseInt(pageParam) : 1
  );
  const [searchKeyword, setSearchKeyword] = useState(searchParam || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "all"
  );
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewGrammar, setPreviewGrammar] = useState<any>(null);

  // Lấy danh sách các khóa học ngữ pháp có sẵn cho filter
  const { data: categories = [], isLoading: isCategoriesLoading } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: false,
    });

  // Lấy danh sách nội dung ngữ pháp đã học
  const {
    data: learnedGrammarData = { grammarContents: [], total: 0 },
    isLoading: isGrammarContentsLoading,
    refetch: refetchGrammarContents,
  } = trpc.userLearnedWords.getLearnedGrammar.useQuery(
    {
      page: currentPage,
      limit: 10,
      search: searchKeyword,
      categoryId:
        selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    },
    {
      enabled: true,
    }
  );

  const filteredGrammarContents = learnedGrammarData.grammarContents || [];
  const totalItems = learnedGrammarData.total || 0;
  const totalPages = Math.ceil(totalItems / 10);

  // Lấy tiến trình học ngữ pháp của người dùng
  const { data: learningProgress = [], isLoading: isProgressLoading } =
    trpc.userProcess.getCategoryProcesses.useQuery();

  // Theo dõi thay đổi tham số và cập nhật URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchKeyword) params.set("search", searchKeyword);
    if (selectedCategory && selectedCategory !== "all")
      params.set("categoryId", selectedCategory);

    const queryString = params.toString();
    const url = `/grammar/learned${queryString ? `?${queryString}` : ""}`;

    router.push(url, { scroll: false });
  }, [currentPage, searchKeyword, selectedCategory, router]);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý thay đổi category
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset về trang 1 khi đổi category
  };

  // Xử lý hiển thị preview của ngữ pháp
  const handlePreview = (grammar: any) => {
    setPreviewGrammar(grammar);
    setShowPreviewDialog(true);
  };

  // Tìm tiến trình cho category
  const getCategoryProgress = (categoryId: number) => {
    return learningProgress.find(
      (progress) => progress.categoryId === categoryId
    );
  };

  // Component hiển thị khi không có dữ liệu
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        <BookOpen className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-medium text-gray-600">
        Chưa có ngữ pháp nào đã học
      </h3>
      <p className="mb-6 max-w-md text-gray-500">
        Bạn chưa học ngữ pháp nào hoặc chưa đăng ký khóa học ngữ pháp. Hãy đăng
        ký và học ngữ pháp để danh sách hiển thị ở đây!
      </p>
      <Button className="game-button" onClick={() => router.push("/grammar")}>
        Bắt đầu học ngữ pháp
      </Button>
    </div>
  );

  // Loading state
  if (isCategoriesLoading || isGrammarContentsLoading || isProgressLoading) {
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

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-game-accent">
            Ngữ Pháp Đã Học
          </h1>
          <p className="text-game-accent/80">
            Xem lại tất cả các ngữ pháp bạn đã học
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Số lượng ngữ pháp đã học */}
          <Card className="game-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-game-accent">
                Ngữ pháp đã học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-game-primary" />
                <span className="text-2xl font-bold text-game-primary">
                  {filteredGrammarContents.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Số lượng khóa học đã đăng ký */}
          <Card className="game-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-game-accent">
                Khóa học ngữ pháp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-game-primary" />
                <span className="text-2xl font-bold text-game-primary">
                  {
                    learningProgress.filter(
                      (p) => !p.category?.isVocabularyCourse
                    ).length
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:flex lg:items-center lg:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Tìm kiếm ngữ pháp..."
                className="pl-10"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Button type="submit" className="game-button">
              Tìm
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="h-10 w-[180px] bg-white">
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khóa học</SelectItem>
                {categories
                  .filter((category) => !category.isVocabularyCourse)
                  .map((category) => (
                    <SelectItem
                      key={category.categoryId}
                      value={category.categoryId.toString()}
                    >
                      {category.categoryName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Danh sách ngữ pháp đã học */}
        {filteredGrammarContents.length > 0 ? (
          <div className="mb-8 space-y-4">
            {filteredGrammarContents.map((grammar) => (
              <motion.div
                key={grammar.contentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="game-card overflow-hidden transition-all hover:border-game-primary/50">
                  <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-game-accent">
                          {grammar.title}
                        </h3>
                        {getCategoryProgress(grammar.categoryId) && (
                          <Badge variant="outline" className="text-xs">
                            {
                              getCategoryProgress(grammar.categoryId)?.category
                                ?.categoryName
                            }
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-500">
                        {grammar.explanation.substring(0, 150)}
                        {grammar.explanation.length > 150 ? "..." : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-game-primary hover:bg-game-primary hover:text-white"
                        onClick={() => handlePreview(grammar)}
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Dialog xem trước ngữ pháp */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {previewGrammar?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-game-accent">
                  Thông tin ngữ pháp
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  {/* Phần hiển thị thông tin ngữ pháp */}
                  <div className="mb-4">
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Giải thích:
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-game-accent cursor-help">
                            {previewGrammar?.explanation}
                            <Info className="ml-1 inline-block h-3 w-3 text-gray-400" />
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{previewGrammar?.explanation}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {previewGrammar?.examples && (
                    <div className="mb-4">
                      <p className="mb-1 text-sm font-medium text-gray-500">
                        Ví dụ:
                      </p>
                      <div className="space-y-2">
                        {previewGrammar.examples
                          .split("\n")
                          .map((example, index) => (
                            <TooltipProvider key={index}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-game-accent/70 cursor-help">
                                    {example}
                                    <Info className="ml-1 inline-block h-3 w-3 text-gray-400" />
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{example}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                      </div>
                    </div>
                  )}

                  {previewGrammar?.notes && (
                    <div className="mb-4">
                      <p className="mb-1 text-sm font-medium text-gray-500">
                        Ghi chú:
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-game-accent cursor-help">
                              {previewGrammar.notes}
                              <Info className="ml-1 inline-block h-3 w-3 text-gray-400" />
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{previewGrammar.notes}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Khóa học:
                    </p>
                    <Badge className="bg-game-primary/10 text-game-primary">
                      {previewGrammar?.category?.categoryName}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-game-accent">
                  Media và thống kê
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  {/* Media section */}
                  {(previewGrammar?.imageUrl || previewGrammar?.videoUrl) && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-500">
                        Media:
                      </p>
                      <div className="flex flex-col gap-4">
                        {previewGrammar?.imageUrl && (
                          <div>
                            <p className="mb-1 text-sm font-medium text-gray-500">
                              Hình ảnh:
                            </p>
                            <div className="relative mt-2 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={previewGrammar.imageUrl}
                                alt={previewGrammar.title}
                                className="max-h-48 object-contain mx-auto"
                              />
                            </div>
                            <div className="mt-1">
                              <a
                                href={previewGrammar.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                              >
                                <Image className="h-3 w-3" />
                                Xem hình ảnh đầy đủ
                              </a>
                            </div>
                          </div>
                        )}
                        {previewGrammar?.videoUrl && (
                          <div>
                            <p className="mb-1 text-sm font-medium text-gray-500">
                              Video:
                            </p>
                            <div className="relative mt-2 rounded-lg overflow-hidden bg-gray-100">
                              <iframe
                                src={previewGrammar.videoUrl}
                                className="w-full aspect-video rounded-lg"
                                allowFullScreen
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Thống kê */}
                  {previewGrammar?.stats && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-500">
                        Thống kê học tập:
                      </p>
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-green-50 p-3 text-center">
                          <p className="text-sm font-medium text-green-700">
                            Trả lời đúng
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {previewGrammar.stats.correctCount}
                          </p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3 text-center">
                          <p className="text-sm font-medium text-red-700">
                            Trả lời sai
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {previewGrammar.stats.incorrectCount}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">
                          Tổng số lần trả lời:
                        </p>
                        <p className="font-medium text-game-accent">
                          {previewGrammar.stats.totalAnswers} lần
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">
                          Tỷ lệ chính xác:
                        </p>
                        <p className="font-medium text-game-accent">
                          {previewGrammar.stats.totalAnswers > 0
                            ? Math.round(
                                (previewGrammar.stats.correctCount /
                                  previewGrammar.stats.totalAnswers) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-sm font-medium text-gray-500">
                          Lần trả lời gần nhất:
                        </p>
                        {previewGrammar.stats.lastAnswered ? (
                          <p className="font-medium text-game-accent">
                            {dayjs(previewGrammar.stats.lastAnswered).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                            <span className="ml-2 text-sm text-gray-500">
                              (
                              {dayjs(
                                previewGrammar.stats.lastAnswered
                              ).fromNow()}
                              )
                            </span>
                          </p>
                        ) : (
                          <p className="font-medium text-gray-500">
                            Chưa có dữ liệu
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {!previewGrammar?.stats && (
                    <div className="text-center py-4 text-gray-500">
                      Chưa có thông tin thống kê cho ngữ pháp này
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPreviewDialog(false)}
              >
                Đóng
              </Button>
              <Button
                className="game-button"
                onClick={() => {
                  setShowPreviewDialog(false);
                  router.push(`/grammar/${previewGrammar?.categoryId}`);
                }}
              >
                Đi đến khóa học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
