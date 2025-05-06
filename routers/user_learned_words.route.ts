import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import { paginationRequestSchema } from "@/schema/pagination";
import prisma from "@/lib/prismaClient";

// Define types for the models that aren't recognized yet
type UserLearningAnswerGroupByOutputItem = {
  wordId: number | null;
  grammarId: number | null;
  _count?: {
    wordId?: number;
    grammarId?: number;
  };
};

type UserProgressWithCategory = {
  progressId: number;
  userId: string;
  categoryId: number | null;
  masteryLevel: any; // Decimal
  timesPracticed: number;
  lastPracticed: Date | null;
  nextReviewDate: Date | null;
  processPercentage: number;
  category?: {
    categoryId: number;
    categoryName: string;
    totalWords: number;
    totalGrammar: number;
  };
};

const userLearnedWordsRouter = createTRPCRouter({
  getLearnedWords: baseProcedure
    .input(
      paginationRequestSchema.extend({
        categoryId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          return {
            words: [],
            total: 0,
          };
        }

        // Tìm các processId của user (để lọc theo khóa học nếu cần)
        const processesQuery = {
          userId: user.user.id,
          contentType: "vocabulary",
          ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        };

        const processes = await prisma.userProgress.findMany({
          where: processesQuery,
          select: {
            progressId: true,
            categoryId: true,
          },
        });

        const processIds = processes.map((p) => p.progressId);

        if (processIds.length === 0) {
          return {
            words: [],
            total: 0,
          };
        }

        // Find learned wordIds with correct answers
        const learnedWordIds = await prisma.userLearningAnswer.groupBy({
          by: ["wordId"],
          where: {
            userId: user.user.id,
            isCorrect: true,
            processId: { in: processIds },
            wordId: { not: null },
          },
          _count: {
            wordId: true,
          },
        });

        if (learnedWordIds.length === 0) {
          return {
            words: [],
            total: 0,
          };
        }

        // Lấy danh sách các từ đã thuộc với phân trang
        const words = await prisma.vocabularyWord.findMany({
          where: {
            wordId: {
              in: learnedWordIds.map((w) => w.wordId!),
            },
          },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            category: {
              select: {
                categoryName: true,
              },
            },
          },
          orderBy: {
            wordId: "desc",
          },
        });

        // Get correct and incorrect counts for each word
        const wordStats = await Promise.all(
          words.map(async (word) => {
            const correctCount = await prisma.userLearningAnswer.count({
              where: {
                userId: user.user.id,
                wordId: word.wordId,
                isCorrect: true,
              },
            });

            const incorrectCount = await prisma.userLearningAnswer.count({
              where: {
                userId: user.user.id,
                wordId: word.wordId,
                isCorrect: false,
              },
            });

            const lastAnswered = await prisma.userLearningAnswer.findFirst({
              where: {
                userId: user.user.id,
                wordId: word.wordId,
              },
              orderBy: {
                createdAt: "desc",
              },
              select: {
                createdAt: true,
              },
            });

            return {
              ...word,
              stats: {
                correctCount,
                incorrectCount,
                lastAnswered: lastAnswered?.createdAt,
              },
            };
          })
        );

        return {
          words: wordStats,
          total: learnedWordIds.length,
        };
      } catch (error) {
        console.error("Error getting learned words:", error);
        return {
          words: [],
          total: 0,
        };
      }
    }),

  getLearnedWordsStats: baseProcedure.query(async ({ ctx }) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.user || !user.user.id) {
        return {
          totalLearnedWords: 0,
          totalCategories: 0,
          categoriesStats: [],
        };
      }

      // Tìm tất cả các tiến trình của người dùng
      const processes = (await prisma.userProgress.findMany({
        where: {
          userId: user.user.id,
          contentType: "vocabulary",
        },
        include: {
          category: true,
        },
      })) as unknown as UserProgressWithCategory[];

      if (processes.length === 0) {
        return {
          totalLearnedWords: 0,
          totalCategories: 0,
          categoriesStats: [],
        };
      }

      const processIds = processes.map((p) => p.progressId);

      // Count total learned words (unique wordIds with isCorrect = true)
      const learnedWordIds = await prisma.userLearningAnswer.groupBy({
        by: ["wordId"],
        where: {
          userId: user.user.id,
          isCorrect: true,
          processId: { in: processIds },
          wordId: { not: null },
        },
        _count: {
          wordId: true,
        },
      });

      // Thống kê theo từng danh mục
      const categoriesStats = await Promise.all(
        processes.map(async (process) => {
          if (!process.category) return null;

          // Count learned words in this category
          const learnedInCategory = await prisma.userLearningAnswer.groupBy({
            by: ["wordId"],
            where: {
              userId: user.user.id,
              isCorrect: true,
              processId: process.progressId,
              wordId: { not: null },
            },
            _count: {
              wordId: true,
            },
          });

          return {
            categoryId: process.category.categoryId,
            categoryName: process.category.categoryName,
            totalWords: process.category.totalWords,
            learnedWords: learnedInCategory.length,
            progress: process.processPercentage,
          };
        })
      );

      return {
        totalLearnedWords: learnedWordIds.length,
        totalCategories: processes.filter((p) => p.category).length,
        categoriesStats: categoriesStats.filter((c) => c !== null),
      };
    } catch (error) {
      console.error("Error getting learned words stats:", error);
      return {
        totalLearnedWords: 0,
        totalCategories: 0,
        categoriesStats: [],
      };
    }
  }),

  addToReview: baseProcedure
    .input(
      z.object({
        wordId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Kiểm tra xem từ đã có trong danh sách ôn tập chưa
        const existingEntry = await prisma.userReviewWord.findFirst({
          where: {
            userId: user.user.id,
            wordId: input.wordId,
          },
        });

        if (existingEntry) {
          // Nếu đã có, cập nhật thời gian thêm
          return await prisma.userReviewWord.update({
            where: {
              id: existingEntry.id,
            },
            data: {
              addedAt: new Date(),
            },
          });
        } else {
          // Nếu chưa có, thêm mới
          return await prisma.userReviewWord.create({
            data: {
              userId: user.user.id,
              wordId: input.wordId,
              addedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error("Error adding word to review:", error);
        throw new Error("Failed to add word to review list");
      }
    }),

  removeFromReview: baseProcedure
    .input(
      z.object({
        wordId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Xóa từ khỏi danh sách ôn tập
        return await prisma.userReviewWord.deleteMany({
          where: {
            userId: user.user.id,
            wordId: input.wordId,
          },
        });
      } catch (error) {
        console.error("Error removing word from review:", error);
        throw new Error("Failed to remove word from review list");
      }
    }),

  getReviewWords: baseProcedure
    .input(
      paginationRequestSchema.extend({
        categoryId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          return {
            words: [],
            total: 0,
          };
        }

        // Tìm các từ trong danh sách ôn tập
        const reviewQuery = {
          userId: user.user.id,
          ...(input.categoryId
            ? {
                word: {
                  categoryId: input.categoryId,
                },
              }
            : {}),
        };

        // Đếm tổng số từ trong danh sách ôn tập
        const total = await prisma.userReviewWord.count({
          where: reviewQuery,
        });

        // Lấy danh sách các từ với phân trang
        const reviewWords = await prisma.userReviewWord.findMany({
          where: reviewQuery,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            word: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            addedAt: "desc",
          },
        });

        return {
          words: reviewWords.map((rw) => ({
            ...rw.word,
            addedToReviewAt: rw.addedAt,
          })),
          total,
        };
      } catch (error) {
        console.error("Error getting review words:", error);
        return {
          words: [],
          total: 0,
        };
      }
    }),
});

export default userLearnedWordsRouter;
