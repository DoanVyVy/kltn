import { createTRPCRouter } from "./init";
import userProcessRouter from "./user_process.route";
import vocabularyCategoryRouter from "./vocabulary_category.route";
export const appRouter = createTRPCRouter({
	vocabularyCategory: vocabularyCategoryRouter,
	userProcess: userProcessRouter,
});
export type AppRouter = typeof appRouter;
