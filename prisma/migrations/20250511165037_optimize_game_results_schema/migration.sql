-- AlterTable
ALTER TABLE "public"."grammar_contents" ADD COLUMN     "syntax" TEXT;

-- AlterTable
ALTER TABLE "public"."user_game_completions" ADD COLUMN     "exp_earned" INTEGER;

-- CreateTable
CREATE TABLE "public"."daily_idiom_challenges" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idioms" JSON NOT NULL,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "points_reward" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "daily_idiom_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_sentence_scrambles" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentences" JSON NOT NULL,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "points_reward" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "daily_sentence_scrambles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_word_associations" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wordPairs" JSON NOT NULL,
    "time_limit" INTEGER NOT NULL DEFAULT 60,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "points_reward" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "daily_word_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_word_guesses" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "word" TEXT NOT NULL,
    "clues" JSON NOT NULL,
    "max_attempts" INTEGER NOT NULL DEFAULT 6,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "points_reward" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "daily_word_guesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_game_results" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "game_type" TEXT NOT NULL,
    "game_subtype" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DECIMAL(5,2),
    "time_taken" INTEGER,
    "level" INTEGER NOT NULL DEFAULT 1,
    "attempts_used" INTEGER,
    "items_completed" INTEGER,
    "details" JSON,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_game_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_idiom_challenges_date_key" ON "public"."daily_idiom_challenges"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sentence_scrambles_date_key" ON "public"."daily_sentence_scrambles"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_word_associations_date_key" ON "public"."daily_word_associations"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_word_guesses_date_key" ON "public"."daily_word_guesses"("date");

-- CreateIndex
CREATE INDEX "user_game_results_user_id_idx" ON "public"."user_game_results"("user_id");

-- CreateIndex
CREATE INDEX "user_game_results_game_type_idx" ON "public"."user_game_results"("game_type");

-- CreateIndex
CREATE INDEX "user_game_results_game_subtype_idx" ON "public"."user_game_results"("game_subtype");

-- CreateIndex
CREATE INDEX "user_game_results_completed_at_idx" ON "public"."user_game_results"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_game_results_user_id_game_id_game_type_game_subtype_co_key" ON "public"."user_game_results"("user_id", "game_id", "game_type", "game_subtype", "completed_at" DESC);
