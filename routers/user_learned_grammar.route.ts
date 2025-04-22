import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import { paginationRequestSchema } from "@/schema/pagination";
import prisma from "@/lib/prismaClient";

// Define types for the models that aren't recognized yet
type UserLearningAnswerGroupByOutputItem = {
  wordId?: number | null;
  grammarId?: number | null;
  _count: {
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

type UserReviewGrammarItem = {
  id: number;
  userId: string;
  grammarId: number;
  addedAt: Date;
  grammar: any; // GrammarContent type
};

const userLearnedGrammarRouter = createTRPCRouter({
  getLearnedGrammar: baseProcedure
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
            grammars: [],
            total: 0,
          };
        }

        // Find user's grammar progress
        const processesQuery = {
          userId: user.user.id,
          contentType: "grammar",
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
            grammars: [],
            total: 0,
          };
        }

        // Find grammarIds with correct answers
        const learnedGrammarIds = await prisma.userLearningAnswer.groupBy({
          by: ["grammarId"],
          where: {
            userId: user.user.id,
            isCorrect: true,
            processId: { in: processIds },
            grammarId: { not: null },
          },
          _count: {
            grammarId: true,
          },
        });

        if (learnedGrammarIds.length === 0) {
          return {
            grammars: [],
            total: 0,
          };
        }

        // Get paginated list of learned grammar
        const grammars = await prisma.grammarContent.findMany({
          where: {
            contentId: {
              in: learnedGrammarIds.map(
                (g: UserLearningAnswerGroupByOutputItem) => g.grammarId!
              ),
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
            contentId: "desc",
          },
        });

        // Get statistics for each grammar point
        const grammarStats = await Promise.all(
          grammars.map(async (grammar) => {
            const correctCount = await prisma.userLearningAnswer.count({
              where: {
                userId: user.user.id,
                grammarId: grammar.contentId,
                isCorrect: true,
              },
            });

            const incorrectCount = await prisma.userLearningAnswer.count({
              where: {
                userId: user.user.id,
                grammarId: grammar.contentId,
                isCorrect: false,
              },
            });

            const lastAnswered = await prisma.userLearningAnswer.findFirst({
              where: {
                userId: user.user.id,
                grammarId: grammar.contentId,
              },
              orderBy: {
                createdAt: "desc",
              },
              select: {
                createdAt: true,
              },
            });

            return {
              ...grammar,
              stats: {
                correctCount,
                incorrectCount,
                lastAnswered: lastAnswered?.createdAt,
              },
            };
          })
        );

        return {
          grammars: grammarStats,
          total: learnedGrammarIds.length,
        };
      } catch (error) {
        console.error("Error getting learned grammar:", error);
        return {
          grammars: [],
          total: 0,
        };
      }
    }),

  getLearnedGrammarStats: baseProcedure.query(async ({ ctx }) => {
    try {
      const user = await getCurrentUser();
      if (!user || !user.user || !user.user.id) {
        return {
          totalLearnedGrammars: 0,
          totalCategories: 0,
          categoriesStats: [],
        };
      }

      // Find all user grammar progress
      const processes = (await prisma.userProgress.findMany({
        where: {
          userId: user.user.id,
          contentType: "grammar",
        },
        include: {
          category: true,
        },
      })) as unknown as UserProgressWithCategory[];

      if (processes.length === 0) {
        return {
          totalLearnedGrammars: 0,
          totalCategories: 0,
          categoriesStats: [],
        };
      }

      const processIds = processes.map((p) => p.progressId);

      // Count unique learned grammar points
      const learnedGrammarIds = await prisma.userLearningAnswer.groupBy({
        by: ["grammarId"],
        where: {
          userId: user.user.id,
          isCorrect: true,
          processId: { in: processIds },
          grammarId: { not: null },
        },
        _count: {
          grammarId: true,
        },
      });

      // Get statistics by category
      const categoriesStats = await Promise.all(
        processes.map(async (process) => {
          if (!process.category) return null;

          // Count learned grammar in this category
          const learnedInCategory = await prisma.userLearningAnswer.groupBy({
            by: ["grammarId"],
            where: {
              userId: user.user.id,
              isCorrect: true,
              processId: process.progressId,
              grammarId: { not: null },
            },
            _count: {
              grammarId: true,
            },
          });

          return {
            categoryId: process.category.categoryId,
            categoryName: process.category.categoryName,
            totalGrammars: process.category.totalGrammar,
            learnedGrammars: learnedInCategory.length,
            progress: process.processPercentage,
          };
        })
      );

      return {
        totalLearnedGrammars: learnedGrammarIds.length,
        totalCategories: processes.filter((p) => p.category).length,
        categoriesStats: categoriesStats.filter((c) => c !== null),
      };
    } catch (error) {
      console.error("Error getting learned grammar stats:", error);
      return {
        totalLearnedGrammars: 0,
        totalCategories: 0,
        categoriesStats: [],
      };
    }
  }),

  addToReview: baseProcedure
    .input(
      z.object({
        grammarId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Check if grammar is already in review list
        const existingEntry = await prisma.userReviewGrammar.findFirst({
          where: {
            userId: user.user.id,
            grammarId: input.grammarId,
          },
        });

        if (existingEntry) {
          // If exists, update the added time
          return await prisma.userReviewGrammar.update({
            where: {
              id: existingEntry.id,
            },
            data: {
              addedAt: new Date(),
            },
          });
        } else {
          // If not, create new entry
          return await prisma.userReviewGrammar.create({
            data: {
              userId: user.user.id,
              grammarId: input.grammarId,
              addedAt: new Date(),
            },
          });
        }
      } catch (error) {
        console.error("Error adding grammar to review:", error);
        throw new Error("Failed to add grammar to review list");
      }
    }),

  removeFromReview: baseProcedure
    .input(
      z.object({
        grammarId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.user || !user.user.id) {
          throw new Error("Unauthorized");
        }

        // Remove grammar from review list
        return await prisma.userReviewGrammar.deleteMany({
          where: {
            userId: user.user.id,
            grammarId: input.grammarId,
          },
        });
      } catch (error) {
        console.error("Error removing grammar from review:", error);
        throw new Error("Failed to remove grammar from review list");
      }
    }),

  getReviewGrammars: baseProcedure
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
            grammars: [],
            total: 0,
          };
        }

        // Find grammar points in review list
        const reviewQuery = {
          userId: user.user.id,
          ...(input.categoryId
            ? {
                grammar: {
                  categoryId: input.categoryId,
                },
              }
            : {}),
        };

        // Count total grammar points in review list
        const total = await prisma.userReviewGrammar.count({
          where: reviewQuery,
        });

        // Get paginated list of grammar points
        const reviewGrammars = await prisma.userReviewGrammar.findMany({
          where: reviewQuery,
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          include: {
            grammar: {
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
          grammars: reviewGrammars.map((rg: any) => ({
            ...rg.grammar,
            addedToReviewAt: rg.addedAt,
          })),
          total,
        };
      } catch (error) {
        console.error("Error getting review grammars:", error);
        return {
          grammars: [],
          total: 0,
        };
      }
    }),
});

export default userLearnedGrammarRouter;
