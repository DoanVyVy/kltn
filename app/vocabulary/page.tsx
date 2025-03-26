"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen, Clock, Eye } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import { VocabularyModeDialog } from "@/components/vocabulary-mode-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

// Tạo truy vấn API mới để đếm từ vựng cho mỗi category
const useVocabularyCounts = (categoryIds: number[]) => {
  const utils = trpc.useUtils();
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      if (categoryIds.length === 0) return;

      setIsLoading(true);
      try {
        const results = await Promise.all(
          categoryIds.map(async (categoryId) => {
            const words = await utils.vocabulary.getAll.fetch({
              page: 1,
              limit: 1000, // Lấy đủ số lượng từ vựng
              categoryId: categoryId,
            });
            return { categoryId, count: words.length };
          })
        );

        const newCounts: Record<number, number> = {};
        results.forEach((result) => {
          newCounts[result.categoryId] = result.count;
        });

        setCounts(newCounts);
      } catch (error) {
        console.error("Lỗi khi đếm từ vựng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [categoryIds, utils.vocabulary.getAll]);

  return { vocabularyCounts: counts, isLoading };
};

export default function VocabularyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("learning");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<any>(null);
  const [previewWords, setPreviewWords] = useState<any[]>([]);
  const [isLoadingVocabulary, setIsLoadingVocabulary] = useState(false);

  // Lấy danh sách các khóa học từ vựng mà người dùng đang học
  const { data: learningCourses = [], isLoading: isLoadingLearning } =
    trpc.userProcess.getCategoryProcesses.useQuery();

  // Lấy tất cả các khóa học từ vựng có sẵn
  const { data: allCourses = [], isLoading: isLoadingCourses } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: true,
    });

  // Lấy các category IDs cho truy vấn đếm từ vựng
  const categoryIds = useMemo(() => {
    return allCourses.map((course) => course.categoryId);
  }, [allCourses]);

  // Sử dụng hook để lấy số từ vựng thực tế
  const { vocabularyCounts, isLoading: isLoadingCounts } =
    useVocabularyCounts(categoryIds);

  // In log chi tiết để xem dữ liệu thực tế của totalWords trong mỗi khóa học
  useEffect(() => {
    if (allCourses.length > 0) {
      console.log("Chi tiết số từ vựng trong các khóa học:");
      allCourses.forEach((course) => {
        const realCount = vocabularyCounts
          ? vocabularyCounts[course.categoryId] || 0
          : 0;
        console.log(
          `Khóa học ${course.categoryName}: DB totalWords = ${course.totalWords}, API count = ${realCount}`
        );
      });
    }
  }, [allCourses, vocabularyCounts]);

  // Lọc khóa học dựa trên từ khóa tìm kiếm
  const filteredCourses = allCourses.filter(
    (course) =>
      course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Lọc các khóa học đang học
  const learningVocabularyCourses = learningCourses.filter(
    (progress) => progress.category?.totalWords! > 0
  );

  const { mutateAsync: registerCourse } =
    trpc.userProcess.userRegisterCategory.useMutation();
  const utils = trpc.useUtils();

  const handleRegister = async () => {
    await registerCourse({
      categoryId: selectedCourseId,
    });
    utils.userProcess.getCategoryProcesses.invalidate();
    setShowModeDialog(false);
  };

  // Hàm lấy dữ liệu từ vựng theo khóa học
  const fetchVocabulary = async (categoryId: number) => {
    setIsLoadingVocabulary(true);
    try {
      const data = await utils.vocabulary.getAll.fetch({
        page: 1,
        limit: 100,
        categoryId: categoryId,
      });
      setPreviewWords(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy từ vựng:", error);
      setPreviewWords([]);
    } finally {
      setIsLoadingVocabulary(false);
    }
  };

  // Hiển thị dialog xem trước từ vựng với dữ liệu thật
  const handlePreview = (course: any) => {
    setPreviewCourse(course);
    setShowPreviewDialog(true);

    if (course?.categoryId) {
      fetchVocabulary(course.categoryId);
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-game-accent">Học Từ Vựng</h1>
          <p className="text-game-accent/80">
            Mở rộng vốn từ vựng tiếng Anh của bạn thông qua các phương pháp học
            hiệu quả
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Tìm kiếm khóa học từ vựng..."
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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-game-accent">Từ vựng</h1>
            <p className="text-game-accent/70">
              Học và luyện tập từ vựng tiếng Anh theo chủ đề
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-game-primary/30 bg-game-primary/5 text-game-primary hover:bg-game-primary/10"
              onClick={() => router.push("/vocabulary/learned")}
            >
              <BookOpen className="h-4 w-4" />
              Từ vựng đã học
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="learning"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-game-background">
            <TabsTrigger
              value="learning"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Đang học
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Khám phá
            </TabsTrigger>
          </TabsList>

          {/* Tab Đang học */}
          <TabsContent value="learning" className="space-y-6">
            {isLoadingLearning ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
              </div>
            ) : learningVocabularyCourses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {learningVocabularyCourses.map((progress) => (
                  <motion.div
                    key={progress.categoryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="game-card h-full transition-all hover:border-game-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-game-accent">
                          {progress.category?.categoryName}
                        </CardTitle>
                        <CardDescription className="text-game-accent/70">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {progress.lastPracticed
                              ? dayjs(progress.lastPracticed).format(
                                  "DD/MM/YYYY"
                                )
                              : "Chưa học"}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>
                              Tổng số từ vựng:{" "}
                              {progress.category?.totalWords ?? 0} từ (Đã học:{" "}
                              {Math.round(
                                (progress.processPercentage *
                                  (progress.category?.totalWords || 0)) /
                                  100
                              )}{" "}
                              từ)
                            </span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-game-accent">Tiến độ</span>
                            <span className="text-game-primary">
                              {progress.processPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <Progress
                            value={parseInt(
                              progress.processPercentage.toFixed(0)
                            )}
                            className="h-2 bg-white"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="border-blue-300 bg-blue-50 text-blue-700"
                          >
                            {Math.round(
                              (progress.processPercentage *
                                (progress.category?.totalWords || 0)) /
                                100
                            )}{" "}
                            / {progress.category?.totalWords || 0} từ
                          </Badge>

                          <Badge
                            variant="outline"
                            className="border-game-primary/30 text-game-primary"
                          >
                            Cấp độ {progress.category?.difficultyLevel || 1}
                          </Badge>
                        </div>

                        <p className="mt-2 text-sm text-game-accent/70">
                          {progress.category?.description || "Không có mô tả"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button
                          className="game-button flex-1"
                          onClick={() => {
                            setSelectedCourseId(progress.categoryId!);
                            setShowModeDialog(true);
                          }}
                        >
                          Tiếp tục học
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handlePreview(progress.category)}
                        >
                          <Eye className="h-4 w-4" />
                          Xem trước
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
                <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-xl font-medium text-gray-600">
                  Chưa có khóa học nào đang học
                </h3>
                <p className="mb-6 max-w-md text-center text-gray-500">
                  Bạn chưa bắt đầu học khóa học từ vựng nào. Hãy khám phá các
                  khóa học có sẵn và bắt đầu học nào!
                </p>
                <Button
                  className="game-button"
                  onClick={() => setActiveTab("explore")}
                >
                  Khám phá ngay
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Tab Khám phá */}
          <TabsContent value="explore" className="space-y-6">
            {isLoadingCourses ? (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course.categoryId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="game-card h-full transition-all hover:border-game-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl text-game-accent">
                          {course.categoryName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 text-game-accent/70">
                          <BookOpen className="h-4 w-4" />
                          <span>
                            {vocabularyCounts &&
                            vocabularyCounts[course.categoryId]
                              ? vocabularyCounts[course.categoryId]
                              : typeof course.totalWords === "number"
                              ? course.totalWords
                              : 0}{" "}
                            từ vựng
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-game-accent/70">
                          {course.description || "Không có mô tả"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Badge
                          variant="outline"
                          className="border-game-primary/30 text-game-primary"
                        >
                          <span>
                            {vocabularyCounts &&
                            vocabularyCounts[course.categoryId]
                              ? vocabularyCounts[course.categoryId]
                              : typeof course.totalWords === "number"
                              ? course.totalWords
                              : 0}{" "}
                            từ
                          </span>
                        </Badge>
                        <div className="flex-1"></div>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => handlePreview(course)}
                        >
                          <Eye className="h-4 w-4" />
                          Xem trước
                        </Button>
                        <Button
                          className="game-button"
                          onClick={() => {
                            setSelectedCourseId(course.categoryId);
                            setShowModeDialog(true);
                          }}
                        >
                          Bắt đầu học
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
                <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-xl font-medium text-gray-600">
                  Không tìm thấy khóa học nào
                </h3>
                <p className="mb-6 max-w-md text-center text-gray-500">
                  Không có khóa học từ vựng nào phù hợp với tìm kiếm của bạn
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog xem trước từ vựng */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Từ vựng khóa học: {previewCourse?.categoryName}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Tổng số từ vựng: {previewCourse?.totalWords || 0} từ (Đã tải:{" "}
                {previewWords.length} từ)
              </p>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto">
              {isLoadingVocabulary ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
                </div>
              ) : previewWords.length > 0 ? (
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">
                        STT
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">
                        Từ vựng
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">
                        Nghĩa
                      </th>
                      <th className="hidden px-4 py-2 text-left text-sm font-medium text-game-accent md:table-cell">
                        Ví dụ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewWords.map((word, index) => (
                      <tr key={word.wordId} className="bg-white">
                        <td className="px-4 py-3 text-sm text-game-accent">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-game-primary">
                          {word.word}
                          {word.pronunciation && (
                            <span className="ml-2 text-xs text-gray-500">
                              {word.pronunciation}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-game-accent">
                          {word.definition}
                          {word.partOfSpeech && (
                            <span className="ml-1 text-xs italic text-gray-500">
                              ({word.partOfSpeech})
                            </span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-game-accent/70 md:table-cell">
                          {word.exampleSentence || "Không có ví dụ"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-center text-gray-500">
                    Không có từ vựng nào trong khóa học này hoặc đang tải dữ
                    liệu
                  </p>
                </div>
              )}
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
                  if (previewCourse) {
                    setSelectedCourseId(previewCourse.categoryId);
                    setShowModeDialog(true);
                  }
                }}
              >
                Bắt đầu học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <VocabularyModeDialog
        open={showModeDialog}
        onOpenChange={setShowModeDialog}
        courseId={selectedCourseId}
        onRegister={handleRegister}
      />
    </div>
  );
}

const DIFICULTY_LEVELS = [
  { value: 1, label: "Sơ cấp" },
  { value: 2, label: "Trung cấp" },
  { value: 3, label: "Cao cấp" },
  { value: 4, label: "Nâng cao" },
];
