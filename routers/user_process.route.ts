import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import prisma from "@/lib/prismaClient";

// Define types for the models that aren't recognized yet
type UserLearningAnswerGroupByOutputItem = {
  wordId?: number | null;
  grammarId?: number | null;
  _count: {
    _all: number;
  };
};

const userProcessRouter = createTRPCRouter({
  getCategoryProcesses: baseProcedure.query(async ({ ctx }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    return await prisma.userProgress.findMany({
      where: {
        categoryId: {
          not: null,
        },
        userId: user.user.id,
      },
      include: {
        category: true,
      },
    });
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
    .mutation(async ({ ctx, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      const contentType = input.wordId ? "vocabulary" : "grammar";

      // find user progress
      let progress = await prisma.userProgress.findFirst({
        where: {
          userId: user.user.id,
          categoryId: input.categoryId,
          contentType,
        },
      });

      if (!progress) {
        progress = await prisma.userProgress.create({
          data: {
            userId: user.user.id,
            categoryId: input.categoryId,
            processPercentage: 0,
            contentType,
          },
        });
      }

      // Create learning answer record
      await prisma.userLearningAnswer.create({
        data: {
          userId: user.user.id,
          wordId: input.wordId,
          grammarId: input.grammarId,
          isCorrect: input.correct,
          createdAt: new Date(),
          processId: progress.progressId,
        },
      });

      // Check if this is first time learning this word/grammar correctly
      let isFirstTimeCorrect = false;
      if (input.correct) {
        let previousCorrectAnswers;
        if (input.wordId) {
          previousCorrectAnswers = await prisma.userLearningAnswer.findFirst({
            where: {
              userId: user.user.id,
              wordId: input.wordId,
              isCorrect: true,
              createdAt: { lt: new Date() }
            }
          });
        } else if (input.grammarId) {
          previousCorrectAnswers = await prisma.userLearningAnswer.findFirst({
            where: {
              userId: user.user.id,
              grammarId: input.grammarId,
              isCorrect: true,
              createdAt: { lt: new Date() }
            }
          });
        }
        
        isFirstTimeCorrect = !previousCorrectAnswers;
      }

      // Award EXP points based on the answer and item type
      const expPoints = input.correct 
        ? (isFirstTimeCorrect ? 10 : 5) // 10 points for first correct answer, 5 for repeated correct answers
        : 0; // No points for incorrect answers

      if (expPoints > 0) {
        // Update user total points
        await prisma.user.update({
          where: { email: user.user.email },
          data: {
            totalPoints: { increment: expPoints },
            lastActiveDate: new Date(),
          },
        });

        // Update leaderboard scores
        try {
          await prisma.$transaction(async (prisma) => {
            const activeLeaderboards = await prisma.leaderboard.findMany({
              where: {
                startDate: { lte: new Date() },
                OR: [
                  { endDate: null },
                  { endDate: { gte: new Date() } }
                ]
              }
            });

            for (const leaderboard of activeLeaderboards) {
              const existingEntry = await prisma.leaderboardEntry.findFirst({
                where: {
                  leaderboardId: leaderboard.leaderboardId,
                  userId: user.user.id
                }
              });

              if (existingEntry) {
                await prisma.leaderboardEntry.update({
                  where: { entryId: existingEntry.entryId },
                  data: {
                    score: { increment: expPoints },
                    updatedAt: new Date()
                  }
                });
              } else {
                await prisma.leaderboardEntry.create({
                  data: {
                    leaderboardId: leaderboard.leaderboardId,
                    userId: user.user.id,
                    score: expPoints,
                    updatedAt: new Date()
                  }
                });
              }
            }
          });
        } catch (error) {
          console.error("Error updating leaderboard scores:", error);
          // Continue anyway even if leaderboard update fails
        }
      }

      // recalculate progress
      let total;
      let correctUnique: UserLearningAnswerGroupByOutputItem[];

      if (input.wordId) {
        total = await prisma.vocabularyWord.count({
          where: {
            categoryId: input.categoryId,
          },
        });

        correctUnique = await prisma.userLearningAnswer.groupBy({
          by: ["wordId"],
          _count: {
            _all: true,
          },
          where: {
            userId: user.user.id,
            isCorrect: true,
            processId: progress.progressId,
            wordId: { not: null },
          },
        }) as unknown as UserLearningAnswerGroupByOutputItem[];
      } else {
        // For grammar
        total = await prisma.grammarContent.count({
          where: {
            categoryId: input.categoryId,
          },
        });

        correctUnique = await prisma.userLearningAnswer.groupBy({
          by: ["grammarId"],
          _count: {
            _all: true,
          },
          where: {
            userId: user.user.id,
            isCorrect: true,
            processId: progress.progressId,
            grammarId: { not: null },
          },
        }) as unknown as UserLearningAnswerGroupByOutputItem[];
      }

      const correctCount = correctUnique.length;
      const percentage = (correctCount / total) * 100;

      await prisma.userProgress.update({
        where: {
          progressId: progress.progressId,
        },
        data: {
          processPercentage: percentage,
          lastPracticed: new Date(),
        },
      });
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
      }
      // if user already registered, return
      const userCategory = await prisma.userProgress.findFirst({
        where: {
          userId: user.user.id,
          categoryId: input.categoryId,
          contentType: input.contentType,
        },
      });
      if (userCategory) {
        return;
      }
      await prisma.userProgress.create({
        data: {
          userId: user.user.id,
          categoryId: input.categoryId,
          processPercentage: 0,
          contentType: input.contentType,
        },
      });
    }),
});

export default userProcessRouter;
