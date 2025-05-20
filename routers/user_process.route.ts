import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import prisma from "@/lib/prismaClient";
import { Prisma, User, UserProgress } from "@prisma/client";

// Define types for the models that aren't recognized yet
type UserLearningAnswerGroupByOutputItem = {
  wordId?: number | null;
  grammarId?: number | null;
  _count: {
    _all: number;
  };
};

// Định nghĩa kiểu dữ liệu cho userGameCompletion để tránh lỗi any
interface UserGameCompletion {
  userId: string;
  gameType: string;
  score?: number;
  timeTaken?: number;
  completedAt: Date;
  expEarned?: number;
}

// Định nghĩa trước router để sử dụng sau này
let userProcessRouterInstance: ReturnType<typeof createTRPCRouter>;

const userProcessRouter = createTRPCRouter({
  getCategoryProcesses: baseProcedure.query(async ({ ctx }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }    return await prisma.$queryRaw`
      SELECT up.*, c.* 
      FROM "public"."user_progress" up
      JOIN "public"."categories" c ON up."category_id" = c."category_id"
      WHERE up."user_id" = ${user.user.id}::uuid
      AND up."category_id" IS NOT NULL
    `;
  }),

  // Add new endpoint for game stats
  getGameStats: baseProcedure.query(async ({ ctx }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get user's game-related data
    const userData = await prisma.user.findUnique({
      where: {
        userId: user.user.id,
      },
      select: {
        streakDays: true,
        totalPoints: true,
      },
    });

    // Get user's progress data for games
    const gameProgress = await prisma.$queryRaw`
      SELECT * FROM "public"."user_progress"
      WHERE "user_id" = ${user.user.id}::uuid
      AND "content_type" = 'game'
    `;

    // Count game completion records for different game types
    const gameCompletions = await prisma.$queryRaw<UserGameCompletion[]>`
      SELECT * FROM "public"."user_game_completions"
      WHERE "user_id" = ${user.user.id}::uuid
      ORDER BY "completed_at" DESC
    `;

    // Count by game type
    const gameStats = gameCompletions.reduce(
      (
        acc: { pronunciationSessions: number; pronunciationScoreTotal: number },
        curr: UserGameCompletion
      ) => {
        if (curr.gameType === "pronunciation-check") {
          acc.pronunciationSessions++;
          acc.pronunciationScoreTotal += curr.score || 0;
        }
        return acc;
      },
      { pronunciationSessions: 0, pronunciationScoreTotal: 0 }
    );

    // Calculate average score
    const pronunciationAvgScore =
      gameStats.pronunciationSessions > 0
        ? Math.round(
            gameStats.pronunciationScoreTotal / gameStats.pronunciationSessions
          )
        : 0;

    return {
      streak: userData?.streakDays || 0,
      totalPoints: userData?.totalPoints || 0,
      gamesPlayed: gameCompletions.length,
      pronunciationSessions: gameStats.pronunciationSessions,
      pronunciationScore: pronunciationAvgScore,
    };
  }),

  // Add new endpoint for adding experience points
  addExperience: baseProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        source: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Update user's total points
      const updatedUser = await prisma.user.update({
        where: {
          userId: user.user.id,
        },
        data: {
          totalPoints: { increment: input.amount },
          lastActiveDate: new Date(),
          // Increment streak if it's from a daily activity
          ...(input.source.includes("daily") && {
            streakDays: { increment: 1 },
          }),
        },
      });

      // Update active leaderboards
      try {
        await prisma.$transaction(async (tx) => {
          const activeLeaderboards = await tx.leaderboard.findMany({
            where: {
              startDate: { lte: new Date() },
              OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
            },
          });

          for (const leaderboard of activeLeaderboards) {
            const existingEntry = await tx.leaderboardEntry.findFirst({
              where: {
                leaderboardId: leaderboard.leaderboardId,
                userId: user.user.id,
              },
            });

            if (existingEntry) {
              await tx.leaderboardEntry.update({
                where: { entryId: existingEntry.entryId },
                data: {
                  score: { increment: input.amount },
                  updatedAt: new Date(),
                },
              });
            } else {
              await tx.leaderboardEntry.create({
                data: {
                  leaderboardId: leaderboard.leaderboardId,
                  userId: user.user.id,
                  score: input.amount,
                  updatedAt: new Date(),
                },
              });
            }
          }
        });
      } catch (error) {
        console.error("Error updating leaderboard with experience:", error);
        // Continue anyway even if leaderboard update fails
      }

      return {
        success: true,
        newTotal: updatedUser.totalPoints,
      };
    }),

  // Add endpoint to track game completion
  completeGame: baseProcedure
    .input(
      z.object({
        gameType: z.string(),
        score: z.number().optional(),
        timeTaken: z.number().optional(),
        difficultyLevel: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<any> => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      try {
        // Define experience points based on game type and results
        let expPoints = 0;
        const gameSource = `game-completion-${input.gameType}`;

        // Calculate experience points based on game type and score
        if (input.gameType === "pronunciation-check") {
          // Experience points for pronunciation based on score
          if (input.score) {
            if (input.score >= 90) expPoints = 50;
            else if (input.score >= 80) expPoints = 40;
            else if (input.score >= 70) expPoints = 30;
            else if (input.score >= 60) expPoints = 20;
            else expPoints = 10; // Minimum points for completion
          } else {
            expPoints = 10; // Default if no score
          }
        } else if (
          input.gameType === "word-association" ||
          input.gameType === "word-guess" ||
          input.gameType === "sentence-scramble"
        ) {
          // Experience points for vocabulary and grammar games
          if (input.score) {
            if (input.score >= 90) expPoints = 30;
            else if (input.score >= 70) expPoints = 20;
            else expPoints = 10;
          } else {
            expPoints = 10;
          }
        } else {
          // Default points for other games
          expPoints = 10;
        }

        // Record game completion using raw SQL
        await prisma.$executeRaw`
          INSERT INTO "public"."user_game_completions" 
          ("user_id", "game_type", "score", "time_taken", "completed_at", "exp_earned", "difficulty_level")
          VALUES (${user.user.id}::uuid, ${input.gameType}, ${
          input.score || null
        }, 
                  ${input.timeTaken || null}, ${new Date()}, ${expPoints}, ${
          input.difficultyLevel || 1
        })
        `;

        // Update user's game progress
        const gameProgress = await prisma.$queryRaw<UserProgress[]>`
          SELECT * FROM "public"."user_progress" 
          WHERE "user_id" = ${user.user.id}::uuid 
          AND "content_type" = 'game'
        `;

        if (gameProgress.length === 0) {
          // Create new progress record if none exists
          await prisma.$executeRaw`
            INSERT INTO "public"."user_progress"
            ("user_id", "content_type", "process_percentage", "times_practiced", "last_practiced")
            VALUES (${user.user.id}::uuid, 'game', 5, 1, ${new Date()})
          `;
        } else {
          // Update existing progress
          const progress = gameProgress[0];
          const newPercentage = Math.min(progress.processPercentage + 5, 100);

          await prisma.$executeRaw`
            UPDATE "public"."user_progress"
            SET "times_practiced" = "times_practiced" + 1,
                "process_percentage" = ${newPercentage},
                "last_practiced" = ${new Date()}
            WHERE "progress_id" = ${progress.progressId}
          `;
        }

        // Add experience points for the user (directly update user record to avoid circular reference)
        if (expPoints > 0) {
          // Update user's total points
          await prisma.user.update({
            where: {
              userId: user.user.id,
            },
            data: {
              totalPoints: { increment: expPoints },
              lastActiveDate: new Date(),
            },
          });

          // Update active leaderboards
          try {
            await prisma.$transaction(async (tx) => {
              const activeLeaderboards = await tx.leaderboard.findMany({
                where: {
                  startDate: { lte: new Date() },
                  OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
                },
              });

              for (const leaderboard of activeLeaderboards) {
                const existingEntry = await tx.leaderboardEntry.findFirst({
                  where: {
                    leaderboardId: leaderboard.leaderboardId,
                    userId: user.user.id,
                  },
                });

                if (existingEntry) {
                  await tx.leaderboardEntry.update({
                    where: { entryId: existingEntry.entryId },
                    data: {
                      score: { increment: expPoints },
                      updatedAt: new Date(),
                    },
                  });
                } else {
                  await tx.leaderboardEntry.create({
                    data: {
                      leaderboardId: leaderboard.leaderboardId,
                      userId: user.user.id,
                      score: expPoints,
                      updatedAt: new Date(),
                    },
                  });
                }
              }
            });
          } catch (error) {
            console.error("Error updating leaderboard with experience:", error);
            // Continue anyway even if leaderboard update fails
          }
        }

        // Get game statistics after update
        const gameStats = await prisma.$queryRaw<any[]>`
          SELECT 
            COUNT(*) FILTER (WHERE game_type = 'pronunciation-check') as pronunciation_sessions,
            AVG(score) FILTER (WHERE game_type = 'pronunciation-check') as pronunciation_score
          FROM "public"."user_game_completions"
          WHERE "user_id" = ${user.user.id}::uuid
        `;

        // Get user streak days
        const userData = await prisma.user.findUnique({
          where: {
            userId: user.user.id,
          },
          select: {
            streakDays: true,
          },
        });

        return {
          streak: userData?.streakDays || 0,
          pronunciationSessions:
            parseInt(gameStats[0].pronunciation_sessions) || 0,
          pronunciationScore: Math.round(gameStats[0].pronunciation_score) || 0,
          expEarned: expPoints,
        };
      } catch (error) {
        console.error("Error completing game:", error);
        throw new Error(`Failed to complete game: ${error.message}`);
      }
    }),

  userAnswerFlashcard: baseProcedure
    .input(
      z.object({
        wordId: z.number().optional(),
        grammarId: z.number().optional(),
        correct: z.boolean(),
        categoryId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }): Promise<any> => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      const contentType = input.wordId ? "vocabulary" : "grammar";

      // find user progress using raw query      
      const progressResult = await prisma.$queryRaw<UserProgress[]>`
        SELECT * FROM "public"."user_progress"
        WHERE "user_id" = ${user.user.id}::uuid
        AND "category_id" = ${input.categoryId}
        AND "content_type" = ${contentType}
      `;

      let progress: UserProgress;

      if (progressResult.length === 0) {
        // Create new progress
        const newProgress = await prisma.$executeRaw`
          INSERT INTO "public"."user_progress"
          ("user_id", "category_id", "process_percentage", "content_type")
          VALUES (${user.user.id}::uuid, ${input.categoryId}, 0, ${contentType})
          RETURNING *
        `;

        // Fetch the newly created progress        
        const fetchedProgress = await prisma.$queryRaw<UserProgress[]>`
          SELECT * FROM "public"."user_progress"
          WHERE "user_id" = ${user.user.id}::uuid
          AND "category_id" = ${input.categoryId}
          AND "content_type" = ${contentType}
          ORDER BY "progress_id" DESC
          LIMIT 1
        `;

        progress = fetchedProgress[0];
      } else {
        progress = progressResult[0];
      }

      // Create learning answer record using raw query
      await prisma.$executeRaw`
        INSERT INTO "public"."user_learning_answers"
        ("user_id", "word_id", "grammar_id", "is_correct", "created_at", "process_id")
        VALUES (${user.user.id}::uuid, ${input.wordId || null}, ${
        input.grammarId || null
      }, 
                ${input.correct}, ${new Date()}, ${progress.progressId})
      `;

      // Check if this is first time learning this word/grammar correctly
      let isFirstTimeCorrect = false;
      if (input.correct) {
        let previousCorrectAnswers;
        if (input.wordId) {
          previousCorrectAnswers = await prisma.$queryRaw<any[]>`
            SELECT * FROM "public"."user_learning_answers"
            WHERE "user_id" = ${user.user.id}
            AND "word_id" = ${input.wordId}
            AND "is_correct" = true
            AND "created_at" < ${new Date()}
            LIMIT 1
          `;
        } else if (input.grammarId) {
          previousCorrectAnswers = await prisma.$queryRaw<any[]>`
            SELECT * FROM "public"."user_learning_answers"
            WHERE "user_id" = ${user.user.id}
            AND "grammar_id" = ${input.grammarId}
            AND "is_correct" = true
            AND "created_at" < ${new Date()}
            LIMIT 1
          `;
        }

        isFirstTimeCorrect =
          !previousCorrectAnswers || previousCorrectAnswers.length === 0;
      }

      // Award EXP points based on the answer and item type
      const expPoints = input.correct
        ? isFirstTimeCorrect
          ? 10
          : 5 // 10 points for first correct answer, 5 for repeated correct answers
        : 0; // No points for incorrect answers

      if (expPoints > 0) {
        const source = input.wordId
          ? "vocabulary-learning"
          : "grammar-learning";

        // Sử dụng instance đã tạo
        await userProcessRouterInstance.mutations.addExperience.resolve(
          { amount: expPoints, source },
          ctx
        );
      }

      // recalculate progress
      let total = 0;
      let correctUnique: UserLearningAnswerGroupByOutputItem[] = [];

      if (input.wordId) {
        const totalResult = await prisma.$queryRaw<[{ count: number }]>`
          SELECT COUNT(*) as count FROM "public"."vocabulary_words"
          WHERE "category_id" = ${input.categoryId}
        `;
        total = Number(totalResult[0].count);

        const uniqueWords = await prisma.$queryRaw<[{ count: number }]>`
          SELECT COUNT(DISTINCT "word_id") as count
          FROM "public"."user_learning_answers"
          WHERE "user_id" = ${user.user.id}
          AND "is_correct" = true
          AND "process_id" = ${progress.progressId}
          AND "word_id" IS NOT NULL
        `;
        correctUnique = [{ _count: { _all: Number(uniqueWords[0].count) } }];
      } else {
        // For grammar
        const totalResult = await prisma.$queryRaw<[{ count: number }]>`
          SELECT COUNT(*) as count FROM "public"."grammar_contents"
          WHERE "category_id" = ${input.categoryId}
        `;
        total = Number(totalResult[0].count);

        const uniqueGrammars = await prisma.$queryRaw<[{ count: number }]>`
          SELECT COUNT(DISTINCT "grammar_id") as count
          FROM "public"."user_learning_answers"
          WHERE "user_id" = ${user.user.id}
          AND "is_correct" = true
          AND "process_id" = ${progress.progressId}
          AND "grammar_id" IS NOT NULL
        `;
        correctUnique = [{ _count: { _all: Number(uniqueGrammars[0].count) } }];
      }

      const correctCount =
        correctUnique.length > 0 ? correctUnique[0]._count._all : 0;
      const percentage = total > 0 ? (correctCount / total) * 100 : 0;

      // Cập nhật tiến trình
      await prisma.$executeRaw`
        UPDATE "public"."user_progress"
        SET "process_percentage" = ${percentage},
            "last_practiced" = ${new Date()}
        WHERE "progress_id" = ${progress.progressId}
      `;

      // Kích hoạt kiểm tra thành tích khi người dùng học từ mới/ngữ pháp mới
      if (isFirstTimeCorrect) {
        try {
          const achievementRouter = await import("./achievement.route").then(
            (mod) => mod.default
          );
          // Sử dụng phương thức từ router mà không truy cập vào queries
          await achievementRouter.createCaller(ctx).checkAchievements();
        } catch (error) {
          console.error("Error checking achievements after learning:", error);
          // Tiếp tục dù có lỗi khi kiểm tra thành tích
        }
      }

      // Trả về thông tin tiến độ học tập đã cập nhật
      return {
        progress: {
          percentage,
          correctCount,
          total,
          contentType,
        },
        expEarned: expPoints,
        isFirstTimeCorrect,
      };
    }),

  userRegisterCategory: baseProcedure
    .input(
      z.object({
        categoryId: z.number(),
        contentType: z.enum(["vocabulary", "grammar"]).default("vocabulary"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }      // if user already registered, return
      const userCategory = await prisma.$queryRaw<any[]>`
        SELECT * FROM "public"."user_progress"
        WHERE "user_id" = ${user.user.id}::uuid
        AND "category_id" = ${input.categoryId}
        AND "content_type" = ${input.contentType}
        LIMIT 1
      `;

      if (userCategory && userCategory.length > 0) {
        return;
      }      await prisma.$executeRaw`
        INSERT INTO "public"."user_progress"
        ("user_id", "category_id", "process_percentage", "content_type")
        VALUES (${user.user.id}::uuid, ${input.categoryId}, 0, ${input.contentType})
      `;
    }),
});

// Lưu instance để có thể tham chiếu đến nó trong các phương thức
userProcessRouterInstance = userProcessRouter;

export default userProcessRouter;


