"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Clock,
  Download,
  Eye,
  Info,
  Play,
  Share2,
  Users,
  X,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import { VocabularyModeDialog } from "@/components/vocabulary-mode-dialog";
import { trpc } from "@/trpc/client";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAudio } from "@/app/vocabulary/learn/[id]/_hooks/useAudio";

// Định nghĩa cấu trúc dữ liệu
interface WordDisplay {
  id: number;
  term: string;
  definition: string;
  example: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

interface Section {
  id: number;
  title: string;
  description: string;
  totalWords: number;
  learnedWords: number;
  words: WordDisplay[];
}

// Dữ liệu mẫu
const createDummySections = (courseTitle: string): Section[] => [
  {
    id: 1,
    title: `Chủ đề 1: ${courseTitle} (1-10)`,
    description: "Bộ từ vựng 1 của khóa học",
    totalWords: 10,
    learnedWords: 5,
    words: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      term: `Term ${i + 1}`,
      definition: `Định nghĩa ${i + 1}`,
      example: `Ví dụ câu ${i + 1}`,
    })),
  },
  {
    id: 2,
    title: `Chủ đề 2: ${courseTitle} (11-20)`,
    description: "Bộ từ vựng 2 của khóa học",
    totalWords: 10,
    learnedWords: 2,
    words: Array.from({ length: 10 }, (_, i) => ({
      id: i + 11,
      term: `Term ${i + 11}`,
      definition: `Định nghĩa ${i + 11}`,
      example: `Ví dụ câu ${i + 11}`,
    })),
  },
];

