"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Calendar,
  Edit,
  Trophy,
  Upload,
  BookText,
  Pencil,
  Brain,
  GraduationCap,
  Award,
  Gamepad2,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"

// Dữ liệu animation tối thiểu
const profileAnimationData = {
  v: "5.7.1",
  fr: 30,
  ip: 0,
  op: 90,
  w: 500,
  h: 500,
  nm: "Profile Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Profile",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [100, 100] },
              p: { a: 0, k: [0, -30] },
              nm: "Ellipse Path 1",
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.388, 0.388, 0.976, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              nm: "Fill 1",
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: "Head",
        },
      ],
    },
  ],
}

// Dữ liệu mẫu cập nhật
const userStats = {
  daysActive: 42,
  wordsLearned: 520,
  grammarRules: 48,
  gamesCompleted: 64,
  totalXp: 4850,
  level: 12,
}

// Cập nhật thành tích để tập trung vào từ vựng và ngữ pháp
const achievements = [
  {
    id: 1,
    title: "Từ Vựng Cơ Bản",
    description: "Học 100 từ vựng cơ bản",
    icon: BookOpen,
    date: "2023-05-15",
    completed: true,
    category: "vocabulary",
  },
  {
    id: 2,
    title: "Thì Hiện Tại",
    description: "Hoàn thành các bài tập về thì hiện tại",
    icon: Brain,
    date: "2023-06-02",
    completed: true,
    category: "grammar",
  },
  {
    id: 3,
    title: "Từ Vựng Nâng Cao",
    description: "Học 50 từ vựng nâng cao",
    icon: Award,
    date: null,
    completed: false,
    category: "vocabulary",
  },
  {
    id: 4,
    title: "Thì Quá Khứ",
    description: "Hoàn thành các bài tập về thì quá khứ",
    icon: Calendar,
    date: null,
    completed: false,
    category: "grammar",
  },
  {
    id: 5,
    title: "Từ Vựng Chuyên Ngành",
    description: "Học 30 từ vựng chuyên ngành",
    icon: BookText,
    date: "2023-05-28",
    completed: true,
    category: "vocabulary",
  },
  {
    id: 6,
    title: "Câu Điều Kiện",
    description: "Hoàn thành các bài tập về câu điều kiện",
    icon: Pencil,
    date: "2023-06-10",
    completed: true,
    category: "grammar",
  },
]

