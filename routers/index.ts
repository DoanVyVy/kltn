import { createTRPCRouter } from "./init";
import userProcessRouter from "./user_process.route";
import vocabularyCategoryRouter from "./vocabulary_category.route";
import vocabularyWordRouter from "./vocabulary_word.route";
export const appRouter = createTRPCRouter({
	vocabularyCategory: vocabularyCategoryRouter,
	userProcess: userProcessRouter,
	vocabulary: vocabularyWordRouter,
});
export type AppRouter = typeof appRouter;
