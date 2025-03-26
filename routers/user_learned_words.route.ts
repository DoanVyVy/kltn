import { getCurrentUser } from "@/lib/auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import { paginationRequestSchema } from "@/schema/pagination";

const userLearnedWordsRouter = createTRPCRouter({
  // Lấy danh sách các từ vựng đã thuộc (đã trả lời đúng ít nhất 1 lần)
  getLearnedWords: baseProcedure
    .input(
      paginationRequestSchema.extend({
        categoryId: z.number().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Tìm các processId của user (để lọc theo khóa học nếu cần)
      const processesQuery = {
        userId: user.user.id,
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      };

      const processes = await db.userProgress.findMany({
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

      // Tìm các từ vựng đã thuộc (trả lời đúng ít nhất 1 lần)
      const learnedWordIds = await db.userFlashCardAnswer.groupBy({
        by: ["wordId"],
        where: {
          userId: user.user.id,
          isCorrect: true,
          processId: {
            in: processIds,
          },
          ...(input.search
            ? {
                word: {
                  vocabularyWord: {
                    word: {
                      contains: input.search,
                      mode: "insensitive",
                    },
                  },
                },
              }
            : {}),
        },
      });

      if (learnedWordIds.length === 0) {
        return {
          words: [],
          total: 0,
        };
      }

      const wordIds = learnedWordIds.map((item) => item.wordId);

      // Đếm tổng số từ
      const total = wordIds.length;

      // Phân trang
      const page = input.page || 1;
      const limit = input.limit || 10;
      const skip = (page - 1) * limit;

      // Lấy chi tiết từ vựng
      const words = await db.vocabularyWord.findMany({
        where: {
          wordId: {
            in: wordIds,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          wordId: "desc",
        },
        skip,
        take: limit,
      });

      // Tính số lần trả lời đúng cho mỗi từ
      const wordStats = await Promise.all(
        words.map(async (word) => {
          const answers = await db.userFlashCardAnswer.findMany({
            where: {
              wordId: word.wordId,
              userId: user.user.id,
            },
          });

          const correctCount = answers.filter((a) => a.isCorrect).length;
          const incorrectCount = answers.length - correctCount;
          const lastAnswered = answers.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )[0]?.createdAt;

          return {
            ...word,
            stats: {
              correctCount,
              incorrectCount,
              totalAnswers: answers.length,
              lastAnswered,
            },
          };
        })
      );

      return {
        words: wordStats,
        total,
      };
    }),

  // Lấy thống kê tổng quan về từ vựng đã học
  getLearnedWordsStats: baseProcedure.query(async ({ ctx: { db } }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Tìm tất cả các tiến trình của người dùng
    const processes = await db.userProgress.findMany({
      where: {
        userId: user.user.id,
      },
      include: {
        category: true,
      },
    });

    if (processes.length === 0) {
      return {
        totalLearnedWords: 0,
        totalCategories: 0,
        categoriesStats: [],
      };
    }

    const processIds = processes.map((p) => p.progressId);

    // Đếm tổng số từ đã thuộc (unique wordIds với isCorrect = true)
    const learnedWordIds = await db.userFlashCardAnswer.groupBy({
      by: ["wordId"],
      where: {
        userId: user.user.id,
        isCorrect: true,
        processId: {
          in: processIds,
        },
      },
    });

    // Tính thống kê cho mỗi khóa học
    const categoriesStats = await Promise.all(
      processes.map(async (process) => {
        if (!process.category) return null;

        // Tổng số từ trong khóa học
        const totalWords = process.category.totalWords;

        // Số từ đã học trong khóa học
        const learnedWordsInCategory = await db.userFlashCardAnswer.groupBy({
          by: ["wordId"],
          where: {
            userId: user.user.id,
            isCorrect: true,
            processId: process.progressId,
          },
        });

        return {
          categoryId: process.category.categoryId,
          categoryName: process.category.categoryName,
          totalWords,
          learnedWords: learnedWordsInCategory.length,
          progress: process.processPercentage,
        };
      })
    );

    return {
      totalLearnedWords: learnedWordIds.length,
      totalCategories: processes.filter((p) => p.category).length,
      categoriesStats: categoriesStats.filter(Boolean),
    };
  }),
});

export default userLearnedWordsRouter;
