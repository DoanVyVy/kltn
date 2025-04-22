import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import prisma from "@/lib/prismaClient";

// Định nghĩa schema cho achievement
export const achievementSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  iconUrl: z.string().optional(),
  requiredCondition: z.string().optional(),
  pointsReward: z.number().int().default(0),
});

// Tạo router cho achievements
const achievementRouter = createTRPCRouter({
  // Lấy danh sách tất cả thành tích
  getAllAchievements: baseProcedure.query(async ({ ctx }) => {
    try {
      const achievements = await prisma.achievement.findMany({
        orderBy: [
          {
            pointsReward: "desc",
          },
          {
            title: "asc",
          },
        ],
      });

      return achievements;
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return [];
    }
  }),

  // Lấy danh sách thành tích của người dùng hiện tại
  getUserAchievements: baseProcedure.query(async ({ ctx }) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.user || !user.user.id) {
        throw new Error("Unauthorized");
      }

      const userId = user.user.id;

      // Lấy tất cả thành tích
      const allAchievements = await prisma.achievement.findMany({
        orderBy: [
          {
            pointsReward: "desc",
          },
          {
            title: "asc",
          },
        ],
      });

      // Lấy thành tích của người dùng
      const userAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
        },
        include: {
          achievement: true,
        },
      });

      // Kết hợp thông tin
      const achievementsWithStatus = allAchievements.map((achievement) => {
        const userAchievement = userAchievements.find(
          (ua) => ua.achievementId === achievement.achievementId
        );

        return {
          id: achievement.achievementId,
          title: achievement.title,
          description: achievement.description,
          icon_name: achievement.iconUrl || "Trophy",
          completed: !!userAchievement,
          dateAchieved: userAchievement?.dateAchieved || null,
          category: achievement.title.toLowerCase().includes("vocabulary")
            ? "vocabulary"
            : "grammar",
          pointsReward: achievement.pointsReward,
        };
      });

      return achievementsWithStatus;
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return [];
    }
  }),

  // Kiểm tra điều kiện đạt thành tích cho người dùng
  checkAchievements: baseProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.user || !user.user.id) {
        throw new Error("Unauthorized");
      }

      const userId = user.user.id;

      // Lấy tất cả thành tích
      const allAchievements = await prisma.achievement.findMany();

      // Lấy thành tích người dùng đã đạt được
      const userAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
        },
        select: {
          achievementId: true,
        },
      });

      const userAchievementIds = userAchievements.map((ua) => ua.achievementId);

      // Lấy thống kê học tập của người dùng
      const stats = await prisma.user.findUnique({
        where: { userId },
        select: {
          totalPoints: true,
          streakDays: true,
        },
      });

      if (!stats) {
        throw new Error("User stats not found");
      }

      // Đếm từ vựng đã học
      const learnedWordIds = await prisma.userLearningAnswer.groupBy({
        by: ["wordId"],
        where: {
          userId,
          isCorrect: true,
          wordId: { not: null },
        },
      });
      const wordsLearned = learnedWordIds.length;

      // Đếm ngữ pháp đã học
      const learnedGrammarIds = await prisma.userLearningAnswer.groupBy({
        by: ["grammarId"],
        where: {
          userId,
          isCorrect: true,
          grammarId: { not: null },
        },
      });
      const grammarLearned = learnedGrammarIds.length;

      // Danh sách thành tích mới đạt được
      const newAchievements = [];

      // Kiểm tra từng thành tích
      for (const achievement of allAchievements) {
        // Bỏ qua nếu đã đạt được
        if (userAchievementIds.includes(achievement.achievementId)) {
          continue;
        }

        let achieved = false;
        const title = achievement.title.toLowerCase();

        // Kiểm tra các điều kiện thành tích
        if (title.includes("từ vựng")) {
          if (title.includes("100") && wordsLearned >= 100) achieved = true;
          else if (title.includes("250") && wordsLearned >= 250)
            achieved = true;
          else if (title.includes("500") && wordsLearned >= 500)
            achieved = true;
          else if (title.includes("1000") && wordsLearned >= 1000)
            achieved = true;
        } else if (title.includes("ngữ pháp")) {
          if (title.includes("10") && grammarLearned >= 10) achieved = true;
          else if (title.includes("25") && grammarLearned >= 25)
            achieved = true;
          else if (title.includes("50") && grammarLearned >= 50)
            achieved = true;
          else if (title.includes("100") && grammarLearned >= 100)
            achieved = true;
        } else if (title.includes("streak") || title.includes("liên tiếp")) {
          if (title.includes("7") && stats.streakDays >= 7) achieved = true;
          else if (title.includes("30") && stats.streakDays >= 30)
            achieved = true;
          else if (title.includes("100") && stats.streakDays >= 100)
            achieved = true;
        } else if (title.includes("điểm") || title.includes("points")) {
          if (title.includes("1000") && stats.totalPoints >= 1000)
            achieved = true;
          else if (title.includes("5000") && stats.totalPoints >= 5000)
            achieved = true;
          else if (title.includes("10000") && stats.totalPoints >= 10000)
            achieved = true;
        }

        // Nếu người dùng đạt được thành tích mới
        if (achieved) {
          // Thêm vào danh sách thành tích của người dùng
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: achievement.achievementId,
              dateAchieved: new Date(),
            },
          });

          // Thêm điểm thưởng cho người dùng
          if (achievement.pointsReward > 0) {
            await prisma.user.update({
              where: { userId },
              data: {
                totalPoints: { increment: achievement.pointsReward },
              },
            });
          }

          newAchievements.push({
            id: achievement.achievementId,
            title: achievement.title,
            description: achievement.description,
            icon_name: achievement.iconUrl || "Trophy",
            pointsReward: achievement.pointsReward,
            category: achievement.title.toLowerCase().includes("vocabulary")
              ? "vocabulary"
              : "grammar",
          });
        }
      }

      return {
        newAchievements,
        hasNewAchievements: newAchievements.length > 0,
      };
    } catch (error) {
      console.error("Error checking achievements:", error);
      throw new Error("Failed to check achievements");
    }
  }),

  // CRUD operations cho admin

  // Tạo thành tích mới (chỉ admin)
  createAchievement: baseProcedure
    .input(achievementSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Check if user is admin
        const userData = await prisma.user.findUnique({
          where: { userId: user.user.id },
          select: { currentLevel: true },
        });

        if (!userData || userData.currentLevel < 10) {
          throw new Error("Admin privileges required");
        }

        const achievement = await prisma.achievement.create({
          data: {
            title: input.title,
            description: input.description,
            iconUrl: input.iconUrl,
            requiredCondition: input.requiredCondition,
            pointsReward: input.pointsReward,
          },
        });

        return achievement;
      } catch (error) {
        console.error("Error creating achievement:", error);
        throw new Error("Failed to create achievement");
      }
    }),

  // Cập nhật thành tích (chỉ admin)
  updateAchievement: baseProcedure
    .input(
      achievementSchema.extend({
        achievementId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Check if user is admin
        const userData = await prisma.user.findUnique({
          where: { userId: user.user.id },
          select: { currentLevel: true },
        });

        if (!userData || userData.currentLevel < 10) {
          throw new Error("Admin privileges required");
        }

        const { achievementId, ...data } = input;

        const achievement = await prisma.achievement.update({
          where: { achievementId },
          data,
        });

        return achievement;
      } catch (error) {
        console.error("Error updating achievement:", error);
        throw new Error("Failed to update achievement");
      }
    }),

  // Xóa thành tích (chỉ admin)
  deleteAchievement: baseProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Check if user is admin
        const userData = await prisma.user.findUnique({
          where: { userId: user.user.id },
          select: { currentLevel: true },
        });

        if (!userData || userData.currentLevel < 10) {
          throw new Error("Admin privileges required");
        }

        await prisma.achievement.delete({
          where: { achievementId: input },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting achievement:", error);
        throw new Error("Failed to delete achievement");
      }
    }),
});

export default achievementRouter;
