"use client";

import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

// Lazy load dialog components to reduce initial bundle size
const VocabularyModeDialogComponent = lazy(() =>
  import("@/components/vocabulary-mode-dialog").then((mod) => ({
    default: mod.VocabularyModeDialog,
  }))
);
const PreviewVocabularyDialog = lazy(
  () => import("@/components/vocabulary/preview-vocabulary-dialog")
);

// Define TypeScript interfaces
interface Course {
  categoryId: number;
  categoryName: string;
  description: string | null;
  difficultyLevel: number;
  totalWords: number;
  [key: string]: any;
}

interface Progress {
  categoryId: number | null;
  progressId?: number;
  userId?: string;
  masteryLevel?: string;
  timesPracticed?: number;
  processPercentage: number;
  lastPracticed: string | Date | null;
  nextReviewDate?: string | null;
  category?: Course | null;
  [key: string]: any;
}

// Định nghĩa kiểu cho props của CourseCard
interface CourseCardProps {
  course: Course;
  progress?: Progress;
  vocabularyCounts: Record<number, number>;
  onPreview: (course: Course) => void;
  onStartLearning: (courseId: number) => void;
}

// Extract components for better code organization and memoization
const CourseCard = React.memo(
  ({
    course,
    progress,
    vocabularyCounts,
    onPreview,
    onStartLearning,
  }: CourseCardProps) => {
    return (
      <motion.div
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
            <CardDescription className="text-game-accent/70">
              {progress ? (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {progress.lastPracticed
                      ? new Date(progress.lastPracticed).toLocaleDateString()
                      : "Chưa học"}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      Tổng số từ vựng: {course.totalWords ?? 0} từ (Đã học:{" "}
                      {Math.round(
                        (progress.processPercentage *
                          (course.totalWords || 0)) /
                          100
                      )}{" "}
                      từ)
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {vocabularyCounts && vocabularyCounts[course.categoryId]
                      ? vocabularyCounts[course.categoryId]
                      : typeof course.totalWords === "number"
                      ? course.totalWords
                      : 0}{" "}
                    từ vựng
                  </span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {progress && (
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-game-accent">Tiến độ</span>
                  <span className="text-game-primary">
                    {progress.processPercentage.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={parseInt(progress.processPercentage.toFixed(0))}
                  className="h-2 bg-white"
                />
              </div>
            )}

            {progress ? (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-blue-700"
                >
                  {Math.round(
                    (progress.processPercentage * (course.totalWords || 0)) /
                      100
                  )}{" "}
                  / {course.totalWords || 0} từ
                </Badge>
                <Badge
                  variant="outline"
                  className="border-game-primary/30 text-game-primary"
                >
                  Cấp độ {course.difficultyLevel || 1}
                </Badge>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="border-game-primary/30 text-game-primary"
              >
                Cấp độ {course.difficultyLevel || 1}
              </Badge>
            )}

            <p className="mt-2 text-sm text-game-accent/70 line-clamp-3">
              {course.description || "Không có mô tả"}
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="game-button flex-1"
              onClick={() => onStartLearning(course.categoryId)}
            >
              {progress ? "Tiếp tục học" : "Bắt đầu học"}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => onPreview(course)}
            >
              <Eye className="h-4 w-4" />
              Xem trước
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
);
CourseCard.displayName = "CourseCard";

// Custom hook for vocabulary count data fetching for better reusability
const useVocabularyCounts = (categoryIds: number[]) => {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Use a unique key array that will only change when categoryIds content changes
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
        // Batch fetch to reduce number of network requests
        const results = await Promise.all(
          categoryIds.map(async (categoryId: number) => {
            // Use prefetching to improve performance
            const words = await utils.vocabularyWord.getAll.fetch({
              page: 1,
              limit: 1000,
              categoryId,
            });
            return { categoryId, count: words.length };
          })
        );

        setCounts(
          results.reduce((acc, { categoryId, count }) => {
            acc[categoryId] = count;
            return acc;
          }, {} as Record<number, number>)
        );
      } catch (error) {
        console.error("Lỗi khi đếm từ vựng:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [categoryIdsKey, utils.vocabularyWord.getAll]);

  return { vocabularyCounts: counts, isLoading };
};

export default function VocabularyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("learned");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const router = useRouter();

  // Prefetch important data using TRPC
  const utils = trpc.useUtils();

  // Load user data with optimizations
  const { data: learningCourses = [], isLoading: isLoadingLearning } =
    trpc.userProcess.getCategoryProcesses.useQuery(undefined, {
      staleTime: 60 * 1000, // 1 minute - avoids refetching data too often
      refetchOnWindowFocus: false, // Avoid unnecessary refetches
    });

  // Load all courses data
  const { data: allCourses = [], isLoading: isLoadingCourses } =
    trpc.category.getValidCategories.useQuery(
      {
        isVocabularyCourse: true,
      },
      {
        staleTime: 5 * 60 * 1000, // 5 minutes - this data changes less frequently
        refetchOnWindowFocus: false,
      }
    );

  // Prefetch user profile data if needed for other pages
  useEffect(() => {
    utils.userProcess.getCategoryProcesses.prefetch();
  }, [utils.userProcess.getCategoryProcesses]);

  // Process data with memoization to avoid redundant calculations
  const categoryIds = useMemo(
    () => allCourses.map((course) => course.categoryId),
    [allCourses]
  );

  const { vocabularyCounts, isLoading: isLoadingCounts } =
    useVocabularyCounts(categoryIds);

  // Memoize computed values to reduce unnecessary recalculations
  const learningCourseIds = useMemo(
    () => learningCourses.map((progress) => progress.categoryId),
    [learningCourses]
  );

  const learnedVocabularyCourses = useMemo(
    () =>
      learningCourses.filter(
        (progress) =>
          progress.processPercentage > 0 &&
          progress.category !== null &&
          progress.category.isVocabularyCourse === true
      ),
    [learningCourses]
  );

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

  const unexploredCourses = useMemo(
    () =>
      filteredCourses.filter(
        (course) => !learningCourseIds.includes(course.categoryId)
      ),
    [filteredCourses, learningCourseIds]
  );

  // Course registration mutation
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

  // Preview course handler
  const handlePreview = (course: Course) => {
    setPreviewCourse(course);
    setShowPreviewDialog(true);
  };

  // Start learning handler
  const handleStartLearning = (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowModeDialog(true);
  };

  // Content rendering with conditional logic for better error handling
  const renderContent = () => {
    if (activeTab === "learned") {
      if (isLoadingLearning) {
        return (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
          </div>
        );
      }

      if (learnedVocabularyCourses.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
            <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              Bạn chưa học khóa học nào
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-500">
              Bạn chưa hoàn thành bất kỳ khóa học từ vựng nào. Hãy khám phá các
              khóa học có sẵn và bắt đầu học nào!
            </p>
            <Button
              className="game-button"
              onClick={() => setActiveTab("explore")}
            >
              Khám phá ngay
            </Button>
          </div>
        );
      }

      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {learnedVocabularyCourses.map((progress) => (
            <CourseCard
              key={progress.categoryId}
              course={progress.category as Course}
              progress={progress}
              vocabularyCounts={vocabularyCounts}
              onPreview={handlePreview}
              onStartLearning={handleStartLearning}
            />
          ))}
        </div>
      );
    }

    // For the "explore" tab
    if (isLoadingCourses) {
      return (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
        </div>
      );
    }

    if (unexploredCourses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-xl font-medium text-gray-600">
            Không tìm thấy khóa học nào
          </h3>
          <p className="mb-6 max-w-md text-center text-gray-500">
            Không có khóa học từ vựng mới nào phù hợp với tìm kiếm của bạn
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {unexploredCourses.map((course) => (
          <CourseCard
            key={course.categoryId}
            course={course}
            vocabularyCounts={vocabularyCounts}
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
          defaultValue="learned"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-game-background">
            <TabsTrigger
              value="learned"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Đã học
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
            {renderContent()}
          </TabsContent>
        </Tabs>

        {/* Lazy loading dialogs with Suspense to reduce initial bundle size */}
        <Suspense fallback={null}>
          {showModeDialog && (
            <VocabularyModeDialogComponent
              open={showModeDialog}
              onOpenChange={setShowModeDialog}
              courseId={selectedCourseId}
              onRegister={handleRegister}
            />
          )}

          {showPreviewDialog && previewCourse && (
            <PreviewVocabularyDialog
              open={showPreviewDialog}
              onOpenChange={setShowPreviewDialog}
              course={previewCourse}
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}
