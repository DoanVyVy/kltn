import { paginationRequestSchema } from "@/schema/pagination";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";
import { createVocabularySchema } from "@/schema/vocabulary";

const vocabularyWordRouter = createTRPCRouter({
	getAll: baseProcedure
		.input(
			paginationRequestSchema.extend({ categoryId: z.number().nullish() })
		)
		.query(async ({ ctx: { db }, input }) => {
			return db.vocabularyWord.findMany({
				skip: (input.page - 1) * input.limit,
				take: input.limit,
				where: {
					...(input.search && {
						word: {
							contains: input.search,
							mode: "insensitive",
						},
						definition: {
							contains: input.search,
							mode: "insensitive",
						},
					}),
					...(input.categoryId && {
						categoryId: input.categoryId,
					}),
				},
				include: {
					category: true,
				},
				orderBy: {
					wordId: "desc",
				},
			});
		}),
	getById: baseProcedure
		.input(z.number())
		.query(async ({ ctx: { db }, input }) => {
			return await db.vocabularyWord.findUnique({
				where: {
					wordId: input,
				},
			});
		}),

	create: baseProcedure
		.input(createVocabularySchema)
		.mutation(async ({ ctx: { db }, input }) => {
			const data = await db.vocabularyWord.create({
				data: {
					definition: input.definitions?.[0]?.definition,
					categoryId: input.categoryId,
					word: input.word,
					audioUrl: input.audioUrl,
					partOfSpeech: input.definitions?.[0]?.type,
					exampleSentence: input.definitions?.[0]?.example,
					pronunciation: input.phonetic,
				},
			});
			db.vocabularyCategory.update({
				where: {
					categoryId: input.categoryId,
				},
				data: {
					totalWords: {
						increment: 1,
					},
				},
			});
			return data;
		}),

	update: baseProcedure
		.input(
			createVocabularySchema.extend({
				wordId: z.number(),
			})
		)
		.mutation(async ({ ctx: { db }, input }) => {
			return await db.vocabularyWord.update({
				where: {
					wordId: input.wordId,
				},
				data: {
					definition: input.definitions?.[0]?.definition,
					categoryId: input.categoryId,
					word: input.word,
					audioUrl: input.audioUrl,
					partOfSpeech: input.definitions?.[0]?.type,
					exampleSentence: input.definitions?.[0]?.example,
					pronunciation: input.phonetic,
				},
			});
		}),
	delete: baseProcedure
		.input(z.number())
		.mutation(async ({ ctx: { db }, input }) => {
			return await db.vocabularyWord.delete({
				where: {
					wordId: input,
				},
			});
		}),
});
export type VocabularyWordListElement = Awaited<
	ReturnType<(typeof vocabularyWordRouter)["getAll"]>
>[0];
export default vocabularyWordRouter;
