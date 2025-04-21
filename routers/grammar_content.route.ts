import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import z from "zod";

export const createGrammarContentSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  categoryId: z.number(),
  explanation: z.string().min(1, "Giải thích là bắt buộc"),
  examples: z.string().optional(),
  notes: z.string().optional(),
  orderIndex: z.number().optional(),
});

const grammarContentRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(
      paginationRequestSchema.extend({
        categoryId: z.number().nullish(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      try {
        console.log("API Input:", JSON.stringify(input, null, 2));

        // Tạo điều kiện where hợp lệ với Prisma
        let whereCondition: any = {};

        // Nếu có categoryId, thêm vào điều kiện where
        if (input.categoryId !== undefined && input.categoryId !== null) {
          whereCondition.categoryId = input.categoryId;
          console.log(`Đang lọc theo khóa học ID: ${input.categoryId}`);
        }

        // Nếu có từ khóa tìm kiếm, thêm vào điều kiện where
        if (input.search && input.search.trim() !== "") {
          whereCondition.OR = [
            {
              title: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
            {
              explanation: {
                contains: input.search,
                mode: "insensitive" as const,
              },
            },
          ];
        }

        console.log(
          "Where condition:",
          JSON.stringify(whereCondition, null, 2)
        );

        // Đếm tổng số bản ghi thỏa mãn điều kiện
        const totalCount = await db.grammarContent.count({
          where: whereCondition,
        });

        console.log(`Tổng số bản ghi thỏa mãn: ${totalCount}`);

        // Lấy dữ liệu với phân trang
        const grammarContents = await db.grammarContent.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          where: whereCondition,
          include: {
            category: {
              select: {
                categoryId: true,
                categoryName: true,
                description: true,
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        });

        console.log(`Số bản ghi trả về: ${grammarContents.length}`);
        return grammarContents;
      } catch (error) {
        console.error("Error fetching grammar content:", error);
        // Log chi tiết lỗi
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        return [];
      }
    }),

  getById: baseProcedure
    .input(z.number())
    .query(async ({ ctx: { db }, input }) => {
      try {
        return await db.grammarContent.findUnique({
          where: {
            contentId: input,
          },
          include: {
            category: {
              select: {
                categoryId: true,
                categoryName: true,
                description: true,
              },
            },
          },
        });
      } catch (error) {
        console.error("Error fetching grammar content by ID:", error);
        return null;
      }
    }),

  create: baseProcedure
    .input(createGrammarContentSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        // Kiểm tra category có tồn tại không trước khi tạo mới
        const category = await db.category.findUnique({
          where: { categoryId: input.categoryId },
        });

        if (!category) {
          throw new Error(
            "Khóa học không tồn tại. Vui lòng chọn khóa học hợp lệ."
          );
        }

        const grammarContent = await db.grammarContent.create({
          data: {
            title: input.title,
            categoryId: input.categoryId,
            explanation: input.explanation,
            examples: input.examples,
            notes: input.notes,
            orderIndex: input.orderIndex,
          },
        });

        // Cập nhật totalGrammar trong category
        await db.category.update({
          where: { categoryId: input.categoryId },
          data: {
            totalGrammar: {
              increment: 1,
            },
          },
        });

        return grammarContent;
      } catch (error) {
        throw error;
      }
    }),

  update: baseProcedure
    .input(
      createGrammarContentSchema.extend({
        contentId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        // Kiểm tra category có tồn tại không trước khi cập nhật
        const category = await db.category.findUnique({
          where: { categoryId: input.categoryId },
        });

        if (!category) {
          throw new Error(
            "Khóa học không tồn tại. Vui lòng chọn khóa học hợp lệ."
          );
        }

        // Lấy thông tin cũ để kiểm tra categoryId có thay đổi không
        const oldContent = await db.grammarContent.findUnique({
          where: { contentId: input.contentId },
        });

        if (!oldContent) {
          throw new Error("Nội dung ngữ pháp không tồn tại.");
        }

        // Nếu categoryId thay đổi, cập nhật totalGrammar ở cả category cũ và mới
        if (oldContent.categoryId !== input.categoryId) {
          // Giảm totalGrammar ở category cũ
          await db.category.update({
            where: { categoryId: oldContent.categoryId },
            data: {
              totalGrammar: {
                decrement: 1,
              },
            },
          });

          // Tăng totalGrammar ở category mới
          await db.category.update({
            where: { categoryId: input.categoryId },
            data: {
              totalGrammar: {
                increment: 1,
              },
            },
          });
        }

        return await db.grammarContent.update({
          where: {
            contentId: input.contentId,
          },
          data: {
            title: input.title,
            categoryId: input.categoryId,
            explanation: input.explanation,
            examples: input.examples,
            notes: input.notes,
            orderIndex: input.orderIndex,
          },
        });
      } catch (error) {
        throw error;
      }
    }),

  delete: baseProcedure
    .input(z.number())
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        // Lấy thông tin grammar content trước khi xóa
        const grammarContent = await db.grammarContent.findUnique({
          where: { contentId: input },
        });

        if (!grammarContent) {
          throw new Error("Nội dung ngữ pháp không tồn tại.");
        }

        // Xóa grammar content
        const result = await db.grammarContent.delete({
          where: {
            contentId: input,
          },
        });

        // Cập nhật totalGrammar trong category
        await db.category.update({
          where: { categoryId: grammarContent.categoryId },
          data: {
            totalGrammar: {
              decrement: 1,
            },
          },
        });

        return result;
      } catch (error) {
        throw error;
      }
    }),
});

export type GrammarContentListElement = Awaited<
  ReturnType<(typeof grammarContentRouter)["getAll"]>
>[0];

export default grammarContentRouter;
