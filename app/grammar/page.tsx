"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Eye,
  BookOpenCheck,
  GraduationCap,
  PenTool,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

// Lazy load dialog components để giảm kích thước bundle ban đầu
const GrammarModeDialogComponent = lazy(() =>
  import("@/components/grammar-mode-dialog").then((mod) => ({
    default: mod.GrammarModeDialog,
  }))
);
const PreviewGrammarDialog = lazy(
  () => import("@/components/grammar/preview-grammar-dialog")
);

// Định nghĩa kiểu dữ liệu
interface Course {
  categoryId: number;
  categoryName: string;
  description?: string | null;
  totalGrammar: number;
  isVocabularyCourse: boolean;
  [key: string]: any;
}

interface Progress {
  progressId?: number;
  categoryId?: number | null;
  processPercentage: number;
  lastPracticed?: string | Date | null;
  category?: Course | null;
  [key: string]: any;
}

// Tách riêng card component để tối ưu hóa rerender
interface GrammarCourseCardProps {
  course: Course;
  progress?: Progress;
  grammarCounts: Record<number, number>;
  onPreview: (course: Course) => void;
  onStartLearning: (courseId: number) => void;
}

// Card component cho khóa học ngữ pháp đang học
const LearningGrammarCourseCard = ({
  progress,
  onPreview,
  onStartLearning,
}: {
  progress: Progress;
  onPreview: (course: Course) => void;
  onStartLearning: (courseId: number) => void;
}) => {
  const router = useRouter();

  if (!progress.category) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full overflow-hidden bg-white/90 shadow-sm transition-all hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-xl text-game-accent">
            {progress.category.categoryName}
          </CardTitle>
          <CardDescription>
            {progress.category.totalGrammar || 0} điểm ngữ pháp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Tiến độ học tập</span>
              <span className="text-sm font-medium text-game-primary">
                {Math.round(progress.processPercentage)}%
              </span>
            </div>
            <Progress
              value={progress.processPercentage}
              className={`h-2 ${
                progress.processPercentage > 70
                  ? "bg-green-500"
                  : progress.processPercentage > 30
                  ? "bg-amber-500"
                  : "bg-game-primary"
              }`}
            />
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <Clock className="mr-1 h-3 w-3" />
            Lần cuối học:{" "}
            {progress.lastPracticed
              ? new Date(progress.lastPracticed).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Chưa học"}
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-3 gap-2">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              if (progress.category) {
                onPreview(progress.category);
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
                onStartLearning(progress.categoryId);
              }
            }}
          >
            Học tiếp
          </Button>
          <Button
            className="w-full bg-teal-500 text-white hover:bg-teal-600"
            onClick={() => {
              if (progress.categoryId) {
                router.push(`/grammar/practice/${progress.categoryId}`);
              }
            }}
          >
            <PenTool className="mr-2 h-4 w-4" />
            Luyện tập
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Card component cho khóa học ngữ pháp để khám phá
const ExploreGrammarCourseCard = ({
  course,
  grammarCounts,
  isLearning,
  onPreview,
  onStartLearning,
}: {
  course: Course;
  grammarCounts: Record<number, number>;
  isLearning: boolean;
  onPreview: (course: Course) => void;
  onStartLearning: (courseId: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full overflow-hidden bg-white/90 shadow-sm transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1 text-xl text-game-accent">
              {course.categoryName}
            </CardTitle>
            <Badge variant="outline" className="text-game-primary">
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
          {isLearning && (
            <Badge className="bg-green-100 text-green-800">Đang học</Badge>
          )}
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onPreview(course)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
          <Button
            className="w-full"
            onClick={() => onStartLearning(course.categoryId)}
          >
            {isLearning ? "Học tiếp" : "Bắt đầu"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Tạo custom hook cho việc đếm grammar để tái sử dụng và quản lý tốt hơn
const useGrammarCounts = (categoryIds: number[]) => {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Tạo cache key chỉ thay đổi khi nội dung categoryIds thay đổi
  const categoryIdsKey = useMemo(
    () => categoryIds.slice().sort().join(","),
    [categoryIds]
  );

  const utils = trpc.useUtils();

  useEffect(() => {
    if (categoryIds.length === 0) return;

    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        // Batch fetch để giảm số lượng network requests
        const results = await Promise.all(
          categoryIds.map(async (categoryId) => {
            const grammars = await utils.grammarContent.getAll.fetch({
              page: 1,
              limit: 1000, // Lấy đủ số lượng ngữ pháp
              categoryId,
            });
            return { categoryId, count: grammars.length };
          })
        );

        // Kết hợp kết quả thành một object duy nhất
        setCounts(
          results.reduce((acc, { categoryId, count }) => {
            acc[categoryId] = count;
            return acc;
          }, {} as Record<number, number>)
        );
      } catch (error) {
        console.error("Lỗi khi đếm ngữ pháp:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [categoryIdsKey, utils.grammarContent.getAll]);

  return { grammarCounts: counts, isLoading };
};

export default function GrammarPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("learning");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  // Sử dụng TRPC với caching strategy
  const utils = trpc.useUtils();

  // Prefetch các dữ liệu quan trọng
  useEffect(() => {
    utils.userProcess.getCategoryProcesses.prefetch();
    utils.category.getValidCategories.prefetch({
      isVocabularyCourse: false,
    });
  }, [utils]);

  // Lấy danh sách các khóa học ngữ pháp mà người dùng đang học với caching
  const { data: learningCourses = [], isLoading: isLoadingLearning } =
    trpc.userProcess.getCategoryProcesses.useQuery(undefined, {
      staleTime: 60 * 1000, // 1 phút - tránh refetch dữ liệu quá thường xuyên
      refetchOnWindowFocus: false, // Tránh refetch không cần thiết
    });

  // Lấy tất cả các khóa học ngữ pháp có sẵn với caching
  const { data: allCourses = [], isLoading: isLoadingCourses } =
    trpc.category.getValidCategories.useQuery(
      {
        isVocabularyCourse: false,
      },
      {
        staleTime: 5 * 60 * 1000, // 5 phút - dữ liệu này thay đổi ít thường xuyên hơn
        refetchOnWindowFocus: false,
      }
    );

  // Memoize các giá trị tính toán để tránh tính toán lại không cần thiết
  const categoryIds = useMemo(
    () => allCourses.map((course) => course.categoryId),
    [allCourses]
  );

  const { grammarCounts, isLoading: isLoadingCounts } =
    useGrammarCounts(categoryIds);

  // Lọc khóa học dựa trên từ khóa tìm kiếm
  const filteredCourses = useMemo(
    () =>
      allCourses.filter(
        (course) =>
          course.categoryName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (course.description &&
            course.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      ),
    [allCourses, searchQuery]
  );

  // Lọc các khóa học đang học
  const learningGrammarCourses = useMemo(
    () =>
      learningCourses.filter(
        (progress) => 
          progress.processPercentage > 0 && 
          progress.category !== null && 
          progress.category?.isVocabularyCourse === false
      ),
    [learningCourses]
  );

  // Danh sách ID của các khóa học đang học
  const learningCourseIds = useMemo(
    () =>
      learningCourses
        .filter((progress) => progress.categoryId)
        .map((progress) => progress.categoryId!),
    [learningCourses]
  );

  // Tính tổng số điểm ngữ pháp đã học - memoized
  const totalGrammarLearned = useMemo(
    () =>
      learningCourses
        .filter((progress) => progress.category?.totalGrammar! > 0)
        .reduce(
          (acc, progress) =>
            acc +
            (progress.category?.totalGrammar! * progress.processPercentage) /
              100,
          0
        ),
    [learningCourses]
  );

  // Mutation cho việc đăng ký khóa học
  const { mutateAsync: registerCourse } =
    trpc.userProcess.userRegisterCategory.useMutation({
      onSuccess: () => {
        utils.userProcess.getCategoryProcesses.invalidate();
        setShowModeDialog(false);
      },
    });

  const handleRegister = async () => {
    await registerCourse({
      categoryId: selectedCourseId,
    });
  };

  // Hiển thị dialog xem trước ngữ pháp
  const handlePreview = (course: Course) => {
    setPreviewCourse(course);
    setShowPreviewDialog(true);
  };

  // Mở hộp thoại chọn chế độ học và đăng ký khóa học
  const handleStartLearning = (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowModeDialog(true);
  };

  // Xử lý tiếp tục học khóa học mới nhất
  const handleContinueLatestCourse = () => {
    if (learningGrammarCourses.length === 0) {
      setActiveTab("explore");
      return;
    }

    const latestCourse = learningGrammarCourses.sort(
      (a, b) =>
        new Date(b.lastPracticed || 0).getTime() -
        new Date(a.lastPracticed || 0).getTime()
    )[0];

    if (latestCourse && latestCourse.categoryId) {
      handleStartLearning(latestCourse.categoryId);
    }
  };

  // Hiển thị nội dung tab dựa trên trạng thái
  const renderTabContent = () => {
    if (activeTab === "learning") {
      if (isLoadingLearning) {
        return (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
          </div>
        );
      }

      if (learningGrammarCourses.length === 0) {
        return (
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
        );
      }

      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {learningGrammarCourses.map((progress) => (
            <LearningGrammarCourseCard
              key={progress.progressId}
              progress={progress}
              onPreview={handlePreview}
              onStartLearning={handleStartLearning}
            />
          ))}
        </div>
      );
    }

    // Tab "explore"
    if (isLoadingCourses) {
      return (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
        </div>
      );
    }

    if (
      filteredCourses.filter((course) => !course.isVocabularyCourse).length ===
      0
    ) {
      return (
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
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses
          .filter((course) => !course.isVocabularyCourse)
          .map((course) => (
            <ExploreGrammarCourseCard
              key={course.categoryId}
              course={course}
              grammarCounts={grammarCounts}
              isLearning={learningCourseIds.includes(course.categoryId)}
              onPreview={handlePreview}
              onStartLearning={handleStartLearning}
            />
          ))}
      </div>
    );
  };

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
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      onClick={handleContinueLatestCourse}
                    >
                      Học
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                      onClick={() => router.push("/grammar/quiz")}
                    >
                      Trò chơi
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                      onClick={() => {
                        if (learningGrammarCourses.length > 0 && learningGrammarCourses[0].categoryId) {
                          router.push(`/grammar/practice/${learningGrammarCourses[0].categoryId}`);
                        }
                      }}
                    >
                      <PenTool className="mr-1 h-4 w-4" />
                      Luyện tập
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

          {/* Tab content */}
          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </main>

      {/* Lazy load dialogs với Suspense */}
      <Suspense fallback={null}>
        {showModeDialog && (
          <GrammarModeDialogComponent
            open={showModeDialog}
            onOpenChange={setShowModeDialog}
            onStartLearning={() => {
              router.push(`/grammar/learn/${selectedCourseId}`);
              setShowModeDialog(false);
            }}
            onRegister={handleRegister}
          />
        )}

        {showPreviewDialog && previewCourse && (
          <PreviewGrammarDialog
            open={showPreviewDialog}
            onOpenChange={setShowPreviewDialog}
            course={previewCourse}
            grammarCounts={grammarCounts}
            onStartLearning={handleStartLearning}
          />
        )}
      </Suspense>
    </div>
  );
}
