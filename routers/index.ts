import { createTRPCRouter } from "./init";
import userProcessRouter from "./user_process.route";
import categoryRouter from "./category.route";
import vocabularyWordRouter from "./vocabulary_word.route";
import grammarContentRouter from "./grammar_content.route";
import userLearnedWordsRouter from "./user_learned_words.route";

export const appRouter = createTRPCRouter({
  category: categoryRouter,
  userProcess: userProcessRouter,
  vocabulary: vocabularyWordRouter,
  grammarContent: grammarContentRouter,
  userLearnedWords: userLearnedWordsRouter,
});

export type AppRouter = typeof appRouter;
