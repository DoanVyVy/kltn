import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "./init";
import { paginationRequestSchema } from "@/schema/pagination";
import { createHash } from "crypto";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Hàm mã hóa mật khẩu thay thế bcrypt
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const userRouter = createTRPCRouter({
  getAllUsers: baseProcedure
    .input(
      paginationRequestSchema.extend({
        search: z.string().optional(),
        role: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const { page, limit, search, role, status } = input;

      const where: any = {};

      // Tìm kiếm theo tên hoặc email
      if (search) {
        where.OR = [
          {
            username: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      // Lọc theo vai trò dựa vào currentLevel
      if (role) {
        if (role === "admin") {
          where.currentLevel = { gte: 10 };
        } else if (role === "moderator") {
          where.currentLevel = { gte: 5, lt: 10 };
        } else {
          where.currentLevel = { lt: 5 };
        }
      }

      // Lọc theo trạng thái nếu có
      if (status) {
        if (status === "active") {
          where.lastActiveDate = {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hoạt động trong 30 ngày qua
          };
        } else if (status === "inactive") {
          where.lastActiveDate = {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Không hoạt động trong 30 ngày
          };
        }
      }

      // Đếm tổng số người dùng thỏa mãn điều kiện
      const total = await db.user.count({ where });

      // Lấy danh sách người dùng phân trang
      const users = await db.user.findMany({
        where,
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          currentLevel: true,
          totalPoints: true,
          streakDays: true,
          lastActiveDate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Thêm trường role dựa vào currentLevel
      const usersWithRole = users.map((user) => ({
        ...user,
        role:
          user.currentLevel >= 10
            ? "admin"
            : user.currentLevel >= 5
            ? "moderator"
            : "user",
      }));

      return {
        items: usersWithRole,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getUserById: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      if (!userId) return null;

      const user = await db.user.findUnique({
        where: {
          userId,
        },
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          currentLevel: true,
          totalPoints: true,
          streakDays: true,
          lastActiveDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) return null;

      // Thêm trường role dựa vào currentLevel
      return {
        ...user,
        role:
          user.currentLevel >= 10
            ? "admin"
            : user.currentLevel >= 5
            ? "moderator"
            : "user",
      };
    }),

  getUserLearningStats: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      if (!userId) return null;

      // Count vocabulary words learned (using unique wordIds with isCorrect = true)
      const vocabAnswers = await db.userLearningAnswer.findMany({
        where: {
          userId,
          isCorrect: true,
          wordId: { not: null },
        },
        select: {
          wordId: true,
        },
      });

      // Get unique vocabulary words
      const uniqueWordIds = [
        ...new Set(
          vocabAnswers
            .map((a: { wordId: number | null }) => a.wordId)
            .filter((id): id is number => id !== null)
        ),
      ];
      const vocabularyCount = uniqueWordIds.length;

      // Count grammar rules learned (using unique grammarIds with isCorrect = true)
      const grammarAnswers = await db.userLearningAnswer.findMany({
        where: {
          userId,
          isCorrect: true,
          grammarId: { not: null },
        },
        select: {
          grammarId: true,
        },
      });

      // Get unique grammar rules
      const uniqueGrammarIds = [
        ...new Set(
          grammarAnswers
            .filter((a: { grammarId: number | null }) => a.grammarId !== null)
            .map((a: { grammarId: number | null }) => a.grammarId as number)
        ),
      ];
      const grammarCount = uniqueGrammarIds.length;

      // Count total learning activities
      const totalActivities = await db.userLearningAnswer.count({
        where: {
          userId,
        },
      });

      return {
        vocabularyCount,
        grammarCount,
        gamesPlayed: totalActivities,
      };
    }),

  createUser: baseProcedure
    .input(
      z.object({
        username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
        email: z.string().email("Email không hợp lệ"),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        fullName: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { username, email, password, fullName, role } = input;

      // Kiểm tra username hoặc email đã tồn tại chưa
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error("Tên người dùng đã tồn tại");
        }
        if (existingUser.email === email) {
          throw new Error("Email đã tồn tại");
        }
      }

      // Mã hóa mật khẩu
      const passwordHash = hashPassword(password);

      // Thiết lập currentLevel dựa vào role
      let currentLevel = 1;
      if (role === "admin") currentLevel = 10;
      else if (role === "moderator") currentLevel = 5;

      // Tạo người dùng mới sử dụng currentLevel thay vì role
      const newUser = await db.user.create({
        data: {
          username,
          email,
          passwordHash,
          fullName,
          currentLevel,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role:
          currentLevel >= 10
            ? "admin"
            : currentLevel >= 5
            ? "moderator"
            : "user",
      };
    }),

  updateUser: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        fullName: z.string().optional(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId, username, email, fullName, role } = input;

      if (username || email) {
        // Kiểm tra username hoặc email đã tồn tại chưa (ngoại trừ người dùng hiện tại)
        const existingUser = await db.user.findFirst({
          where: {
            OR: [username ? { username } : {}, email ? { email } : {}],
            NOT: {
              userId,
            },
          },
        });

        if (existingUser) {
          if (username && existingUser.username === username) {
            throw new Error("Tên người dùng đã tồn tại");
          }
          if (email && existingUser.email === email) {
            throw new Error("Email đã tồn tại");
          }
        }
      }

      // Thiết lập currentLevel dựa vào role
      let currentLevel;
      if (role) {
        if (role === "admin") currentLevel = 10;
        else if (role === "moderator") currentLevel = 5;
        else currentLevel = 1;
      }

      // Cập nhật thông tin người dùng sử dụng currentLevel
      const updatedUser = await db.user.update({
        where: {
          userId,
        },
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(fullName !== undefined && { fullName }),
          ...(currentLevel !== undefined && { currentLevel }),
          updatedAt: new Date(),
        },
      });

      return {
        ...updatedUser,
        role:
          updatedUser.currentLevel >= 10
            ? "admin"
            : updatedUser.currentLevel >= 5
            ? "moderator"
            : "user",
      };
    }),

  resetPassword: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId, newPassword } = input;

      // Mã hóa mật khẩu mới
      const passwordHash = hashPassword(newPassword);

      // Cập nhật mật khẩu
      await db.user.update({
        where: {
          userId,
        },
        data: {
          passwordHash,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  deleteUser: baseProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      // Xóa người dùng
      await db.user.delete({
        where: {
          userId,
        },
      });

      return { success: true };
    }),

  getUserProfile: baseProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { db }, input }) => {
      const { userId } = input;

      if (!userId) {
        console.log("getUserProfile: No userId provided");
        return null;
      }

      console.log("getUserProfile: Looking up user with ID:", userId);

      // First try direct lookup
      let user = await db.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          currentLevel: true,
          totalPoints: true,
          streakDays: true,
          lastActiveDate: true,
          createdAt: true,
          role: true,
        },
      });

      // If no user found, try looking in user_metadata for mapping
      if (!user) {
        console.log(
          "getUserProfile: No user found with direct ID lookup. Looking up by metadata..."
        );
        try {
          // Try to find a user with matching metadata.userId
          const { data, error } = await createRouteHandlerClient({ cookies })
            .from("users")
            .select("user_id, email, metadata")
            .eq("auth_id", userId)
            .maybeSingle();

          if (data && data.user_id) {
            console.log(
              "Found matching user in Supabase with database ID:",
              data.user_id
            );

            // Now look up this user in the database
            user = await db.user.findFirst({
              where: { userId: data.user_id },
              select: {
                userId: true,
                username: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                currentLevel: true,
                totalPoints: true,
                streakDays: true,
                lastActiveDate: true,
                createdAt: true,
                role: true,
              },
            });
          } else {
            console.log("No matching user found in metadata lookup.");
          }
        } catch (error) {
          console.error("Error during metadata lookup:", error);
        }
      }

      if (!user) {
        console.log("getUserProfile: User not found after all attempts");
        return null;
      }

      console.log("getUserProfile: Found user:", user.email);

      let uniqueWordIds: number[] = [];
      let uniqueGrammarIds: number[] = [];

      type LearningAnswer = {
        wordId: number | null;
        grammarId: number | null;
      };

      try {
        const learningAnswers: LearningAnswer[] =
          await db.userLearningAnswer.findMany({
            where: {
              userId,
              isCorrect: true,
            },
            select: {
              wordId: true,
              grammarId: true,
            },
          });

        // Safely extract the word IDs
        const wordIds = learningAnswers
          .filter((answer: LearningAnswer) => answer.wordId !== null)
          .map((answer: LearningAnswer) => answer.wordId)
          .filter((id: any) => typeof id === "number");

        uniqueWordIds = [...new Set(wordIds)] as number[];

        // Safely extract the grammar IDs
        const grammarIds = learningAnswers
          .filter((answer: LearningAnswer) => answer.grammarId !== null)
          .map((answer: LearningAnswer) => answer.grammarId)
          .filter((id: any) => typeof id === "number");

        uniqueGrammarIds = [...new Set(grammarIds)] as number[];
      } catch (error) {
        console.error("Error fetching learning answers:", error);
        // Continue with empty arrays if table doesn't exist yet
      }

      // Get user achievements
      const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: {
          dateAchieved: "desc",
        },
      });

      type WordCategory = {
        categoryId: number;
        categoryName: string;
        vocabularyWords?: { wordId: number }[];
      };

      type GrammarCategory = {
        categoryId: number;
        categoryName: string;
        grammarContents?: { contentId: number }[];
      };

      // Get word categories learned - handle empty arrays
      let wordCategories: WordCategory[] = [];
      if (uniqueWordIds.length > 0) {
        try {
          wordCategories = await db.category.findMany({
            where: {
              isVocabularyCourse: true,
              vocabularyWords: {
                some: {
                  wordId: {
                    in: uniqueWordIds,
                  },
                },
              },
            },
            select: {
              categoryId: true,
              categoryName: true,
              vocabularyWords: {
                where: {
                  wordId: {
                    in: uniqueWordIds,
                  },
                },
                select: {
                  wordId: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("Error fetching word categories:", error);
        }
      }

      // Get grammar categories learned - handle empty arrays
      let grammarCategories: GrammarCategory[] = [];
      if (uniqueGrammarIds.length > 0) {
        try {
          grammarCategories = await db.category.findMany({
            where: {
              isVocabularyCourse: false,
              grammarContents: {
                some: {
                  contentId: {
                    in: uniqueGrammarIds,
                  },
                },
              },
            },
            select: {
              categoryId: true,
              categoryName: true,
              grammarContents: {
                where: {
                  contentId: {
                    in: uniqueGrammarIds,
                  },
                },
                select: {
                  contentId: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("Error fetching grammar categories:", error);
        }
      }

      // Get games completed count
      const userProgress = await db.userProgress.findMany({
        where: { userId },
      });
      const gamesCompleted = userProgress.reduce(
        (total, progress) => total + progress.timesPracticed,
        0
      );

      // Format achievements
      const achievements = userAchievements.map((ua) => ({
        id: ua.achievementId,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.iconUrl || "",
        category: ua.achievement.title.toLowerCase().includes("vocabulary")
          ? "vocabulary"
          : "grammar",
        dateAchieved: ua.dateAchieved,
        completed: true,
      }));

      // Format word categories - safely handle undefined properties
      const wordCategoriesFormatted = wordCategories.map(
        (cat: WordCategory) => ({
          categoryId: cat.categoryId,
          name: cat.categoryName,
          count: cat.vocabularyWords ? cat.vocabularyWords.length : 0,
        })
      );

      // Format grammar categories - safely handle undefined properties
      const grammarCategoriesFormatted = grammarCategories.map(
        (cat: GrammarCategory) => ({
          categoryId: cat.categoryId,
          name: cat.categoryName,
          count: cat.grammarContents ? cat.grammarContents.length : 0,
        })
      );

      return {
        ...user,
        wordsLearned: uniqueWordIds.length,
        grammarRulesLearned: uniqueGrammarIds.length,
        gamesCompleted,
        achievements,
        wordCategories: wordCategoriesFormatted,
        grammarCategories: grammarCategoriesFormatted,
      };
    }),

  getUserProfileByEmail: baseProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx: { db }, input }) => {
      const { email } = input;

      if (!email) {
        console.log("getUserProfileByEmail: No email provided");
        return null;
      }

      console.log("getUserProfileByEmail: Looking up user with email:", email);

      // Get user basic info by email
      let user = await db.user.findFirst({
        where: { email },
        select: {
          userId: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          currentLevel: true,
          totalPoints: true,
          streakDays: true,
          lastActiveDate: true,
          createdAt: true,
          role: true,
        },
      });

      // If no user found, create a new user profile
      if (!user) {
        console.log(
          "getUserProfileByEmail: No user found with email - creating new profile"
        );

        try {
          // Get Supabase user data if available
          const supabase = createRouteHandlerClient({ cookies });
          const { data: authUser } = await supabase.auth.getUser();

          // Create a new user profile
          const newUser = await db.user.create({
            data: {
              userId: authUser?.user?.id || `email-${Date.now()}`, // Use auth ID if available
              username: email.split("@")[0],
              email: email,
              passwordHash: "", // Empty since managed by Supabase
              fullName:
                authUser?.user?.user_metadata?.name || email.split("@")[0],
              currentLevel: 1,
              totalPoints: 0,
              streakDays: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastActiveDate: new Date(),
            },
          });

          console.log(
            "getUserProfileByEmail: Created new user:",
            newUser.userId
          );

          // Use the newly created user
          user = {
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.fullName,
            avatarUrl: null,
            currentLevel: 1,
            totalPoints: 0,
            streakDays: 0,
            lastActiveDate: new Date(),
            createdAt: new Date(),
            role: "user",
          };
        } catch (error) {
          console.error("Error creating new user:", error);
          return null;
        }
      }

      console.log("getUserProfileByEmail: Using user profile:", user.userId);

      // Get userId for the next queries
      const userId = user.userId;
      let uniqueWordIds: number[] = [];
      let uniqueGrammarIds: number[] = [];

      type LearningAnswer = {
        wordId: number | null;
        grammarId: number | null;
      };

      try {
        // Find all correct learning answers from the user
        const learningAnswers: LearningAnswer[] =
          await db.userLearningAnswer.findMany({
            where: {
              userId,
              isCorrect: true,
            },
            select: {
              wordId: true,
              grammarId: true,
            },
          });

        // Safely extract the word IDs
        const wordIds = learningAnswers
          .filter((answer: LearningAnswer) => answer.wordId !== null)
          .map((answer: LearningAnswer) => answer.wordId)
          .filter((id: any) => typeof id === "number");

        uniqueWordIds = [...new Set(wordIds)] as number[];

        // Safely extract the grammar IDs
        const grammarIds = learningAnswers
          .filter((answer: LearningAnswer) => answer.grammarId !== null)
          .map((answer: LearningAnswer) => answer.grammarId)
          .filter((id: any) => typeof id === "number");

        uniqueGrammarIds = [...new Set(grammarIds)] as number[];
      } catch (error) {
        console.error("Error fetching learning answers:", error);
        // Continue with empty arrays if table doesn't exist yet
      }

      // Get user achievements
      const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: {
          dateAchieved: "desc",
        },
      });

      type WordCategory = {
        categoryId: number;
        categoryName: string;
        vocabularyWords?: { wordId: number }[];
      };

      type GrammarCategory = {
        categoryId: number;
        categoryName: string;
        grammarContents?: { contentId: number }[];
      };

      // Get word categories learned - handle empty arrays
      let wordCategories: WordCategory[] = [];
      if (uniqueWordIds.length > 0) {
        try {
          wordCategories = await db.category.findMany({
            where: {
              isVocabularyCourse: true,
              vocabularyWords: {
                some: {
                  wordId: {
                    in: uniqueWordIds,
                  },
                },
              },
            },
            select: {
              categoryId: true,
              categoryName: true,
              vocabularyWords: {
                where: {
                  wordId: {
                    in: uniqueWordIds,
                  },
                },
                select: {
                  wordId: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("Error fetching word categories:", error);
        }
      }

      // Get grammar categories learned - handle empty arrays
      let grammarCategories: GrammarCategory[] = [];
      if (uniqueGrammarIds.length > 0) {
        try {
          grammarCategories = await db.category.findMany({
            where: {
              isVocabularyCourse: false,
              grammarContents: {
                some: {
                  contentId: {
                    in: uniqueGrammarIds,
                  },
                },
              },
            },
            select: {
              categoryId: true,
              categoryName: true,
              grammarContents: {
                where: {
                  contentId: {
                    in: uniqueGrammarIds,
                  },
                },
                select: {
                  contentId: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("Error fetching grammar categories:", error);
        }
      }

      // Get games completed count
      const userProgress = await db.userProgress.findMany({
        where: { userId },
      });
      const gamesCompleted = userProgress.reduce(
        (total, progress) => total + progress.timesPracticed,
        0
      );

      // Format achievements
      const achievements = userAchievements.map((ua) => ({
        id: ua.achievementId,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.iconUrl || "",
        category: ua.achievement.title.toLowerCase().includes("vocabulary")
          ? "vocabulary"
          : "grammar",
        dateAchieved: ua.dateAchieved,
        completed: true,
      }));

      // Format word categories - safely handle undefined properties
      const wordCategoriesFormatted = wordCategories.map(
        (cat: WordCategory) => ({
          categoryId: cat.categoryId,
          name: cat.categoryName,
          count: cat.vocabularyWords ? cat.vocabularyWords.length : 0,
        })
      );

      // Format grammar categories - safely handle undefined properties
      const grammarCategoriesFormatted = grammarCategories.map(
        (cat: GrammarCategory) => ({
          categoryId: cat.categoryId,
          name: cat.categoryName,
          count: cat.grammarContents ? cat.grammarContents.length : 0,
        })
      );

      return {
        ...user,
        wordsLearned: uniqueWordIds.length,
        grammarRulesLearned: uniqueGrammarIds.length,
        gamesCompleted,
        achievements,
        wordCategories: wordCategoriesFormatted,
        grammarCategories: grammarCategoriesFormatted,
      };
    }),
});

export default userRouter;
