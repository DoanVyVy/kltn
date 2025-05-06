import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import z from "zod";

const categoryRouter = createTRPCRouter({
  getCategoryById: baseProcedure
    .input(z.number())
    .query(async ({ ctx: { db }, input }) => {
      const category = await db.category.findUnique({
        where: {
          categoryId: input,
        },
        include: {
          vocabularyWords: {
            orderBy: {
              wordId: "asc",
            },
          },
        },
      });
      return category;
    }),
  getRandomWords: baseProcedure
    .input(
      z.object({
        categoryId: z.number(),
        size: z.number().optional().default(4),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      const words = await db.vocabularyWord.findMany({
        where: {
          categoryId: input.categoryId,
        },
        take: input.size,
      });
      return words;
    }),
  getCategories: baseProcedure
    .input(
      paginationRequestSchema.extend({
        orderBy: z.enum(["name", "categoryId"]).optional(),
        orderDir: z.enum(["asc", "desc"]).optional(),
        isVocabularyCourse: z.boolean().optional(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      return await db.category.findMany({
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        where: {},
        orderBy: {
          [input.orderBy || "categoryId"]: input.orderDir || "desc",
        },
      });
    }),

  getValidCategories: baseProcedure
    .input(
      z
        .object({
          isVocabularyCourse: z.boolean().optional(),
          status: z.enum(["active", "inactive"]).optional().default("active"),
        })
        .optional()
    )
    .query(async ({ ctx: { db }, input }) => {
      return await db.category.findMany({
        where: {
          status: input?.status || "active",
          ...(input?.isVocabularyCourse !== undefined && {
            isVocabularyCourse: input.isVocabularyCourse,
          }),
        },
        orderBy: {
          orderIndex: "asc",
        },
      });
    }),
  create: baseProcedure
    .input(
      z.object({
        categoryName: z.string(),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        difficultyLevel: z.number().optional(),
        orderIndex: z.number().optional(),
        isVocabularyCourse: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.create({
        data: {
          categoryName: input.categoryName,
          description: input.description,
          difficultyLevel: input.difficultyLevel || 1,
          orderIndex: input.orderIndex,
          totalWords: input.isVocabularyCourse ? 10 : 0, // Giá trị mặc định cho từ vựng
          totalGrammar: !input.isVocabularyCourse ? 5 : 0, // Giá trị mặc định cho ngữ pháp
          status: "active",
          isVocabularyCourse: input.isVocabularyCourse,
        },
      });
    }),
  update: baseProcedure
    .input(
      z.object({
        categoryId: z.number(),
        categoryName: z.string(),
        description: z.string().optional(),
        iconUrl: z.string().optional(),
        difficultyLevel: z.number().optional(),
        orderIndex: z.number().optional(),
        isVocabularyCourse: z.boolean().optional(),
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
          ...(input.isVocabularyCourse !== undefined && {
            isVocabularyCourse: input.isVocabularyCourse,
          }),
        },
      });
    }),
  delete: baseProcedure
    .input(z.number())
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.delete({
        where: {
          categoryId: input,
        },
      });
    }),
});

export default categoryRouter;
