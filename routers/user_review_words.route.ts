import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";

export const userReviewWordsRouter = createTRPCRouter({
  // Thêm từ vựng vào danh sách cần ôn tập
  addToReview: baseProcedure
    .input(
      z.object({
        wordId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Kiểm tra xem từ vựng đã được thêm vào danh sách chưa
      const existingReview = await db.userReviewWord.findFirst({
        where: {
          userId: user.user.id,
          wordId: input.wordId,
        },
      });

      if (existingReview) {
        throw new Error("Từ vựng đã có trong danh sách ôn tập");
      }

      // Thêm từ vựng vào danh sách cần ôn tập
      const reviewWord = await db.userReviewWord.create({
        data: {
          userId: user.user.id,
          wordId: input.wordId,
          addedAt: new Date(),
        },
      });

      return reviewWord;
    }),

  // Lấy danh sách từ vựng cần ôn tập
  getReviewWords: baseProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      try {
        const user = await getCurrentUser();

        if (!user || !user.user || !user.user.id) {
          // Nếu không có người dùng, trả về danh sách rỗng thay vì lỗi
          return {
            words: [],
            total: 0,
          };
        }

        const skip = (input.page - 1) * input.limit;

        // Lấy danh sách từ vựng cần ôn tập
        const reviewWords = await db.userReviewWord.findMany({
          where: {
            userId: user.user.id,
          },
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
          skip,
          take: input.limit,
        });

        // Đếm tổng số từ vựng cần ôn tập
        const total = await db.userReviewWord.count({
          where: {
            userId: user.user.id,
          },
        });

        return {
          words: reviewWords.map((review) => ({
            wordId: review.word.wordId,
            word: review.word.word,
            pronunciation: review.word.pronunciation,
            definition: review.word.definition,
            exampleSentence: review.word.exampleSentence,
            partOfSpeech: review.word.partOfSpeech,
            category: review.word.category,
            categoryId: review.word.categoryId,
            addedAt: review.addedAt,
          })),
          total,
        };
      } catch (error) {
        console.error("Lỗi khi lấy danh sách từ vựng cần ôn tập:", error);
        // Trả về danh sách rỗng thay vì lỗi
        return {
          words: [],
          total: 0,
        };
      }
    }),

  // Xóa từ vựng khỏi danh sách cần ôn tập
  removeFromReview: baseProcedure
    .input(
      z.object({
        wordId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      const deletedReview = await db.userReviewWord.deleteMany({
        where: {
          userId: user.user.id,
          wordId: input.wordId,
        },
      });

      return deletedReview;
    }),
});
