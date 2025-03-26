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

// Đăng ký plugins
dayjs.extend(relativeTime);
dayjs.locale("vi");

// Định nghĩa các interface để giải quyết vấn đề type
interface CategoryStats {
  categoryId: number;
  categoryName: string;
  totalWords: number;
  learnedWords: number;
  progress: number;
}

interface LearnedStats {
  totalLearnedWords: number;
  totalCategories: number;
  categoriesStats: CategoryStats[];
}

interface WordStats {
  correctCount: number;
  incorrectCount: number;
  totalAnswers: number;
  lastAnswered: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  totalWords: number;
}

interface LearnedWord {
  wordId: number;
  word: string;
  pronunciation?: string;
  definition: string;
  exampleSentence?: string;
  partOfSpeech?: string;
  category?: Category;
  categoryId: number;
  stats: WordStats;
}

interface LearnedWordsData {
  words: LearnedWord[];
  total: number;
}

export default function LearnedVocabularyPage() {
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
  const [previewWord, setPreviewWord] = useState<any>(null);

  // Lấy thống kê tổng quan về từ vựng đã học
  const { data: learnedStats, isLoading: isStatsLoading } =
    trpc.userLearnedWords.getLearnedWordsStats.useQuery();

  // Lấy danh sách các khóa học từ vựng có sẵn cho filter
  const { data: categories = [], isLoading: isCategoriesLoading } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: true,
    });

  // Lấy danh sách từ vựng đã học
  const {
    data: learnedWordsData,
    isLoading: isLearnedWordsLoading,
    refetch: refetchLearnedWords,
  } = trpc.userLearnedWords.getLearnedWords.useQuery(
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

  // Theo dõi thay đổi tham số và cập nhật URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (searchKeyword) params.set("search", searchKeyword);
    if (selectedCategory && selectedCategory !== "all")
      params.set("categoryId", selectedCategory);

    const queryString = params.toString();
    const url = `/vocabulary/learned${queryString ? `?${queryString}` : ""}`;

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

  // Xử lý hiển thị preview của từ vựng
  const handlePreview = (word: any) => {
    setPreviewWord(word);
    setShowPreviewDialog(true);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil((learnedWordsData?.total || 0) / 10);

  // Component hiển thị khi không có dữ liệu
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-3">
        <BookOpen className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-medium text-gray-600">
        Chưa có từ vựng nào đã học
      </h3>
      <p className="mb-6 max-w-md text-gray-500">
        Bạn chưa học từ vựng nào hoặc chưa trả lời đúng. Hãy học từ vựng để danh
        sách hiện thị ở đây!
      </p>
      <Button
        className="game-button"
        onClick={() => router.push("/vocabulary")}
      >
        Bắt đầu học từ vựng
      </Button>
    </div>
  );

  // Loading state
  if (isStatsLoading || isCategoriesLoading) {
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

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Tiêu đề và tổng quan */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-game-accent">
            Từ vựng đã học
          </h1>
          <p className="text-game-accent/70">
            Danh sách các từ vựng bạn đã học và trả lời đúng, phân loại theo
            khóa học.
          </p>
        </div>

        {/* Thống kê tổng quan */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Tổng số từ đã học</CardDescription>
              <CardTitle className="text-3xl font-bold text-game-primary">
                {learnedStats?.totalLearnedWords || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Số khóa học đã tham gia</CardDescription>
              <CardTitle className="text-3xl font-bold text-game-primary">
                {learnedStats?.totalCategories || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Tiến độ trung bình</CardDescription>
              <CardTitle className="text-3xl font-bold text-game-primary">
                {learnedStats?.categoriesStats &&
                learnedStats.categoriesStats.length > 0
                  ? Math.round(
                      // @ts-ignore - Bỏ qua type checking cho reduce function
                      learnedStats.categoriesStats.reduce(
                        (acc, cat) => acc + (cat?.progress || 0),
                        0
                      ) / learnedStats.categoriesStats.length
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tìm kiếm và lọc */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center gap-2"
          >
            <Input
              className="flex-1 border-0 bg-white shadow-sm placeholder:text-gray-400"
              placeholder="Tìm kiếm từ vựng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Button type="submit" variant="default" className="game-button">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[180px] border-0 bg-white shadow-sm">
                <SelectValue placeholder="Tất cả khóa học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khóa học</SelectItem>
                {categories.map((category) => (
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

        {/* Danh sách từ vựng đã học */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          {isLearnedWordsLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
            </div>
          ) : learnedWordsData?.words && learnedWordsData.words.length > 0 ? (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-game-accent">
                        Từ vựng
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-game-accent">
                        Nghĩa
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-game-accent">
                        Khóa học
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-game-accent">
                        Thống kê
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-game-accent">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* @ts-ignore - Bỏ qua type checking cho map function */}
                    {learnedWordsData?.words?.map((word) => (
                      <tr key={word.wordId} className="bg-white">
                        <td className="whitespace-nowrap px-4 py-3 text-game-accent">
                          <div className="font-medium">{word.word}</div>
                          <div className="text-xs text-gray-500">
                            {word.pronunciation}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-game-accent">
                          <div className="max-w-xs truncate">
                            {word.definition}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-game-accent">
                          {word.category?.categoryName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-green-500/30 bg-green-50 text-green-600"
                            >
                              <Check className="mr-1 h-3 w-3" />{" "}
                              {word.stats.correctCount}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-red-500/30 bg-red-50 text-red-600"
                            >
                              <X className="mr-1 h-3 w-3" />{" "}
                              {word.stats.incorrectCount}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-gray-400/30 bg-gray-50 text-gray-600"
                            >
                              <Clock className="mr-1 h-3 w-3" />{" "}
                              {dayjs(word.stats.lastAnswered).fromNow()}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-game-primary/30 text-game-primary hover:bg-game-primary/10"
                            onClick={() => handlePreview(word)}
                          >
                            <Eye className="mr-1 h-3 w-3" /> Xem
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center py-4">
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
        </div>
      </div>

      {/* Dialog xem trước từ vựng */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {previewWord?.word}
              {previewWord?.pronunciation && (
                <span className="ml-2 text-base font-normal text-gray-500">
                  {previewWord.pronunciation}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium text-game-accent">
                Thông tin từ vựng
              </h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-4">
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    Nghĩa:
                  </p>
                  <p className="text-game-accent">{previewWord?.definition}</p>
                </div>

                {previewWord?.partOfSpeech && (
                  <div className="mb-4">
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Loại từ:
                    </p>
                    <Badge variant="secondary">
                      {previewWord.partOfSpeech}
                    </Badge>
                  </div>
                )}

                {previewWord?.exampleSentence && (
                  <div className="mb-4">
                    <p className="mb-1 text-sm font-medium text-gray-500">
                      Ví dụ:
                    </p>
                    <p
                      className="text-game-accent/70"
                      dangerouslySetInnerHTML={{
                        __html: previewWord.exampleSentence.replace(
                          "____",
                          `<span class="font-bold text-game-primary">${previewWord.word}</span>`
                        ),
                      }}
                    />
                  </div>
                )}

                <div>
                  <p className="mb-1 text-sm font-medium text-gray-500">
                    Khóa học:
                  </p>
                  <Badge className="bg-game-primary/10 text-game-primary">
                    {previewWord?.category?.categoryName}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-medium text-game-accent">
                Thống kê học tập
              </h3>
              <div className="rounded-lg bg-gray-50 p-4">
                {previewWord?.stats && (
                  <>
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <p className="text-sm font-medium text-green-700">
                          Trả lời đúng
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {previewWord.stats.correctCount}
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3 text-center">
                        <p className="text-sm font-medium text-red-700">
                          Trả lời sai
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {previewWord.stats.incorrectCount}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="mb-1 text-sm font-medium text-gray-500">
                        Tổng số lần trả lời:
                      </p>
                      <p className="font-medium text-game-accent">
                        {previewWord.stats.totalAnswers} lần
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="mb-1 text-sm font-medium text-gray-500">
                        Tỷ lệ chính xác:
                      </p>
                      <p className="font-medium text-game-accent">
                        {previewWord.stats.totalAnswers > 0
                          ? Math.round(
                              (previewWord.stats.correctCount /
                                previewWord.stats.totalAnswers) *
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
                      <p className="font-medium text-game-accent">
                        {dayjs(previewWord.stats.lastAnswered).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                        <span className="ml-2 text-sm text-gray-500">
                          ({dayjs(previewWord.stats.lastAnswered).fromNow()})
                        </span>
                      </p>
                    </div>
                  </>
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
                router.push(`/vocabulary/${previewWord?.categoryId}`);
              }}
            >
              Đi đến khóa học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
