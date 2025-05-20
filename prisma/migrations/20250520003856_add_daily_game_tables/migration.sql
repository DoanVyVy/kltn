-- CreateTable
CREATE TABLE "public"."daily_word_guess" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "hint" TEXT,
    "definition" TEXT NOT NULL,
    "part_of_speech" TEXT,
    "image_url" TEXT,
    "example_sentence" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "active_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_word_guess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_sentence_scramble" (
    "id" SERIAL NOT NULL,
    "sentence" TEXT NOT NULL,
    "scrambled_sentence" TEXT NOT NULL,
    "translation" TEXT,
    "hint" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "active_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_sentence_scramble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_word_association" (
    "id" SERIAL NOT NULL,
    "source_word" TEXT NOT NULL,
    "target_words" TEXT[],
    "correct_word" TEXT NOT NULL,
    "hint" TEXT,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "active_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_word_association_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_idiom_challenge" (
    "id" SERIAL NOT NULL,
    "idiom" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "literal_meaning" TEXT,
    "example_sentence" TEXT,
    "options" TEXT[],
    "correct_option" TEXT NOT NULL,
    "hint" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "active_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_idiom_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_daily_game_completions" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "game_date" DATE NOT NULL,
    "game_type" TEXT NOT NULL,
    "word_guess_id" INTEGER,
    "sentence_scramble_id" INTEGER,
    "word_association_id" INTEGER,
    "idiom_challenge_id" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "time_taken" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "exp_earned" INTEGER,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_daily_game_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_word_guess_active_date_idx" ON "public"."daily_word_guess"("active_date");

-- CreateIndex
CREATE INDEX "daily_word_guess_difficulty_idx" ON "public"."daily_word_guess"("difficulty");

-- CreateIndex
CREATE INDEX "daily_sentence_scramble_active_date_idx" ON "public"."daily_sentence_scramble"("active_date");

-- CreateIndex
CREATE INDEX "daily_sentence_scramble_difficulty_idx" ON "public"."daily_sentence_scramble"("difficulty");

-- CreateIndex
CREATE INDEX "daily_word_association_active_date_idx" ON "public"."daily_word_association"("active_date");

-- CreateIndex
CREATE INDEX "daily_word_association_difficulty_idx" ON "public"."daily_word_association"("difficulty");

-- CreateIndex
CREATE INDEX "daily_idiom_challenge_active_date_idx" ON "public"."daily_idiom_challenge"("active_date");

-- CreateIndex
CREATE INDEX "daily_idiom_challenge_difficulty_idx" ON "public"."daily_idiom_challenge"("difficulty");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_user_id_idx" ON "public"."user_daily_game_completions"("user_id");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_game_type_idx" ON "public"."user_daily_game_completions"("game_type");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_game_date_idx" ON "public"."user_daily_game_completions"("game_date");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_completed_at_idx" ON "public"."user_daily_game_completions"("completed_at");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_word_guess_id_idx" ON "public"."user_daily_game_completions"("word_guess_id");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_sentence_scramble_id_idx" ON "public"."user_daily_game_completions"("sentence_scramble_id");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_word_association_id_idx" ON "public"."user_daily_game_completions"("word_association_id");

-- CreateIndex
CREATE INDEX "user_daily_game_completions_idiom_challenge_id_idx" ON "public"."user_daily_game_completions"("idiom_challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_daily_game_completions_user_id_game_date_game_type_key" ON "public"."user_daily_game_completions"("user_id", "game_date", "game_type");
