import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import z from "zod";

export const createGrammarCategorySchema = z.object({
  categoryName: z.string().min(1, "Tên khóa học là bắt buộc"),
  description: z.string().optional(),
  difficultyLevel: z.number().default(1),
  orderIndex: z.number().optional(),
});

const grammarCategoryRouter = createTRPCRouter({
  getAllCategories: baseProcedure.query(async ({ ctx: { db } }) => {
    return await db.category.findMany({
      orderBy: {
        orderIndex: "asc",
      },
    });
  }),

  getCategoryById: baseProcedure
    .input(z.number())
    .query(async ({ ctx: { db }, input }) => {
      return await db.category.findUnique({
        where: {
          categoryId: input,
        },
        include: {
          grammarContents: {
            orderBy: {
              orderIndex: "asc",
            },
          },
        },
      });
    }),

  createCategory: baseProcedure
    .input(createGrammarCategorySchema)
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.create({
        data: {
          categoryName: input.categoryName,
          description: input.description,
          difficultyLevel: input.difficultyLevel,
          orderIndex: input.orderIndex,
          totalGrammar: 0,
          totalWords: 0,
          status: "active",
        },
      });
    }),

  updateCategory: baseProcedure
    .input(
      createGrammarCategorySchema.extend({
        categoryId: z.number(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.update({
        where: {
          categoryId: input.categoryId,
        },
        data: {
          categoryName: input.categoryName,
          description: input.description,
          difficultyLevel: input.difficultyLevel,
          orderIndex: input.orderIndex,
        },
      });
    }),

  deleteCategory: baseProcedure
    .input(z.number())
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.delete({
        where: {
          categoryId: input,
        },
      });
    }),
});

export type GrammarCategoryListElement = Awaited<
  ReturnType<(typeof grammarCategoryRouter)["getAllCategories"]>
>[0];

export default grammarCategoryRouter;
