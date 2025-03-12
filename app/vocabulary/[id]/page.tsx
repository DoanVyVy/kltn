"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Bookmark, Clock, Download, Info, Play, Share2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"
import { VocabularyModeDialog } from "@/components/vocabulary-mode-dialog"

// Dữ liệu mẫu cho khóa học từ vựng
const courseData = {
  id: 1,
  title: "500 Từ vựng TOEIC cơ bản",
  description: "Những từ vựng thiết yếu cho kỳ thi TOEIC, giúp bạn đạt điểm cao trong phần thi Reading và Listening.",
  category: "Tiếng Anh thương mại",
  level: "Sơ cấp",
  totalWords: 500,
  learnedWords: 125,
  creator: "Admin",
  createdAt: "15/06/2023",
  learners: 1245,
  isBookmarked: true,
  progress: 25,
  lastLearned: "Hôm nay",
  dueWords: 15,
  streak: 5,
  sections: [
    {
      id: 1,
      title: "Chủ đề: Văn phòng và Công sở",
      description: "Từ vựng liên quan đến môi trường làm việc văn phòng",
      totalWords: 50,
      learnedWords: 40,
      words: [
        {
          id: 1,
          term: "appointment",
          definition: "cuộc hẹn",
          example: "I have an appointment with the manager at 2 PM.",
        },
        { id: 2, term: "deadline", definition: "thời hạn", example: "The deadline for this project is next Friday." },
        { id: 3, term: "schedule", definition: "lịch trình", example: "My schedule is very busy this week." },
        // ... thêm từ vựng
      ],
    },
    {
      id: 2,
      title: "Chủ đề: Marketing và Quảng cáo",
      description: "Từ vựng liên quan đến marketing và quảng cáo",
      totalWords: 45,
      learnedWords: 30,
      words: [
        {
          id: 1,
          term: "advertisement",
          definition: "quảng cáo",
          example: "They placed an advertisement in the local newspaper.",
        },
        { id: 2, term: "campaign", definition: "chiến dịch", example: "The marketing campaign was very successful." },
        {
          id: 3,
          term: "target audience",
          definition: "đối tượng mục tiêu",
          example: "Our target audience is young professionals.",
        },
        // ... thêm từ vựng
      ],
    },
    {
      id: 3,
      title: "Chủ đề: Tài chính và Ngân hàng",
      description: "Từ vựng liên quan đến tài chính và ngân hàng",
      totalWords: 55,
      learnedWords: 25,
      words: [
        { id: 1, term: "account", definition: "tài khoản", example: "I need to check my bank account." },
        { id: 2, term: "budget", definition: "ngân sách", example: "We need to stay within our budget." },
        { id: 3, term: "investment", definition: "đầu tư", example: "This is a good investment opportunity." },
        // ... thêm từ vựng
      ],
    },
    {
      id: 4,
      title: "Chủ đề: Hội họp và Thuyết trình",
      description: "Từ vựng liên quan đến hội họp và thuyết trình",
      totalWords: 40,
      learnedWords: 15,
      words: [
        {
          id: 1,
          term: "agenda",
          definition: "chương trình nghị sự",
          example: "The meeting agenda was sent to all participants.",
        },
        {
          id: 2,
          term: "presentation",
          definition: "bài thuyết trình",
          example: "I'm preparing a presentation for tomorrow.",
        },
        { id: 3, term: "conference", definition: "hội nghị", example: "The annual conference will be held in May." },
        // ... thêm từ vựng
      ],
    },
    {
      id: 5,
      title: "Chủ đề: Giao tiếp Doanh nghiệp",
      description: "Từ vựng liên quan đến giao tiếp trong doanh nghiệp",
      totalWords: 60,
      learnedWords: 15,
      words: [
        { id: 1, term: "negotiate", definition: "đàm phán", example: "We need to negotiate better terms." },
        { id: 2, term: "proposal", definition: "đề xuất", example: "The proposal was accepted by the board." },
        { id: 3, term: "collaborate", definition: "hợp tác", example: "Our teams collaborate on many projects." },
        // ... thêm từ vựng
      ],
    },
  ],
}