// Cập nhật dữ liệu ngôn ngữ
const languages = [
  {
    name: "Tiếng Anh",
    level: "Trung cấp (B1)",
    progress: 65,
    skills: [
      { name: "Từ vựng", progress: 70 },
      { name: "Ngữ pháp", progress: 60 },
    ],
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading on page load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-game-background flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-game-primary to-game-secondary blur-lg opacity-70"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <motion.div
                className="text-4xl font-bold text-game-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                A
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h2
            className="mt-6 text-2xl font-bold text-game-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Loading Profile
          </motion.h2>

          <motion.div
            className="mt-4 flex space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-game-primary"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center justify-center text-center md:flex-row md:items-start md:justify-start md:text-left"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-6 md:mb-0 md:mr-8"
          >
            {/* Avatar */}
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 rounded-full bg-[#efe7ff] border-4 border-white shadow-lg overflow-hidden">
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#6366F1]">
                  A
                </div>
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md hover:bg-gray-100">
                <Upload className="h-4 w-4 text-game-primary" />
              </button>
              {/* Level badge - repositioned to overlap the avatar better */}
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1] text-white shadow-md">
                <span className="text-sm font-bold">{userStats.level}</span>
              </div>
            </div>
          </motion.div>

          <div>
            <div className="flex items-center justify-center md:justify-start">
              <h1 className="text-3xl font-bold text-game-accent">Alex Johnson</h1>
              <Button variant="ghost" size="icon" className="ml-2 text-game-primary">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-game-accent/80">@alexjohnson • Tham gia 2 tháng trước</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <Badge variant="outline" className="bg-game-primary/10 text-game-primary">
                {userStats.daysActive} ngày hoạt động
              </Badge>
              <Badge variant="outline" className="bg-game-secondary/10 text-game-secondary">
                {userStats.totalXp} XP
              </Badge>
              <Badge variant="outline" className="bg-game-accent/10 text-game-accent">
                Cấp độ {userStats.level}
              </Badge>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 bg-game-background">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Thành tích
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-white data-[state=active]:text-game-primary"
            >
              Tiến độ học tập
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {/* Thống kê từ vựng */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-primary/10 p-3">
                    <BookText className="h-6 w-6 text-game-primary" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">{userStats.wordsLearned}</div>
                  <p className="text-sm text-game-accent/70">Từ vựng đã học</p>
                </CardContent>
              </Card>

              {/* Thống kê ngữ pháp */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-secondary/10 p-3">
                    <Brain className="h-6 w-6 text-game-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">{userStats.grammarRules}</div>
                  <p className="text-sm text-game-accent/70">Quy tắc ngữ pháp đã học</p>
                </CardContent>
              </Card>

              {/* Thống kê trò chơi */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-accent/10 p-3">
                    <Gamepad2 className="h-6 w-6 text-game-accent" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">{userStats.gamesCompleted}</div>
                  <p className="text-sm text-game-accent/70">Trò chơi đã hoàn thành</p>
                </CardContent>
              </Card>

              {/* Thống kê ngày học */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-primary/10 p-3">
                    <Calendar className="h-6 w-6 text-game-primary" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">{userStats.daysActive}</div>
                  <p className="text-sm text-game-accent/70">Ngày hoạt động</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="game-card">
                <CardHeader>
                  <CardTitle className="text-game-accent">Tiến độ cấp độ</CardTitle>
                  <CardDescription className="text-game-accent/70">
                    {userStats.totalXp} XP tổng cộng • Cần thêm {1000 - (userStats.totalXp % 1000)} XP để lên cấp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(userStats.totalXp % 1000) / 10}
                    className="h-3 bg-game-background"
                    indicatorClassName="bg-game-primary"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-game-accent/70">Cấp độ {userStats.level}</div>
                    <div className="text-sm text-game-accent/70">Cấp độ {userStats.level + 1}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Thành tích gần đây */}
              <Card className="game-card h-full">
                <CardHeader>
                  <CardTitle className="text-game-accent">Thành tích gần đây</CardTitle>
                  <CardDescription className="text-game-accent/70">Những cột mốc mới nhất của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements
                    .filter((a) => a.completed)
                    .slice(0, 3)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            achievement.category === "vocabulary"
                              ? "bg-game-primary/10 text-game-primary"
                              : "bg-game-secondary/10 text-game-secondary"
                          }`}
                        >
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-game-accent">{achievement.title}</h4>
                          <p className="text-xs text-game-accent/70">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  <Button
                    variant="outline"
                    className="w-full text-game-primary border-game-primary/20 hover:bg-game-primary/10"
                    onClick={() => setActiveTab("achievements")}
                  >
                    Xem tất cả thành tích
                  </Button>
                </CardContent>
              </Card>

              {/* Tiến độ học tập */}
              <Card className="game-card h-full">
                <CardHeader>
                  <CardTitle className="text-game-accent">Tiến độ học tập</CardTitle>
                  <CardDescription className="text-game-accent/70">Kỹ năng tiếng Anh của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {languages[0].skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-game-accent">{skill.name}</div>
                        <div className="text-sm text-game-accent/70">{skill.progress}%</div>
                      </div>
                      <Progress
                        value={skill.progress}
                        className="h-2 bg-game-background"
                        indicatorClassName={skill.name === "Từ vựng" ? "bg-game-primary" : "bg-game-secondary"}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full text-game-primary border-game-primary/20 hover:bg-game-primary/10"
                    onClick={() => setActiveTab("progress")}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="game-card">
                <CardHeader>
                  <CardTitle className="text-game-accent">Thành tích của bạn</CardTitle>
                  <CardDescription className="text-game-accent/70">
                    {achievements.filter((a) => a.completed).length} trong số {achievements.length} thành tích đã mở
                    khóa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(achievements.filter((a) => a.completed).length / achievements.length) * 100}
                    className="h-3 bg-game-background"
                    indicatorClassName="bg-game-primary"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-game-primary/10 text-game-primary">
                      Từ vựng: {achievements.filter((a) => a.category === "vocabulary" && a.completed).length}/
                      {achievements.filter((a) => a.category === "vocabulary").length}
                    </Badge>
                    <Badge variant="outline" className="bg-game-secondary/10 text-game-secondary">
                      Ngữ pháp: {achievements.filter((a) => a.category === "grammar" && a.completed).length}/
                      {achievements.filter((a) => a.category === "grammar").length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Card
                    className={`game-card h-full transition-all ${
                      achievement.completed
                        ? achievement.category === "vocabulary"
                          ? "border-game-primary/30 bg-game-primary/5"
                          : "border-game-secondary/30 bg-game-secondary/5"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            achievement.completed
                              ? achievement.category === "vocabulary"
                                ? "bg-game-primary text-white"
                                : "bg-game-secondary text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          <achievement.icon className="h-6 w-6" />
                        </div>
                        {achievement.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              achievement.category === "vocabulary"
                                ? "bg-game-primary/10 text-game-primary"
                                : "bg-game-secondary/10 text-game-secondary"
                            }`}
                          >
                            <Trophy className="h-4 w-4" />
                          </motion.div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-game-accent">{achievement.title}</h3>
                      <p className="mb-2 text-sm text-game-accent/70">{achievement.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className={`${
                            achievement.category === "vocabulary"
                              ? "bg-game-primary/10 text-game-primary"
                              : "bg-game-secondary/10 text-game-secondary"
                          }`}
                        >
                          {achievement.category === "vocabulary" ? "Từ vựng" : "Ngữ pháp"}
                        </Badge>
                        {achievement.completed ? (
                          <p className="text-xs text-game-accent/70">
                            {new Date(achievement.date!).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400">Chưa hoàn thành</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-6 md:grid-cols-2"
            >
              {/* Tiến độ từ vựng */}
              <Card className="game-card h-full">
                <CardHeader>
                  <CardTitle className="text-game-accent">Từ vựng</CardTitle>
                  <CardDescription className="text-game-accent/70">Tiến độ học từ vựng của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookText className="mr-2 h-5 w-5 text-game-primary" />
                      <span className="font-medium text-game-accent">Từ vựng đã học</span>
                    </div>
                    <Badge variant="outline" className="bg-game-primary/10 text-game-primary border-game-primary/20">
                      {userStats.wordsLearned} từ
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-game-accent">Tiến độ</span>
                      <span className="text-game-primary">{languages[0].skills[0].progress}%</span>
                    </div>
                    <Progress
                      value={languages[0].skills[0].progress}
                      className="h-2 bg-game-background"
                      indicatorClassName="bg-game-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-game-accent">Phân loại từ vựng</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-primary">320</div>
                        <div className="text-xs text-game-accent/70">Cơ bản</div>
                      </div>
                      <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-primary">150</div>
                        <div className="text-xs text-game-accent/70">Nâng cao</div>
                      </div>
                      <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-primary">50</div>
                        <div className="text-xs text-game-accent/70">Chuyên ngành</div>
                      </div>
                      <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-primary">+25</div>
                        <div className="text-xs text-game-accent/70">Tuần này</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tiến độ ngữ pháp */}
              <Card className="game-card h-full">
                <CardHeader>
                  <CardTitle className="text-game-accent">Ngữ pháp</CardTitle>
                  <CardDescription className="text-game-accent/70">Tiến độ học ngữ pháp của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-game-secondary" />
                      <span className="font-medium text-game-accent">Quy tắc ngữ pháp đã học</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-game-secondary/10 text-game-secondary border-game-secondary/20"
                    >
                      {userStats.grammarRules} quy tắc
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-game-accent">Tiến độ</span>
                      <span className="text-game-secondary">{languages[0].skills[1].progress}%</span>
                    </div>
                    <Progress
                      value={languages[0].skills[1].progress}
                      className="h-2 bg-game-background"
                      indicatorClassName="bg-game-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-game-accent">Phân loại ngữ pháp</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-secondary">12</div>
                        <div className="text-xs text-game-accent/70">Thì</div>
                      </div>
                      <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-secondary">15</div>
                        <div className="text-xs text-game-accent/70">Cấu trúc câu</div>
                      </div>
                      <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-secondary">8</div>
                        <div className="text-xs text-game-accent/70">Câu điều kiện</div>
                      </div>
                      <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-secondary">+3</div>
                        <div className="text-xs text-game-accent/70">Tuần này</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="game-card">
                <CardHeader>
                  <CardTitle className="text-game-accent">Lộ trình học tập</CardTitle>
                  <CardDescription className="text-game-accent/70">Kế hoạch học tập tiếp theo của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-game-primary" />
                      <div>
                        <p className="font-medium text-game-accent">Mục tiêu từ vựng</p>
                        <p className="text-sm text-game-accent/70">Học 50 từ vựng mới trong 2 tuần tới</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-game-primary border-game-primary/20 hover:bg-game-primary/10"
                    >
                      Xem chi tiết
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-game-secondary" />
                      <div>
                        <p className="font-medium text-game-accent">Mục tiêu ngữ pháp</p>
                        <p className="text-sm text-game-accent/70">Hoàn thành bài tập về thì tương lai</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-game-secondary border-game-secondary/20 hover:bg-game-secondary/10"
                    >
                      Xem chi tiết
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Button className="game-button w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Tiếp tục học tập
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

