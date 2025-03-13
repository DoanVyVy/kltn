import { baseProcedure, createTRPCRouter } from "./init";
import z from "zod";

const vocabularyCategoryRouter = createTRPCRouter({
	getVocabularyCategoryById: baseProcedure
		.input(z.number())
		.query(async ({ ctx: { db }, input }) => {
			const category = await db.vocabularyCategory.findUnique({
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
	getValidCategories: baseProcedure.query(async ({ ctx: { db } }) => {
		return await db.vocabularyCategory.findMany({});
	}),
});

export default vocabularyCategoryRouter;
