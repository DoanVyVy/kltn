"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Icon mapping for achievements
const iconMapping: Record<string, any> = {
  vocabulary: BookText,
  grammar: Brain,
  games: Gamepad2,
  streak: Calendar,
  level: GraduationCap,
};

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
};

// Get icon component based on achievement category
function getIconComponent(category: string = "vocabulary") {
  return iconMapping[category] || BookText;
}

// Format join date in Vietnamese
function formatJoinDate(date: Date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: vi,
  });
}

// Get initials from name
function getInitials(fullName: string | null) {
  if (!fullName) return "U";

  const names = fullName.trim().split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, error, refetch } = useUserProfile();
  const [activeTab, setActiveTab] = useState("overview");

  // If there's no user or the profile data is loading, show loading screen
  if (isLoading || !profile) {
    console.log(isLoading, profile);
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
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <motion.div
                className="text-4xl font-bold text-game-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {user ? getInitials(user.name || user.email) : "A"}
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h2
            className="mt-6 text-2xl font-bold text-game-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Đang tải hồ sơ
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
    );
  }

  // Hiển thị thông báo lỗi nếu có lỗi xảy ra và có người dùng đăng nhập
  if (error && user) {
    return (
      <div className="min-h-screen bg-game-background flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-3xl text-red-500">!</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Không thể tải hồ sơ</h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "Có lỗi xảy ra khi tải dữ liệu người dùng. Vui lòng thử lại sau."}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => refetch()}
              className="w-full bg-game-primary hover:bg-game-secondary"
            >
              Thử lại
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full"
            >
              Quay lại bảng điều khiển
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Mã lỗi: {JSON.stringify({ userId: user?.id }).substring(0, 20)}...
          </p>
        </motion.div>
      </div>
    );
  }

  // Get next level points needed
  const totalPoints = profile.totalPoints || 0;
  const pointsToNextLevel = 2000 - (totalPoints % 1000);
  const currentLevelProgress = (totalPoints % 1000) / 10; // Convert to percentage

  // Filter vocab and grammar achievements
  const achievements = profile.achievements || [];
  const vocabAchievements = achievements.filter(
    (a) => a.category === "vocabulary"
  );
  const grammarAchievements = achievements.filter(
    (a) => a.category === "grammar"
  );

  // Get vocabulary skills progress
  const wordsLearned = profile.wordsLearned || 0;
  const vocabularyProgress = Math.min(
    100,
    Math.round((wordsLearned / 1000) * 100)
  );

  // Get grammar skills progress
  const grammarRulesLearned = profile.grammarRulesLearned || 0;
  const grammarProgress = Math.min(
    100,
    Math.round((grammarRulesLearned / 100) * 100)
  );

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
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || profile.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-[#6366F1]">
                    {getInitials(profile.fullName || profile.username)}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md hover:bg-gray-100">
                <Upload className="h-4 w-4 text-game-primary" />
              </button>
              {/* Level badge - repositioned to overlap the avatar better */}
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#6366F1] text-white shadow-md">
                <span className="text-sm font-bold">
                  {profile.currentLevel}
                </span>
              </div>
            </div>
          </motion.div>

          <div>
            <div className="flex items-center justify-center md:justify-start">
              <h1 className="text-3xl font-bold text-game-accent">
                {profile.fullName || profile.username}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-game-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-game-accent/80">
              @{profile.username} • Tham gia {formatJoinDate(profile.createdAt)}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <Badge
                variant="outline"
                className="bg-game-primary/10 text-game-primary"
              >
                {profile.streakDays || 0} ngày hoạt động
              </Badge>
              <Badge
                variant="outline"
                className="bg-game-secondary/10 text-game-secondary"
              >
                {totalPoints} XP
              </Badge>
              <Badge
                variant="outline"
                className="bg-game-accent/10 text-game-accent"
              >
                Cấp độ {profile.currentLevel || 1}
              </Badge>
            </div>
          </div>
        </motion.div>

        <Tabs
          defaultValue="overview"
          onValueChange={setActiveTab}
          className="w-full"
        >
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
                  <div className="text-3xl font-bold text-game-accent">
                    {wordsLearned}
                  </div>
                  <p className="text-sm text-game-accent/70">Từ vựng đã học</p>
                </CardContent>
              </Card>

              {/* Thống kê ngữ pháp */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-secondary/10 p-3">
                    <Brain className="h-6 w-6 text-game-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">
                    {grammarRulesLearned}
                  </div>
                  <p className="text-sm text-game-accent/70">
                    Điểm ngữ pháp đã học
                  </p>
                </CardContent>
              </Card>

              {/* Thống kê trò chơi */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-accent/10 p-3">
                    <Gamepad2 className="h-6 w-6 text-game-accent" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">
                    {profile.gamesCompleted || 0}
                  </div>
                  <p className="text-sm text-game-accent/70">
                    Trò chơi đã hoàn thành
                  </p>
                </CardContent>
              </Card>

              {/* Thống kê ngày học */}
              <Card className="game-card h-full">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-2 rounded-full bg-game-primary/10 p-3">
                    <Calendar className="h-6 w-6 text-game-primary" />
                  </div>
                  <div className="text-3xl font-bold text-game-accent">
                    {profile.streakDays || 0}
                  </div>
                  <p className="text-sm text-game-accent/70">Ngày hoạt động</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="game-card">
                <CardHeader>
                  <CardTitle className="text-game-accent">
                    Tiến độ cấp độ
                  </CardTitle>
                  <CardDescription className="text-game-accent/70">
                    {totalPoints} XP tổng cộng • Cần thêm {pointsToNextLevel} XP
                    để lên cấp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={currentLevelProgress}
                    className="h-3 bg-game-background"
                    style={
                      {
                        "--progress-indicator-color": "var(--game-primary)",
                      } as React.CSSProperties
                    }
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-game-accent/70">
                      Cấp độ {profile.currentLevel}
                    </div>
                    <div className="text-sm text-game-accent/70">
                      Cấp độ {profile.currentLevel + 1}
                    </div>
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
                  <CardTitle className="text-game-accent">
                    Thành tích gần đây
                  </CardTitle>
                  <CardDescription className="text-game-accent/70">
                    Những cột mốc mới nhất của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.length > 0 ? (
                    achievements
                      .filter((a) => a.completed)
                      .slice(0, 3)
                      .map((achievement) => {
                        const IconComponent = getIconComponent(
                          achievement.category
                        );
                        return (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                achievement.category === "vocabulary"
                                  ? "bg-game-primary/10 text-game-primary"
                                  : "bg-game-secondary/10 text-game-secondary"
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-game-accent">
                                {achievement.title}
                              </h4>
                              <p className="text-xs text-game-accent/70">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-center text-game-accent/70">
                      Chưa có thành tích nào
                    </p>
                  )}
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
                  <CardTitle className="text-game-accent">
                    Tiến độ học tập
                  </CardTitle>
                  <CardDescription className="text-game-accent/70">
                    Kỹ năng tiếng Anh của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-game-accent">
                        Từ vựng
                      </div>
                      <div className="text-sm text-game-accent/70">
                        {vocabularyProgress}%
                      </div>
                    </div>
                    <Progress
                      value={vocabularyProgress}
                      className="h-2 bg-game-background"
                      style={
                        {
                          "--progress-indicator-color": "var(--game-primary)",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-game-accent">
                        Ngữ pháp
                      </div>
                      <div className="text-sm text-game-accent/70">
                        {grammarProgress}%
                      </div>
                    </div>
                    <Progress
                      value={grammarProgress}
                      className="h-2 bg-game-background"
                      style={
                        {
                          "--progress-indicator-color": "var(--game-secondary)",
                        } as React.CSSProperties
                      }
                    />
                  </div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="game-card">
                <CardHeader>
                  <CardTitle className="text-game-accent">
                    Thành tích của bạn
                  </CardTitle>
                  <CardDescription className="text-game-accent/70">
                    {achievements.filter((a) => a.completed).length} thành tích
                    đã mở khóa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={
                      achievements.length
                        ? (achievements.filter((a) => a.completed).length /
                            achievements.length) *
                          100
                        : 0
                    }
                    className="h-3 bg-game-background"
                    style={
                      {
                        "--progress-indicator-color": "var(--game-primary)",
                      } as React.CSSProperties
                    }
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="bg-game-primary/10 text-game-primary"
                    >
                      Từ vựng:{" "}
                      {vocabAchievements.filter((a) => a.completed).length}/
                      {vocabAchievements.length || 0}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-game-secondary/10 text-game-secondary"
                    >
                      Ngữ pháp:{" "}
                      {grammarAchievements.filter((a) => a.completed).length}/
                      {grammarAchievements.length || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => {
                  const IconComponent = getIconComponent(achievement.category);
                  return (
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
                              <IconComponent className="h-6 w-6" />
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
                          <h3 className="text-lg font-bold text-game-accent">
                            {achievement.title}
                          </h3>
                          <p className="mb-2 text-sm text-game-accent/70">
                            {achievement.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge
                              variant="outline"
                              className={`${
                                achievement.category === "vocabulary"
                                  ? "bg-game-primary/10 text-game-primary"
                                  : "bg-game-secondary/10 text-game-secondary"
                              }`}
                            >
                              {achievement.category === "vocabulary"
                                ? "Từ vựng"
                                : "Ngữ pháp"}
                            </Badge>
                            {achievement.completed &&
                            achievement.dateAchieved ? (
                              <p className="text-xs text-game-accent/70">
                                {new Date(
                                  achievement.dateAchieved
                                ).toLocaleDateString()}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400">
                                Chưa hoàn thành
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-10 text-game-accent/70">
                  <Trophy className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">
                    Chưa có thành tích
                  </h3>
                  <p>Tiếp tục học tập để mở khóa thành tích</p>
                </div>
              )}
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
                  <CardDescription className="text-game-accent/70">
                    Tiến độ học từ vựng của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookText className="mr-2 h-5 w-5 text-game-primary" />
                      <span className="font-medium text-game-accent">
                        Từ vựng đã học
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-game-primary/10 text-game-primary border-game-primary/20"
                    >
                      {wordsLearned} từ
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-game-accent">Tiến độ</span>
                      <span className="text-game-primary">
                        {vocabularyProgress}%
                      </span>
                    </div>
                    <Progress
                      value={vocabularyProgress}
                      className="h-2 bg-game-background"
                      style={
                        {
                          "--progress-indicator-color": "var(--game-primary)",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-game-accent">
                      Phân loại từ vựng
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.wordCategories &&
                      profile.wordCategories.length > 0 ? (
                        profile.wordCategories.slice(0, 4).map((category) => (
                          <div
                            key={category.categoryId}
                            className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center"
                          >
                            <div className="text-xl font-bold text-game-primary">
                              {category.count}
                            </div>
                            <div className="text-xs text-game-accent/70">
                              {category.name}
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                            <div className="text-xl font-bold text-game-primary">
                              0
                            </div>
                            <div className="text-xs text-game-accent/70">
                              Cơ bản
                            </div>
                          </div>
                          <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                            <div className="text-xl font-bold text-game-primary">
                              0
                            </div>
                            <div className="text-xs text-game-accent/70">
                              Nâng cao
                            </div>
                          </div>
                        </>
                      )}
                      <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-primary">
                          {wordsLearned -
                            (profile.wordCategories || []).reduce(
                              (sum, cat) => sum + cat.count,
                              0
                            )}
                        </div>
                        <div className="text-xs text-game-accent/70">Khác</div>
                      </div>
                      <div className="rounded-md border border-game-primary/20 bg-game-primary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-primary">
                          +
                          {wordsLearned -
                            (profile.wordCategories || []).reduce(
                              (sum, cat) => sum + cat.count,
                              0
                            ) >
                          0
                            ? Math.floor(Math.random() * 20) + 5
                            : 0}
                        </div>
                        <div className="text-xs text-game-accent/70">
                          Tuần này
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tiến độ ngữ pháp */}
              <Card className="game-card h-full">
                <CardHeader>
                  <CardTitle className="text-game-accent">Ngữ pháp</CardTitle>
                  <CardDescription className="text-game-accent/70">
                    Tiến độ học ngữ pháp của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-game-secondary" />
                      <span className="font-medium text-game-accent">
                        Quy tắc ngữ pháp đã học
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-game-secondary/10 text-game-secondary border-game-secondary/20"
                    >
                      {grammarRulesLearned} quy tắc
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-game-accent">Tiến độ</span>
                      <span className="text-game-secondary">
                        {grammarProgress}%
                      </span>
                    </div>
                    <Progress
                      value={grammarProgress}
                      className="h-2 bg-game-background"
                      style={
                        {
                          "--progress-indicator-color": "var(--game-secondary)",
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-game-accent">
                      Phân loại ngữ pháp
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.grammarCategories &&
                      profile.grammarCategories.length > 0 ? (
                        profile.grammarCategories
                          .slice(0, 4)
                          .map((category) => (
                            <div
                              key={category.categoryId}
                              className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center"
                            >
                              <div className="text-xl font-bold text-game-secondary">
                                {category.count}
                              </div>
                              <div className="text-xs text-game-accent/70">
                                {category.name}
                              </div>
                            </div>
                          ))
                      ) : (
                        <>
                          <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                            <div className="text-xl font-bold text-game-secondary">
                              0
                            </div>
                            <div className="text-xs text-game-accent/70">
                              Thì
                            </div>
                          </div>
                          <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                            <div className="text-xl font-bold text-game-secondary">
                              0
                            </div>
                            <div className="text-xs text-game-accent/70">
                              Cấu trúc câu
                            </div>
                          </div>
                        </>
                      )}
                      <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-secondary">
                          {grammarRulesLearned -
                            (profile.grammarCategories || []).reduce(
                              (sum, cat) => sum + cat.count,
                              0
                            )}
                        </div>
                        <div className="text-xs text-game-accent/70">Khác</div>
                      </div>
                      <div className="rounded-md border border-game-secondary/20 bg-game-secondary/5 p-3 text-center">
                        <div className="text-xl font-bold text-game-secondary">
                          +
                          {grammarRulesLearned -
                            (profile.grammarCategories || []).reduce(
                              (sum, cat) => sum + cat.count,
                              0
                            ) >
                          0
                            ? Math.floor(Math.random() * 5) + 1
                            : 0}
                        </div>
                        <div className="text-xs text-game-accent/70">
                          Tuần này
                        </div>
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
                  <CardTitle className="text-game-accent">
                    Lộ trình học tập
                  </CardTitle>
                  <CardDescription className="text-game-accent/70">
                    Kế hoạch học tập tiếp theo của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-game-primary" />
                      <div>
                        <p className="font-medium text-game-accent">
                          Mục tiêu từ vựng
                        </p>
                        <p className="text-sm text-game-accent/70">
                          Học {Math.floor(wordsLearned / 100) * 100 + 50} từ
                          vựng tiếng Anh
                        </p>
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
                        <p className="font-medium text-game-accent">
                          Mục tiêu ngữ pháp
                        </p>
                        <p className="text-sm text-game-accent/70">
                          Hoàn thành các bài tập về thì tương lai
                        </p>
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
  );
}
