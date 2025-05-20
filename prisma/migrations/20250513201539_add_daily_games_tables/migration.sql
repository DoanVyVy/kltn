/*
  Warnings:

  - You are about to drop the column `attempt_number` on the `pronunciation_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `fluency` on the `pronunciation_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `phoneme_analysis` on the `pronunciation_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `prosody` on the `pronunciation_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `text_match` on the `pronunciation_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `wordAnalysis` on the `pronunciation_attempts` table. All the data in the column will be lost.
  - You are about to drop the column `focus_area` on the `pronunciation_content_sets` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `pronunciation_content_sets` table. All the data in the column will be lost.
  - You are about to drop the column `passing_threshold` on the `pronunciation_content_sets` table. All the data in the column will be lost.
  - You are about to drop the column `recommended_duration` on the `pronunciation_content_sets` table. All the data in the column will be lost.
  - You are about to drop the column `times_completed` on the `pronunciation_content_sets` table. All the data in the column will be lost.
  - You are about to drop the column `average_score` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the column `expected_phonemes` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the column `hints` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the column `ipa` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the column `success_rate` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the column `times_attempted` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the column `realistic_mode` on the `pronunciation_settings` table. All the data in the column will be lost.
  - You are about to drop the column `use_caching` on the `pronunciation_settings` table. All the data in the column will be lost.
  - You are about to drop the column `next_review_date` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `average_score` on the `user_pronunciation_progress` table. All the data in the column will be lost.
  - You are about to drop the column `mastered_at` on the `user_pronunciation_progress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."pronunciation_attempts" DROP COLUMN "attempt_number",
DROP COLUMN "fluency",
DROP COLUMN "phoneme_analysis",
DROP COLUMN "prosody",
DROP COLUMN "text_match",
DROP COLUMN "wordAnalysis",
ALTER COLUMN "feedback" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."pronunciation_content_sets" DROP COLUMN "focus_area",
DROP COLUMN "order",
DROP COLUMN "passing_threshold",
DROP COLUMN "recommended_duration",
DROP COLUMN "times_completed";

-- AlterTable
ALTER TABLE "public"."pronunciation_contents" DROP COLUMN "average_score",
DROP COLUMN "expected_phonemes",
DROP COLUMN "hints",
DROP COLUMN "ipa",
DROP COLUMN "success_rate",
DROP COLUMN "times_attempted";

-- AlterTable
ALTER TABLE "public"."pronunciation_settings" DROP COLUMN "realistic_mode",
DROP COLUMN "use_caching";

-- AlterTable
ALTER TABLE "public"."user_progress" DROP COLUMN "next_review_date",
ADD COLUMN     "nextReviewDate" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "public"."user_pronunciation_progress" DROP COLUMN "average_score",
DROP COLUMN "mastered_at";

-- CreateTable
CREATE TABLE "public"."daily_word_challenges" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "hint" TEXT,
    "definition" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "part_of_speech" TEXT,
    "image_url" TEXT,
    "example_sentence" TEXT,
    "active_date" DATE NOT NULL,

    CONSTRAINT "daily_word_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_word_challenge_attempts" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "user_guess" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_word_challenge_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_sentence_scrambles" (
    "id" SERIAL NOT NULL,
    "sentence" TEXT NOT NULL,
    "scrambled_sentence" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "translation" TEXT,
    "hint" TEXT,
    "active_date" DATE NOT NULL,

    CONSTRAINT "daily_sentence_scrambles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_sentence_scramble_attempts" (
    "id" SERIAL NOT NULL,
    "scramble_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "user_solution" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "time_taken" INTEGER,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_sentence_scramble_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_vocabulary_quizzes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "active_date" DATE NOT NULL,

    CONSTRAINT "daily_vocabulary_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_vocabulary_quiz_questions" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSON NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_vocabulary_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_vocabulary_quiz_attempts" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "answers" JSON NOT NULL,
    "score" INTEGER NOT NULL,
    "time_taken" INTEGER,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_vocabulary_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_grammar_challenges" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "grammar_point" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "active_date" DATE NOT NULL,

    CONSTRAINT "daily_grammar_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_grammar_questions" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "question_type" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSON,
    "correct_answer" TEXT NOT NULL,
    "explanation" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_grammar_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_grammar_challenge_attempts" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "answers" JSON NOT NULL,
    "score" INTEGER NOT NULL,
    "time_taken" INTEGER,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_grammar_challenge_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_listening_challenges" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "audio_url" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "duration" INTEGER,
    "active_date" DATE NOT NULL,

    CONSTRAINT "daily_listening_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_listening_questions" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSON NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "audio_start_time" INTEGER,
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_listening_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_listening_challenge_attempts" (
    "id" SERIAL NOT NULL,
    "challenge_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "answers" JSON NOT NULL,
    "score" INTEGER NOT NULL,
    "time_taken" INTEGER,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_listening_challenge_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_streaks" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "streak_count" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_completed_date" DATE NOT NULL,
    "streakHistory" JSON NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_rewards" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "reward_type" TEXT NOT NULL,
    "rewardValue" INTEGER NOT NULL,
    "description" TEXT,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claim_date" DATE NOT NULL,
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,
    "streak_day" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "daily_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "game_type" TEXT NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6),
    "duration" INTEGER,
    "score" INTEGER,
    "exp_earned" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSON,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_word_challenges_active_date_key" ON "public"."daily_word_challenges"("active_date");

-- CreateIndex
CREATE INDEX "daily_word_challenge_attempts_challenge_id_idx" ON "public"."daily_word_challenge_attempts"("challenge_id");

-- CreateIndex
CREATE INDEX "daily_word_challenge_attempts_user_id_idx" ON "public"."daily_word_challenge_attempts"("user_id");

-- CreateIndex
CREATE INDEX "daily_word_challenge_attempts_attempted_at_idx" ON "public"."daily_word_challenge_attempts"("attempted_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_word_challenge_attempts_user_id_challenge_id_attempt__key" ON "public"."daily_word_challenge_attempts"("user_id", "challenge_id", "attempt_number");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sentence_scrambles_active_date_key" ON "public"."daily_sentence_scrambles"("active_date");

-- CreateIndex
CREATE INDEX "daily_sentence_scramble_attempts_scramble_id_idx" ON "public"."daily_sentence_scramble_attempts"("scramble_id");

-- CreateIndex
CREATE INDEX "daily_sentence_scramble_attempts_user_id_idx" ON "public"."daily_sentence_scramble_attempts"("user_id");

-- CreateIndex
CREATE INDEX "daily_sentence_scramble_attempts_attempted_at_idx" ON "public"."daily_sentence_scramble_attempts"("attempted_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sentence_scramble_attempts_user_id_scramble_id_key" ON "public"."daily_sentence_scramble_attempts"("user_id", "scramble_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_vocabulary_quizzes_active_date_key" ON "public"."daily_vocabulary_quizzes"("active_date");

-- CreateIndex
CREATE INDEX "daily_vocabulary_quiz_questions_quiz_id_idx" ON "public"."daily_vocabulary_quiz_questions"("quiz_id");

-- CreateIndex
CREATE INDEX "daily_vocabulary_quiz_attempts_quiz_id_idx" ON "public"."daily_vocabulary_quiz_attempts"("quiz_id");

-- CreateIndex
CREATE INDEX "daily_vocabulary_quiz_attempts_user_id_idx" ON "public"."daily_vocabulary_quiz_attempts"("user_id");

-- CreateIndex
CREATE INDEX "daily_vocabulary_quiz_attempts_completed_at_idx" ON "public"."daily_vocabulary_quiz_attempts"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_vocabulary_quiz_attempts_user_id_quiz_id_key" ON "public"."daily_vocabulary_quiz_attempts"("user_id", "quiz_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_grammar_challenges_active_date_key" ON "public"."daily_grammar_challenges"("active_date");

-- CreateIndex
CREATE INDEX "daily_grammar_questions_challenge_id_idx" ON "public"."daily_grammar_questions"("challenge_id");

-- CreateIndex
CREATE INDEX "daily_grammar_challenge_attempts_challenge_id_idx" ON "public"."daily_grammar_challenge_attempts"("challenge_id");

-- CreateIndex
CREATE INDEX "daily_grammar_challenge_attempts_user_id_idx" ON "public"."daily_grammar_challenge_attempts"("user_id");

-- CreateIndex
CREATE INDEX "daily_grammar_challenge_attempts_completed_at_idx" ON "public"."daily_grammar_challenge_attempts"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_grammar_challenge_attempts_user_id_challenge_id_key" ON "public"."daily_grammar_challenge_attempts"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_listening_challenges_active_date_key" ON "public"."daily_listening_challenges"("active_date");

-- CreateIndex
CREATE INDEX "daily_listening_questions_challenge_id_idx" ON "public"."daily_listening_questions"("challenge_id");

-- CreateIndex
CREATE INDEX "daily_listening_challenge_attempts_challenge_id_idx" ON "public"."daily_listening_challenge_attempts"("challenge_id");

-- CreateIndex
CREATE INDEX "daily_listening_challenge_attempts_user_id_idx" ON "public"."daily_listening_challenge_attempts"("user_id");

-- CreateIndex
CREATE INDEX "daily_listening_challenge_attempts_completed_at_idx" ON "public"."daily_listening_challenge_attempts"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "daily_listening_challenge_attempts_user_id_challenge_id_key" ON "public"."daily_listening_challenge_attempts"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_streaks_user_id_key" ON "public"."daily_streaks"("user_id");

-- CreateIndex
CREATE INDEX "daily_rewards_user_id_idx" ON "public"."daily_rewards"("user_id");

-- CreateIndex
CREATE INDEX "daily_rewards_claim_date_idx" ON "public"."daily_rewards"("claim_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_rewards_user_id_claim_date_key" ON "public"."daily_rewards"("user_id", "claim_date");

-- CreateIndex
CREATE INDEX "game_sessions_user_id_idx" ON "public"."game_sessions"("user_id");

-- CreateIndex
CREATE INDEX "game_sessions_game_type_idx" ON "public"."game_sessions"("game_type");

-- CreateIndex
CREATE INDEX "game_sessions_start_time_idx" ON "public"."game_sessions"("start_time");
