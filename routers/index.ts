import { createTRPCRouter } from "./init";
import userProcessRouter from "./user_process.route";
import categoryRouter from "./category.route";
import vocabularyWordRouter from "./vocabulary_word.route";
import grammarContentRouter from "./grammar_content.route";
import userLearnedWordsRouter from "./user_learned_words.route";
import { userReviewWordsRouter } from "./user_review_words.route";
import userRouter from "./user.route";

export const appRouter = createTRPCRouter({
  userProcess: userProcessRouter,
  category: categoryRouter,
  vocabulary: vocabularyWordRouter,
  grammarContent: grammarContentRouter,
  userLearnedWords: userLearnedWordsRouter,
  userReviewWords: userReviewWordsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
