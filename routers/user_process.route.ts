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

      // recalculate progress
      let total;
      let correctUnique: UserLearningAnswerGroupByOutputItem[];

      if (input.wordId) {
        // For vocabulary
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
