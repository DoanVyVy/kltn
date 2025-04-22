import { createTRPCRouter } from "./init";
import vocabularyCategoryRouter from "./vocabulary_category.route";
import vocabularyWordRouter from "./vocabulary_word.route";
import categoryRouter from "./category.route";
import grammarTopicRouter from "./grammar_topic.route";
import grammarContentRouter from "./grammar_content.route";
import userRouter from "./user.route";
import userProcessRouter from "./user_process.route";
import userLearnedWordsRouter from "./user_learned_words.route";
import { userReviewWordsRouter } from "./user_review_words.route";
import userLearnedGrammarRouter from "./user_learned_grammar.route";
import authRouter from "./auth.route";
import leaderboardRouter from "./leaderboard.route";
import achievementRouter from "./achievement.route";

export const appRouter = createTRPCRouter({
  category: categoryRouter,
  vocabularyCategory: vocabularyCategoryRouter,
  vocabularyWord: vocabularyWordRouter,
  grammarTopic: grammarTopicRouter,
  grammarContent: grammarContentRouter,
  user: userRouter,
  userProcess: userProcessRouter,
  userLearnedWords: userLearnedWordsRouter,
  userReviewWords: userReviewWordsRouter,
  userLearnedGrammar: userLearnedGrammarRouter,
  auth: authRouter,
  leaderboard: leaderboardRouter,
  achievement: achievementRouter,
});

export type AppRouter = typeof appRouter;
