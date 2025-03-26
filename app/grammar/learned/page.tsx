"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Check, X, Eye, Clock } from "lucide-react";
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

  // Lấy danh sách nội dung ngữ pháp theo category
  const {
    data: grammarContents = [],
    isLoading: isGrammarContentsLoading,
    refetch: refetchGrammarContents,
  } = trpc.grammarContent.getAll.useQuery(
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

  // Tính tổng số trang
  const totalItems = Array.isArray(grammarContents)
    ? grammarContents.length
    : 0;
  const totalPages = Math.ceil(totalItems / 10);

  // Lọc danh sách ngữ pháp dựa trên khóa học đã đăng ký
  const filteredGrammarContents = Array.isArray(grammarContents)
    ? grammarContents.filter((grammar) => {
        // Nếu không chọn category cụ thể, hiển thị tất cả ngữ pháp từ các khóa học đã đăng ký
        if (selectedCategory === "all") {
          return learningProgress.some(
            (progress) => progress.categoryId === grammar.categoryId
          );
        }
        // Nếu chọn category cụ thể, kiểm tra xem đã đăng ký chưa
        return (
          grammar.categoryId === parseInt(selectedCategory) &&
          learningProgress.some(
            (progress) => progress.categoryId === grammar.categoryId
          )
        );
      })
    : [];

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

        {/* Dialog xem chi tiết ngữ pháp */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl text-game-accent">
                {previewGrammar?.title}
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[500px] pr-4">
              {/* Phần chính */}
              <div className="space-y-4 p-1">
                {/* Chi tiết ngữ pháp */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-game-primary">
                    Giải thích
                  </h3>
                  <div className="rounded-md bg-gray-50 p-3 text-gray-800">
                    <p style={{ whiteSpace: "pre-line" }}>
                      {previewGrammar?.explanation}
                    </p>
                  </div>
                </div>

                {/* Ví dụ */}
                {previewGrammar?.examples && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-game-primary">Ví dụ</h3>
                    <div className="rounded-md bg-gray-50 p-3 text-gray-800">
                      <p style={{ whiteSpace: "pre-line" }}>
                        {previewGrammar.examples}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ghi chú */}
                {previewGrammar?.notes && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-game-primary">Ghi chú</h3>
                    <div className="rounded-md bg-gray-50 p-3 text-gray-800">
                      <p style={{ whiteSpace: "pre-line" }}>
                        {previewGrammar.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Thông tin khóa học */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-game-primary">Khóa học</h3>
                  <div className="rounded-md bg-gray-50 p-3 text-gray-800">
                    <p>
                      {previewGrammar?.category?.categoryName ||
                        "Không có thông tin"}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button
                className="game-button"
                onClick={() => setShowPreviewDialog(false)}
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