export default function VocabularyCourseDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<
    number | undefined
  >(undefined);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const { isPlaying, currentUrl, play } = useAudio();

  // Lấy ID khóa học từ params
  const courseId = parseInt(params.id);

  // Lấy thông tin khóa học từ API
  const { data: categories = [], isLoading: isLoadingCourse } =
    trpc.category.getValidCategories.useQuery({
      isVocabularyCourse: true,
    });

  // Lấy tiến trình học của người dùng
  const { data: userProcesses = [], isLoading: isLoadingProgress } =
    trpc.userProcess.getCategoryProcesses.useQuery();

  const isLoading = isLoadingCourse || isLoadingProgress;

  // Tìm thông tin khóa học từ danh sách
  const course = categories.find((c) => c.categoryId === courseId);

  // Tìm tiến trình học tập nếu có
  const userProgress = userProcesses.find((p) => p.categoryId === courseId);

  // Tạo dữ liệu mẫu cho danh sách từ vựng
  const sections = course ? createDummySections(course.categoryName) : [];

  // Tạo danh sách từ vựng đã học để xem trước
  const learnedWords = sections
    .flatMap((section) => section.words.slice(0, section.learnedWords))
    .sort((a, b) => a.id - b.id);

  // Hàm xử lý phát âm thanh
  const handlePlayAudio = (audioUrl: string) => {
    play(audioUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <main className="container mx-auto flex items-center justify-center px-4 py-8">
          <div className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-game-primary border-t-transparent"></div>
            <p className="mt-4 text-game-accent">
              Đang tải thông tin khóa học...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-game-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6 gap-2 text-game-accent hover:bg-game-background/50 hover:text-game-primary"
            onClick={() => router.push("/vocabulary")}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
            <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-xl font-medium text-gray-600">
              Không tìm thấy khóa học
            </h3>
            <p className="mb-6 max-w-md text-center text-gray-500">
              Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
            </p>
            <Button
              className="game-button"
              onClick={() => router.push("/vocabulary")}
            >
              Quay lại trang từ vựng
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const progress = userProgress?.processPercentage || 0;
  const totalWords = course.totalWords || 0;
  const learnedWordsCount = Math.round((progress * totalWords) / 100) || 0;
  const dueWords = 15; // Mẫu
  const streak = 0; // Mẫu
  const updatedDate = new Date().toISOString();

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2 text-game-accent hover:bg-game-background/50 hover:text-game-primary"
          onClick={() => router.push("/vocabulary")}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <Card className="game-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 bg-game-primary/10 text-game-primary"
                    >
                      Cấp độ {course.difficultyLevel}
                    </Badge>
                    <CardTitle className="text-2xl text-game-accent">
                      {course.categoryName}
                    </CardTitle>
                    <CardDescription className="mt-2 text-game-accent/70">
                      {course.description}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-500"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    {isBookmarked ? (
                      <Bookmark className="h-5 w-5 fill-current" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-sm text-game-accent/70">
                    <BookOpen className="h-4 w-4" />
                    {totalWords} từ
                  </div>
                  <div className="flex items-center gap-1 text-sm text-game-accent/70">
                    <Users className="h-4 w-4" />
                    {0} người học
                  </div>
                  <div className="flex items-center gap-1 text-sm text-game-accent/70">
                    <Clock className="h-4 w-4" />
                    Cập nhật {dayjs(updatedDate).format("DD/MM/YYYY")}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-game-accent">Tiến độ</span>
                    <span className="text-game-primary">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {dueWords > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-game-primary/10 text-game-primary"
                    >
                      {dueWords} từ cần ôn tập
                    </Badge>
                  )}
                  {streak > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-700"
                    >
                      {streak} ngày liên tục
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700"
                  >
                    {learnedWordsCount}/{totalWords} từ đã học
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  className="game-button flex-1 gap-2"
                  onClick={() => {
                    setSelectedSectionId(undefined);
                    setShowModeDialog(true);
                  }}
                >
                  <Play className="h-4 w-4" />
                  Học ngay
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowPreviewDialog(true)}
                  disabled={learnedWords.length === 0}
                >
                  <Eye className="h-4 w-4" />
                  Xem trước
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="game-card h-full">
              <CardHeader>
                <CardTitle className="text-xl text-game-accent">
                  Thông tin khóa học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-game-accent">
                    Chế độ học tập
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start gap-2 text-game-primary"
                    >
                      <BookOpen className="h-4 w-4" />
                      Flashcards
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 text-game-primary"
                    >
                      <Play className="h-4 w-4" />
                      Trò chơi
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-game-accent">Thống kê</h3>
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-game-accent/70">
                        Tổng số từ
                      </span>
                      <span className="font-medium text-game-accent">
                        {totalWords}
                      </span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-game-accent/70">
                        Đã học
                      </span>
                      <span className="font-medium text-game-accent">
                        {learnedWordsCount}
                      </span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-game-accent/70">
                        Còn lại
                      </span>
                      <span className="font-medium text-game-accent">
                        {totalWords - learnedWordsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-game-accent/70">
                        Chủ đề
                      </span>
                      <span className="font-medium text-game-accent">
                        {sections.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-game-primary" />
                    <span className="text-sm text-game-accent">
                      Học 20 từ mỗi ngày để hoàn thành khóa học trong{" "}
                      {Math.ceil(totalWords / 20)} ngày
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 bg-game-background">
            <TabsTrigger
              value="sections"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Chủ đề
            </TabsTrigger>
            <TabsTrigger
              value="words"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Danh sách từ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {sections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="game-card h-full transition-all hover:border-game-primary/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-game-accent">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-game-accent/70">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-game-accent">Tiến độ</span>
                          <span className="text-game-primary">
                            {Math.round(
                              (section.learnedWords / section.totalWords) * 100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={Math.round(
                            (section.learnedWords / section.totalWords) * 100
                          )}
                          className="h-2 bg-white"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-gray-100">
                          {section.totalWords} từ
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-game-primary/10 text-game-primary"
                        >
                          {section.learnedWords} đã học
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="game-button w-full gap-2"
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setShowModeDialog(true);
                        }}
                      >
                        <Play className="h-4 w-4" />
                        Học chủ đề này
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="words" className="space-y-6">
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="text-xl text-game-accent">
                  Danh sách từ vựng
                </CardTitle>
                <CardDescription className="text-game-accent/70">
                  Tất cả từ vựng trong khóa học này
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="font-medium text-game-accent">
                        {section.title}
                      </h3>
                      <div className="rounded-md border border-gray-200">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
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
                            {section.words.map((word) => (
                              <tr key={word.id} className="bg-white">
                                <td className="px-4 py-3 text-sm font-medium text-game-primary">
                                  {word.term}
                                </td>
                                <td className="px-4 py-3 text-sm text-game-accent">
                                  {word.definition}
                                </td>
                                <td className="hidden px-4 py-3 text-sm text-game-accent/70 md:table-cell">
                                  {word.example}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog xem trước từ vựng đã học */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Các từ vựng đã học ({learnedWords.length})</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto">
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
                    <th className="hidden px-4 py-2 text-left text-sm font-medium text-game-accent md:table-cell">
                      Media
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {learnedWords.length > 0 ? (
                    learnedWords.map((word, index) => (
                      <tr key={word.id} className="bg-white">
                        <td className="px-4 py-3 text-sm text-game-accent">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-game-primary">
                          {word.term}
                        </td>
                        <td className="px-4 py-3 text-sm text-game-accent">
                          {word.definition}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-game-accent/70 md:table-cell">
                          {word.example}
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-game-accent/70 md:table-cell">
                          <div className="flex flex-col gap-2">
                            {word.imageUrl && (
                              <div className="flex flex-col gap-1">
                                <a
                                  href={word.imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Xem hình ảnh
                                </a>
                                <div className="mt-1 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={word.imageUrl}
                                    alt={`Hình ảnh minh họa cho ${word.term}`}
                                    className="h-20 w-auto object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            {word.videoUrl && (
                              <div className="flex flex-col gap-1">
                                <a
                                  href={word.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Xem video
                                </a>
                                <div className="mt-1 overflow-hidden rounded-md border border-gray-200">
                                  <iframe
                                    src={word.videoUrl}
                                    title={`Video minh họa cho ${word.term}`}
                                    className="aspect-video h-20 w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            )}
                            {word.audioUrl && (
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() =>
                                    handlePlayAudio(word.audioUrl!)
                                  }
                                  className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                                >
                                  <Volume2
                                    className={`h-4 w-4 ${
                                      currentUrl === word.audioUrl && isPlaying
                                        ? "text-game-primary"
                                        : ""
                                    }`}
                                  />
                                  {currentUrl === word.audioUrl && isPlaying
                                    ? "Đang phát..."
                                    : "Nghe phát âm"}
                                </button>
                              </div>
                            )}
                            {!word.imageUrl &&
                              !word.videoUrl &&
                              !word.audioUrl &&
                              "Không có"}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-game-accent/70"
                      >
                        Bạn chưa học từ vựng nào trong khóa học này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                  setShowModeDialog(true);
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Tiếp tục học
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <VocabularyModeDialog
          open={showModeDialog}
          onOpenChange={setShowModeDialog}
          courseId={courseId}
          sectionId={selectedSectionId}
          onRegister={() => {}}
        />
      </main>
    </div>
  );
}

const DIFICULTY_LEVELS = [
  { value: 1, label: "Sơ cấp" },
  { value: 2, label: "Trung cấp" },
  { value: 3, label: "Cao cấp" },
  { value: 4, label: "Nâng cao" },
];
