import { getCurrentUser } from "@/lib/server-auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";

export const userReviewGrammarsRouter = createTRPCRouter({
  // Thêm ngữ pháp vào danh sách cần ôn tập
  addToReview: baseProcedure
    .input(
      z.object({
        grammarId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      // Kiểm tra xem ngữ pháp đã được thêm vào danh sách chưa
      const existingReview = await db.userReviewGrammar.findFirst({
        where: {
          userId: user.user.id,
          grammarId: input.grammarId,
        },
      });

      if (existingReview) {
        throw new Error("Ngữ pháp đã có trong danh sách ôn tập");
      }

      // Thêm ngữ pháp vào danh sách cần ôn tập
      const reviewGrammar = await db.userReviewGrammar.create({
        data: {
          userId: user.user.id,
          grammarId: input.grammarId,
          addedAt: new Date(),
        },
      });

      return reviewGrammar;
    }),

  // Lấy danh sách ngữ pháp cần ôn tập
  getReviewGrammars: baseProcedure
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
            grammars: [],
            total: 0,
          };
        }

        const skip = (input.page - 1) * input.limit;

        // Lấy danh sách ngữ pháp cần ôn tập
        const reviewGrammars = await db.userReviewGrammar.findMany({
          where: {
            userId: user.user.id,
          },
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
          skip,
          take: input.limit,
        });

        // Đếm tổng số ngữ pháp cần ôn tập
        const total = await db.userReviewGrammar.count({
          where: {
            userId: user.user.id,
          },
        });

        return {
          grammars: reviewGrammars.map((review) => ({
            contentId: review.grammar.contentId,
            title: review.grammar.title,
            explanation: review.grammar.explanation,
            examples: review.grammar.examples,
            categoryId: review.grammar.categoryId,
            category: review.grammar.category,
            addedAt: review.addedAt,
          })),
          total,
        };
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ngữ pháp cần ôn tập:", error);
        // Trả về danh sách rỗng thay vì lỗi
        return {
          grammars: [],
          total: 0,
        };
      }
    }),

  // Xóa ngữ pháp khỏi danh sách cần ôn tập
  removeFromReview: baseProcedure
    .input(
      z.object({
        grammarId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Unauthorized");
      }

      const deletedReview = await db.userReviewGrammar.deleteMany({
        where: {
          userId: user.user.id,
          grammarId: input.grammarId,
        },
      });

      return deletedReview;
    }),
});
