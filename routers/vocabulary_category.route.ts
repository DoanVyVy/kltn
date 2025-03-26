import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import z from "zod";
import { createCategorySchema } from "@/schema/category";

const categoryRouter = createTRPCRouter({
  getCategoryById: baseProcedure
    .input(z.number())
    .query(async ({ ctx: { db }, input }) => {
      const category = await db.category.findUnique({
        where: {
          categoryId: input,
        },
      });

      return category;
    }),
  getRandomWords: baseProcedure
    .input(
      z.object({
        take: z.number().optional().default(5),
        categoryId: z.number(),
      })
    )
    .query(async ({ ctx: { db }, input }) => {
      return await db.vocabularyWord.findMany({
        where: {
          categoryId: input.categoryId,
        },
        take: input.take,
      });
    }),
  getValidCategories: baseProcedure
    .input(
      paginationRequestSchema
        .extend({
          status: z.string().nullish(),
          contentType: z.string().nullish(),
        })
        .nullish()
    )
    .query(async ({ ctx: { db }, input }) => {
      const page = input || { page: 1, limit: 1000000 };
      return await db.category.findMany({
        skip: (page.page - 1) * page.limit,
        take: page.limit,
        where: {
          ...(input?.search && {
            OR: [
              {
                categoryName: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: input.search,
                  mode: "insensitive",
                },
              },
            ],
          }),
          ...(input?.status && {
            status: input.status,
          }),
          ...(input?.contentType && {
            contentType: input.contentType,
          }),
        },
        orderBy: {
          orderIndex: "asc",
        },
      });
    }),
  create: baseProcedure
    .input(
      createCategorySchema.extend({
        contentType: z.string().optional().default("vocabulary"),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.create({
        data: {
          categoryName: input.title,
          description: input.description,
          status: input.status,
          difficultyLevel: input.difficulty,
          totalWords: 0,
        },
      });
    }),
  update: baseProcedure
    .input(
      createCategorySchema.extend({
        categoryId: z.number(),
        contentType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      return await db.category.update({
        where: {
          categoryId: input.categoryId,
        },
        data: {
          categoryName: input.title,
          description: input.description,
          status: input.status,
          difficultyLevel: input.difficulty,
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
