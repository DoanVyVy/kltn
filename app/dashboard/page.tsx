"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, BookOpen, Sparkles, Calendar } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { GameCard } from "@/components/dashboard/game-card";
import { AchievementCard } from "@/components/dashboard/achievement-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { GAME_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export default function DashboardPage() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    learningStreak: 0,
    dailyXpGoal: 100,
    currentXp: 0,
    totalWords: 0,
    totalGrammarRules: 0,
    availableGames: 5,
  });
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch all necessary data for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Get authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          router.push("/login");
          return;
        }

        setUser(user);
        if (!user) return;

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        }

        let profile;
        if (profileData) {
          profile = profileData;
          setUserProfile(profile);

          // Set user stats based on profile data
          setUserStats({
            learningStreak: profile.learning_streak || 0,
            dailyXpGoal: profile.daily_xp_goal || 100,
            currentXp: profile.current_xp || 0,
            totalWords: profile.total_words || 0,
            totalGrammarRules: profile.total_grammar_rules || 0,
            availableGames: profile.available_games || 5,
          });
        } else {
          // Use fallback profile if none exists
          profile = {
            name: user.email?.split("@")[0] || "User",
            email: user.email,
            level: 1,
            learning_streak: 0,
            daily_xp_goal: 100,
            current_xp: 0,
            total_words: 0,
            total_grammar_rules: 0,
            available_games: 5,
          };
          setUserProfile(profile);
          setUserStats({
            learningStreak: 0,
            dailyXpGoal: 100,
            currentXp: 0,
            totalWords: 0,
            totalGrammarRules: 0,
            availableGames: 5,
          });
        }

        // Fetch games data
        const { data: gamesData, error: gamesError } = await supabase
          .from("games")
          .select("*");

        if (gamesError) {
          console.error("Error fetching games data:", gamesError);
        } else {
          setGames(gamesData || []);
        }

        // Fetch user progress for games
        const { data: userGamesData, error: userGamesError } = await supabase
          .from("user_game_progress")
          .select("*")
          .eq("user_id", profile.id);

        if (userGamesError) {
          console.error("Error fetching user game progress:", userGamesError);
        } else if (userGamesData && gamesData) {
          // Merge game data with user progress
          const gamesWithProgress = gamesData.map((game) => {
            const userProgress = userGamesData.find(
              (p) => p.game_id === game.id
            );
            return {
              ...game,
              progress: userProgress ? userProgress.progress : 0,
            };
          });
          setGames(gamesWithProgress);
        }

        // Fetch achievements
        const { data: achievementsData, error: achievementsError } =
          await supabase.from("achievements").select("*");

        if (achievementsError) {
          console.error("Error fetching achievements:", achievementsError);
        } else {
          // Fetch user achievements
          const { data: userAchievements, error: userAchievementsError } =
            await supabase
              .from("user_achievements")
              .select("*")
              .eq("user_id", profile.id);

          if (userAchievementsError) {
            console.error(
              "Error fetching user achievements:",
              userAchievementsError
            );
          } else if (achievementsData) {
            // Merge achievements with completion status
            const achievementsWithStatus = achievementsData.map(
              (achievement) => {
                const isCompleted = userAchievements?.some(
                  (ua) => ua.achievement_id === achievement.id && ua.completed
                );
                return {
                  ...achievement,
                  completed: isCompleted || false,
                };
              }
            );
            setAchievements(achievementsWithStatus);
          }
        }

        // Fetch leaderboard data
        const { data: leaderboard, error: leaderboardError } = await supabase
          .from("users")
          .select("id, name, email, level, current_xp, avatar_url")
          .order("level", { ascending: false })
          .order("current_xp", { ascending: false })
          .limit(10);

        if (leaderboardError) {
          console.error("Error fetching leaderboard:", leaderboardError);
        } else {
          setLeaderboardData(leaderboard || []);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Đã có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(userStats.currentXp);
    }, 500);
    return () => clearTimeout(timer);
  }, [userStats.currentXp]);

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
                LP
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h2
            className="mt-6 text-2xl font-bold text-game-accent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Loading Dashboard
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

  // Filter games by category
  const vocabularyGames = games.filter(
    (game) => game.category === GAME_CATEGORIES.VOCABULARY
  );
  const grammarGames = games.filter(
    (game) => game.category === GAME_CATEGORIES.GRAMMAR
  );

  return (
    <div className="min-h-screen bg-game-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-game-accent">
            Xin chào,{" "}
            <span className="game-gradient-text">
              {userProfile?.name || user?.email}
            </span>
            !
          </h1>
          <p className="text-game-accent/80">
            Tiếp tục hành trình học từ vựng và ngữ pháp tiếng Anh của bạn
          </p>
        </motion.div>
        {/* Two-column layout for desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content column */}
          <motion.div
            className="flex-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={<Flame className="mr-2 h-5 w-5 text-game-primary" />}
                  title="Chuỗi ngày học"
                  description="Duy trì đà học tập!"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-bold text-game-primary">
                      {userStats.learningStreak} ngày
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="rounded-full bg-game-primary/10 p-2"
                    >
                      <Sparkles className="h-6 w-6 text-game-primary" />
                    </motion.div>
                  </div>
                </StatsCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={<Clock className="mr-2 h-5 w-5 text-game-secondary" />}
                  title="Mục tiêu hàng ngày"
                  description={`${userStats.currentXp}/${userStats.dailyXpGoal} XP hôm nay`}
                >
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-white rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-game-primary"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            (userStats.currentXp / userStats.dailyXpGoal) * 100
                          }%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-game-accent/70">
                      Cần thêm {userStats.dailyXpGoal - userStats.currentXp} XP
                      để đạt mục tiêu
                    </div>
                  </div>
                </StatsCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={<BookOpen className="mr-2 h-5 w-5 text-game-accent" />}
                  title="Tiến độ học tập"
                  description="Từ vựng và ngữ pháp đã học"
                  className="md:col-span-2 lg:col-span-1"
                >
                  <div className="flex justify-between">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                    >
                      <div className="text-3xl font-bold text-game-accent">
                        {userStats.totalWords}
                      </div>
                      <div className="text-sm text-game-accent/70">Từ vựng</div>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.4,
                      }}
                    >
                      <div className="text-3xl font-bold text-game-secondary">
                        {userStats.totalGrammarRules}
                      </div>
                      <div className="text-sm text-game-accent/70">
                        Quy tắc ngữ pháp
                      </div>
                    </motion.div>
                    <motion.div
                      className="hidden md:block lg:hidden xl:block"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 0.9, 1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-game-primary to-game-secondary flex items-center justify-center text-white text-2xl font-bold">
                        {userProfile?.level || 1}
                      </div>
                    </motion.div>
                  </div>
                </StatsCard>
              </motion.div>

              <motion.div variants={itemVariants}>
                <StatsCard
                  icon={<Calendar className="mr-2 h-5 w-5 text-game-primary" />}
                  title="Trò chơi hàng ngày"
                  description="Thử thách mới mỗi ngày"
                  className="md:col-span-2 lg:col-span-1"
                >
                  <div className="flex justify-between items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                    >
                      <div className="text-3xl font-bold text-game-primary">
                        {userStats.availableGames}
                      </div>
                      <div className="text-sm text-game-accent/70">
                        Trò chơi khả dụng
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="game-button" asChild>
                        <Link href="/daily-games">Chơi ngay</Link>
                      </Button>
                    </motion.div>
                  </div>
                </StatsCard>
              </motion.div>
            </div>

            <SectionHeader title="Trò chơi từ vựng">
              <div className="grid gap-4 md:grid-cols-2">
                {vocabularyGames.map((game, index) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    description={game.description}
                    icon={game.icon_name} // Assuming icon_name is stored in the database
                    iconColor={game.color || "bg-game-primary"}
                    progress={game.progress || 0}
                    index={index}
                  />
                ))}
                {vocabularyGames.length === 0 && (
                  <p className="text-game-accent/70 md:col-span-2 text-center p-4">
                    Chưa có trò chơi từ vựng khả dụng
                  </p>
                )}
              </div>
            </SectionHeader>

            <SectionHeader title="Trò chơi ngữ pháp" delay={0.5}>
              <div className="grid gap-4 md:grid-cols-2">
                {grammarGames.map((game, index) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    description={game.description}
                    icon={game.icon_name} // Assuming icon_name is stored in the database
                    iconColor={game.color || "bg-game-primary"}
                    progress={game.progress || 0}
                    index={index}
                  />
                ))}
                {grammarGames.length === 0 && (
                  <p className="text-game-accent/70 md:col-span-2 text-center p-4">
                    Chưa có trò chơi ngữ pháp khả dụng
                  </p>
                )}
              </div>
            </SectionHeader>

            <SectionHeader title="Thành tích gần đây" delay={0.6}>
              <div className="grid gap-4 md:grid-cols-3">
                {achievements.map((achievement, index) => (
                  <AchievementCard
                    key={achievement.id}
                    id={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    icon={achievement.icon_name} // Assuming icon_name is stored in the database
                    completed={achievement.completed}
                    category={achievement.category}
                    index={index}
                  />
                ))}
                {achievements.length === 0 && (
                  <p className="text-game-accent/70 md:col-span-3 text-center p-4">
                    Chưa có thành tích nào
                  </p>
                )}
              </div>
            </SectionHeader>
          </motion.div>

          {/* Leaderboard column - visible on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0 space-y-6"
          >
            <h2 className="text-2xl font-bold text-game-accent">
              Bảng xếp hạng
            </h2>
            <div className="sticky top-24">
              <Leaderboard
                data={leaderboardData}
                currentUserId={userProfile?.id}
              />
            </div>
          </motion.div>
        </div>

        {/* Leaderboard for mobile and tablet - shown below main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 lg:hidden"
        >
          <h2 className="mb-4 text-2xl font-bold text-game-accent">
            Bảng xếp hạng
          </h2>
          <Leaderboard data={leaderboardData} currentUserId={userProfile?.id} />
        </motion.div>
      </main>
    </div>
  );
}
