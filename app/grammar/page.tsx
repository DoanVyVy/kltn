"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Plus,
  Bookmark,
  BookOpenCheck,
  GraduationCap,
  Eye,
} from "lucide-react";
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
import { GrammarModeDialog } from "@/components/grammar-mode-dialog";
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

// Tạo truy vấn API mới để đếm ngữ pháp cho mỗi category
const useGrammarCounts = (categoryIds: number[]) => {
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
            const grammars = await utils.grammarContent.getAll.fetch({
              page: 1,
              limit: 1000, // Lấy đủ số lượng ngữ pháp
              categoryId: categoryId,
            });
            return { categoryId, count: grammars.length };
          })
        );

        const newCounts: Record<number, number> = {};
        results.forEach((result) => {
          newCounts[result.categoryId] = result.count;
        });

        setCounts(newCounts);
      } catch (error) {
        console.error("Lỗi khi đếm ngữ pháp:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [categoryIds, utils.grammarContent.getAll]);

  return { grammarCounts: counts, isLoading };
};

export default function GrammarPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("learning");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<any>(null);
  const [previewGrammars, setPreviewGrammars] = useState<any[]>([]);
  const [isLoadingGrammar, setIsLoadingGrammar] = useState(false);

  // Lấy danh sách các khóa học ngữ pháp mà người dùng đang học
  const { data: learningCourses = [], isLoading: isLoadingLearning } =
    trpc.userProcess.getCategoryProcesses.useQuery();

  // Lấy tất cả các khóa học ngữ pháp có sẵn
  const { data: allCourses = [], isLoading: isLoadingCourses } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: false,
    });

  // Lấy các category IDs cho truy vấn đếm ngữ pháp
  const categoryIds = useMemo(() => {
    return allCourses.map((course) => course.categoryId);
  }, [allCourses]);

  // Sử dụng hook để lấy số ngữ pháp thực tế
  const { grammarCounts, isLoading: isLoadingCounts } =
    useGrammarCounts(categoryIds);

  // In log chi tiết để xem dữ liệu thực tế của totalGrammar trong mỗi khóa học
  useEffect(() => {
    if (allCourses.length > 0) {
      console.log("Chi tiết số điểm ngữ pháp trong các khóa học:");
      allCourses.forEach((course) => {
        const realCount = grammarCounts
          ? grammarCounts[course.categoryId] || 0
          : 0;
        console.log(
          `Khóa học ${course.categoryName}: DB totalGrammar = ${course.totalGrammar}, API count = ${realCount}`
        );
      });
    }
  }, [allCourses, grammarCounts]);

  // Lọc khóa học dựa trên từ khóa tìm kiếm
  const filteredCourses = allCourses.filter(
    (course) =>
      course.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Lọc các khóa học đang học
  const learningGrammarCourses = learningCourses.filter(
    (progress) => progress.category?.totalGrammar! > 0
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

  // Hàm lấy dữ liệu ngữ pháp theo khóa học
  const fetchGrammar = async (categoryId: number) => {
    setIsLoadingGrammar(true);
    try {
      const data = await utils.grammarContent.getAll.fetch({
        page: 1,
        limit: 100,
        categoryId: categoryId,
      });
      setPreviewGrammars(data || []);
    } catch (error) {
      console.error("Lỗi khi lấy ngữ pháp:", error);
      setPreviewGrammars([]);
    } finally {
      setIsLoadingGrammar(false);
    }
  };

  // Hiển thị dialog xem trước ngữ pháp với dữ liệu thật
  const handlePreview = (course: any) => {
    setPreviewCourse(course);
    setShowPreviewDialog(true);

    if (course?.categoryId) {
      fetchGrammar(course.categoryId);
    }
  };

  // Mở hộp thoại chọn chế độ học và đăng ký khóa học
  const handleStartLearning = (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowModeDialog(true);
  };

  // Tính tổng số điểm ngữ pháp đã học
  const totalGrammarLearned = learningCourses
    .filter((progress) => progress.category?.totalGrammar! > 0)
    .reduce(
      (acc, progress) =>
        acc +
        (progress.category?.totalGrammar! * progress.processPercentage) / 100,
      0
    );

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-game-accent">
            Ngữ pháp tiếng Anh
          </h1>
          <p className="text-game-accent/80">
            Học và thực hành các quy tắc ngữ pháp tiếng Anh quan trọng
          </p>
        </div>

        {/* Dashboard tổng quan */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-game-accent">
                Khóa học
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="mr-3 h-8 w-8 text-game-primary/70" />
                  <div>
                    <p className="text-2xl font-bold text-game-primary">
                      {learningGrammarCourses.length}
                    </p>
                    <p className="text-xs text-gray-500">Khóa học đang học</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-game-primary"
                  onClick={() => setActiveTab("explore")}
                >
                  Khám phá
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-game-accent">
                Tiến độ học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <GraduationCap className="mr-3 h-8 w-8 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold text-game-primary">
                      {Math.round(totalGrammarLearned)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Điểm ngữ pháp đã học
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-game-primary"
                  onClick={() => router.push("/grammar/learned")}
                >
                  Xem đã học
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-game-accent">
                Học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="mb-3 flex items-center">
                  <BookOpenCheck className="mr-3 h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-lg font-semibold text-game-primary">
                      Tiếp tục học
                    </p>
                  </div>
                </div>
                {learningGrammarCourses.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      onClick={() => {
                        const latestCourse = learningGrammarCourses.sort(
                          (a, b) =>
                            new Date(b.lastPracticed || 0).getTime() -
                            new Date(a.lastPracticed || 0).getTime()
                        )[0];

                        if (latestCourse) {
                          handleStartLearning(latestCourse.categoryId!);
                        }
                      }}
                    >
                      Học
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                      onClick={() => router.push("/grammar/game")}
                    >
                      Trò chơi
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                    onClick={() => setActiveTab("explore")}
                  >
                    Bắt đầu học
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-game-accent">Ngữ pháp</h1>
            <p className="text-game-accent/70">
              Học và luyện tập ngữ pháp tiếng Anh theo chủ đề
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-game-primary/30 bg-game-primary/5 text-game-primary hover:bg-game-primary/10"
              onClick={() => router.push("/grammar/learned")}
            >
              <BookOpen className="h-4 w-4" />
              Ngữ pháp đã học
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Tìm kiếm khóa học ngữ pháp..."
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
            ) : learningGrammarCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {learningGrammarCourses.map((progress) => (
                  <motion.div
                    key={progress.progressId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full overflow-hidden bg-white/90 shadow-sm transition-all hover:shadow-md">
                      <CardHeader>
                        <CardTitle className="line-clamp-1 text-xl text-game-accent">
                          {progress.category?.categoryName}
                        </CardTitle>
                        <CardDescription>
                          {progress.category?.totalGrammar || 0} điểm ngữ pháp
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Tiến độ học tập
                            </span>
                            <span className="text-sm font-medium text-game-primary">
                              {Math.round(progress.processPercentage)}%
                            </span>
                          </div>
                          <Progress
                            value={progress.processPercentage}
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          Lần cuối học:{" "}
                          {progress.lastPracticed
                            ? dayjs(progress.lastPracticed).format(
                                "DD/MM/YYYY HH:mm"
                              )
                            : "Chưa học"}
                        </div>
                      </CardContent>
                      <CardFooter className="grid grid-cols-2 gap-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            if (progress.categoryId) {
                              handlePreview(progress.category);
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                        <Button
                          className="w-full"
                          onClick={() => {
                            if (progress.categoryId) {
                              handleStartLearning(progress.categoryId);
                            }
                          }}
                        >
                          Học tiếp
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-3">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-medium text-gray-600">
                  Bạn chưa đăng ký khóa học nào
                </h3>
                <p className="mb-6 max-w-md text-gray-500">
                  Hãy khám phá các khóa học ngữ pháp và bắt đầu học ngay hôm nay
                </p>
                <Button
                  className="bg-game-primary text-white hover:bg-game-primary/90"
                  onClick={() => setActiveTab("explore")}
                >
                  Khám phá khóa học
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses
                  .filter((course) => !course.isVocabularyCourse)
                  .map((course) => (
                    <motion.div
                      key={course.categoryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full overflow-hidden bg-white/90 shadow-sm transition-all hover:shadow-md">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="line-clamp-1 text-xl text-game-accent">
                              {course.categoryName}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="text-game-primary"
                            >
                              {grammarCounts && grammarCounts[course.categoryId]
                                ? grammarCounts[course.categoryId]
                                : course.totalGrammar || 0}{" "}
                              điểm
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2 h-10">
                            {course.description || "Không có mô tả"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            <span>
                              {grammarCounts && grammarCounts[course.categoryId]
                                ? grammarCounts[course.categoryId]
                                : course.totalGrammar || 0}{" "}
                              điểm ngữ pháp
                            </span>
                          </div>
                          {learningGrammarCourses.some(
                            (progress) =>
                              progress.categoryId === course.categoryId
                          ) && (
                            <Badge className="bg-green-100 text-green-800">
                              Đang học
                            </Badge>
                          )}
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handlePreview(course)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem trước
                          </Button>
                          <Button
                            className="w-full"
                            onClick={() =>
                              handleStartLearning(course.categoryId)
                            }
                            disabled={isLoadingLearning}
                          >
                            {learningGrammarCourses.some(
                              (progress) =>
                                progress.categoryId === course.categoryId
                            )
                              ? "Học tiếp"
                              : "Bắt đầu"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-100 p-3">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-medium text-gray-600">
                  Không tìm thấy khóa học
                </h3>
                <p className="mb-6 max-w-md text-gray-500">
                  Không có khóa học nào phù hợp với từ khóa tìm kiếm của bạn
                </p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog chọn chế độ học */}
      <GrammarModeDialog
        open={showModeDialog}
        onOpenChange={setShowModeDialog}
        onStartLearning={() => {
          router.push(`/grammar/learn/${selectedCourseId}`);
          setShowModeDialog(false);
        }}
        onRegister={handleRegister}
      />

      {/* Dialog xem trước từ vựng */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-game-accent">
              {previewCourse?.categoryName || "Xem trước khóa học"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="mb-1 font-medium text-game-primary">Mô tả</h3>
              <p>{previewCourse?.description || "Không có mô tả"}</p>
            </div>

            <div>
              <h3 className="mb-1 font-medium text-game-primary">
                Số lượng điểm ngữ pháp
              </h3>
              <p>
                {grammarCounts && previewCourse?.categoryId
                  ? grammarCounts[previewCourse.categoryId]
                  : previewCourse?.totalGrammar || 0}{" "}
                điểm ngữ pháp
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-game-primary">
                Nội dung ngữ pháp
              </h3>
              {isLoadingGrammar ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-game-primary border-t-transparent"></div>
                </div>
              ) : previewGrammars.length > 0 ? (
                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
                  {previewGrammars.slice(0, 5).map((grammar, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="mb-1 font-medium text-game-accent">
                        {grammar.title}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {grammar.explanation}
                      </p>
                    </div>
                  ))}
                  {previewGrammars.length > 5 && (
                    <div className="mt-2 text-center text-sm text-gray-500">
                      Và {previewGrammars.length - 5} điểm ngữ pháp khác
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-gray-500">
                  Không có dữ liệu ngữ pháp
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4 flex items-center justify-between gap-2 sm:justify-between">
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
                if (previewCourse?.categoryId) {
                  handleStartLearning(previewCourse.categoryId);
                }
              }}
            >
              Bắt đầu học
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
