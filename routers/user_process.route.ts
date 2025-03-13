import { getCurrentUser } from "@/lib/auth";
import { baseProcedure, createTRPCRouter } from "./init";
import { z } from "zod";

const userProcessRouter = createTRPCRouter({
	getCategoryProcesses: baseProcedure.query(async ({ ctx: { db } }) => {
		const user = await getCurrentUser();
		if (!user) {
			throw new Error("Unauthorized");
		}
		return await db.userProgress.findMany({
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
				wordId: z.number(),
				correct: z.boolean(),
				categoryId: z.number(),
			})
		)
		.mutation(async ({ ctx: { db }, input }) => {
			const user = await getCurrentUser();
			if (!user) {
				throw new Error("Unauthorized");
			}
			// find user progress
			let progress = await db.userProgress.findFirst({
				where: {
					userId: user.user.id,
					categoryId: input.categoryId,
				},
			});
			if (!progress) {
				progress = await db.userProgress.create({
					data: {
						userId: user.user.id,
						categoryId: input.categoryId,
						processPercentage: 0,
					},
				});
			}
			await db.userFlashCardAnswer.create({
				data: {
					userId: user.user.id,
					wordId: input.wordId,
					isCorrect: input.correct,
					createdAt: new Date(),
					processId: progress.progressId,
				},
			});

			// recalculate progress
			const total = await db.vocabularyWord.count({
				where: {
					categoryId: input.categoryId,
				},
			});
			const correctUnique = await db.userFlashCardAnswer.groupBy({
				by: ["wordId"],
				_count: {
					wordId: true,
				},
				where: {
					userId: user.user.id,
					isCorrect: true,
					processId: progress.progressId,
				},
			});
			const correctCount = correctUnique.length;
			const percentage = (correctCount / total) * 100;
			await db.userProgress.update({
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
			})
		)
		.mutation(async ({ ctx: { db }, input }) => {
			const user = await getCurrentUser();
			if (!user) {
				throw new Error("Unauthorized");
			}
			// if user already registered, return
			const userCategory = await db.userProgress.findFirst({
				where: {
					userId: user.user.id,
					categoryId: input.categoryId,
				},
			});
			if (userCategory) {
				return;
			}
			await db.userProgress.create({
				data: {
					userId: user.user.id,
					categoryId: input.categoryId,
					processPercentage: 0,
				},
			});
		}),
});

export default userProcessRouter;