export default function VocabularyCourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(courseData.isBookmarked)
  const [showModeDialog, setShowModeDialog] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined)

  // Trong ứng dụng thực tế, bạn sẽ lấy dữ liệu khóa học dựa trên params.id

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
                    <Badge variant="outline" className="mb-2 bg-game-primary/10 text-game-primary">
                      {courseData.level}
                    </Badge>
                    <CardTitle className="text-2xl text-game-accent">{courseData.title}</CardTitle>
                    <CardDescription className="mt-2 text-game-accent/70">{courseData.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-amber-500"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                  >
                    {isBookmarked ? <Bookmark className="h-5 w-5 fill-current" /> : <Bookmark className="h-5 w-5" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-sm text-game-accent/70">
                    <BookOpen className="h-4 w-4" />
                    {courseData.totalWords} từ
                  </div>
                  <div className="flex items-center gap-1 text-sm text-game-accent/70">
                    <Users className="h-4 w-4" />
                    {courseData.learners} người học
                  </div>
                  <div className="flex items-center gap-1 text-sm text-game-accent/70">
                    <Clock className="h-4 w-4" />
                    Cập nhật {courseData.createdAt}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-game-accent">Tiến độ</span>
                    <span className="text-game-primary">{courseData.progress}%</span>
                  </div>
                  <Progress value={courseData.progress} className="h-2 bg-white" indicatorClassName="bg-game-primary" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-game-primary/10 text-game-primary">
                    {courseData.dueWords} từ cần ôn tập
                  </Badge>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700">
                    {courseData.streak} ngày liên tục
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  className="game-button flex-1 gap-2"
                  onClick={() => {
                    setSelectedSectionId(undefined)
                    setShowModeDialog(true)
                  }}
                >
                  <Play className="h-4 w-4" />
                  Học ngay
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Tải về
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
                <CardTitle className="text-xl text-game-accent">Thông tin khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-game-accent">Chế độ học tập</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start gap-2 text-game-primary">
                      <BookOpen className="h-4 w-4" />
                      Flashcards
                    </Button>
                    <Button variant="outline" className="justify-start gap-2 text-game-primary">
                      <Play className="h-4 w-4" />
                      Trò chơi
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-game-accent">Thống kê</h3>
                  <div className="rounded-md border border-gray-200 bg-white p-3">
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-game-accent/70">Tổng số từ</span>
                      <span className="font-medium text-game-accent">{courseData.totalWords}</span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-game-accent/70">Đã học</span>
                      <span className="font-medium text-game-accent">{courseData.learnedWords}</span>
                    </div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-game-accent/70">Còn lại</span>
                      <span className="font-medium text-game-accent">
                        {courseData.totalWords - courseData.learnedWords}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-game-accent/70">Chủ đề</span>
                      <span className="font-medium text-game-accent">{courseData.sections.length}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-game-primary" />
                    <span className="text-sm text-game-accent">
                      Học 20 từ mỗi ngày để hoàn thành khóa học trong 25 ngày
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
            <TabsTrigger value="words" className="data-[state=active]:bg-white data-[state=active]:text-game-primary">
              Danh sách từ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {courseData.sections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="game-card h-full transition-all hover:border-game-primary/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-game-accent">{section.title}</CardTitle>
                      <CardDescription className="text-game-accent/70">{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-game-accent">Tiến độ</span>
                          <span className="text-game-primary">
                            {Math.round((section.learnedWords / section.totalWords) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.round((section.learnedWords / section.totalWords) * 100)}
                          className="h-2 bg-white"
                          indicatorClassName="bg-game-primary"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-gray-100">
                          {section.totalWords} từ
                        </Badge>
                        <Badge variant="outline" className="bg-game-primary/10 text-game-primary">
                          {section.learnedWords} đã học
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="game-button w-full gap-2"
                        onClick={() => {
                          setSelectedSectionId(section.id)
                          setShowModeDialog(true)
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
                <CardTitle className="text-xl text-game-accent">Danh sách từ vựng</CardTitle>
                <CardDescription className="text-game-accent/70">Tất cả từ vựng trong khóa học này</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseData.sections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="font-medium text-game-accent">{section.title}</h3>
                      <div className="rounded-md border border-gray-200">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">Từ vựng</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-game-accent">Nghĩa</th>
                              <th className="hidden px-4 py-2 text-left text-sm font-medium text-game-accent md:table-cell">
                                Ví dụ
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {section.words.map((word) => (
                              <tr key={word.id} className="bg-white">
                                <td className="px-4 py-3 text-sm font-medium text-game-primary">{word.term}</td>
                                <td className="px-4 py-3 text-sm text-game-accent">{word.definition}</td>
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
        <VocabularyModeDialog
          open={showModeDialog}
          onOpenChange={setShowModeDialog}
          courseId={courseData.id}
          sectionId={selectedSectionId}
        />
      </main>
    </div>
  )
}

