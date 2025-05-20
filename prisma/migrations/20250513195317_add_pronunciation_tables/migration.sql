/*
  Warnings:

  - You are about to drop the `daily_idiom_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_sentence_scrambles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_word_associations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_word_guesses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_game_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "current_exp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."daily_idiom_challenges";

-- DropTable
DROP TABLE "public"."daily_sentence_scrambles";

-- DropTable
DROP TABLE "public"."daily_word_associations";

-- DropTable
DROP TABLE "public"."daily_word_guesses";

-- DropTable
DROP TABLE "public"."user_game_results";

-- CreateTable
CREATE TABLE "public"."event_store" (
    "event_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSON,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aggregate_type" TEXT,
    "aggregate_id" TEXT,

    CONSTRAINT "event_store_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."pronunciation_contents" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audio_url" TEXT,
    "translation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "expected_phonemes" JSON,
    "ipa" TEXT,
    "hints" JSON,
    "times_attempted" INTEGER NOT NULL DEFAULT 0,
    "success_rate" DECIMAL(5,2) DEFAULT 0,
    "average_score" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "set_id" INTEGER,

    CONSTRAINT "pronunciation_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pronunciation_content_sets" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "focus_area" TEXT,
    "image_url" TEXT,
    "recommended_duration" INTEGER NOT NULL DEFAULT 10,
    "exp_reward" INTEGER NOT NULL DEFAULT 50,
    "passing_threshold" INTEGER NOT NULL DEFAULT 75,
    "order" INTEGER NOT NULL DEFAULT 0,
    "times_completed" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pronunciation_content_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pronunciation_settings" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "preferred_language" TEXT NOT NULL DEFAULT 'vi',
    "passing_threshold" INTEGER NOT NULL DEFAULT 75,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "use_caching" BOOLEAN NOT NULL DEFAULT false,
    "realistic_mode" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pronunciation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pronunciation_attempts" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "content_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "fluency" INTEGER NOT NULL,
    "prosody" INTEGER NOT NULL,
    "text_match" INTEGER,
    "is_successful" BOOLEAN NOT NULL DEFAULT false,
    "audio_url" TEXT,
    "transcribed_text" TEXT,
    "feedback" JSON NOT NULL,
    "wordAnalysis" JSON,
    "phoneme_analysis" JSON,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pronunciation_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_pronunciation_progress" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "content_set_id" INTEGER NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "average_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "completion_status" TEXT NOT NULL DEFAULT 'not_started',
    "last_attempted_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "mastered_at" TIMESTAMPTZ(6),
    "content_items_progress" JSON NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pronunciation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_store_user_id_idx" ON "public"."event_store"("user_id");

-- CreateIndex
CREATE INDEX "pronunciation_contents_type_idx" ON "public"."pronunciation_contents"("type");

-- CreateIndex
CREATE INDEX "pronunciation_contents_difficulty_idx" ON "public"."pronunciation_contents"("difficulty");

-- CreateIndex
CREATE INDEX "pronunciation_contents_category_idx" ON "public"."pronunciation_contents"("category");

-- CreateIndex
CREATE INDEX "pronunciation_contents_set_id_idx" ON "public"."pronunciation_contents"("set_id");

-- CreateIndex
CREATE INDEX "pronunciation_content_sets_difficulty_idx" ON "public"."pronunciation_content_sets"("difficulty");

-- CreateIndex
CREATE INDEX "pronunciation_content_sets_category_idx" ON "public"."pronunciation_content_sets"("category");

-- CreateIndex
CREATE INDEX "pronunciation_content_sets_level_idx" ON "public"."pronunciation_content_sets"("level");

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_settings_user_id_key" ON "public"."pronunciation_settings"("user_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_user_id_idx" ON "public"."pronunciation_attempts"("user_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_content_id_idx" ON "public"."pronunciation_attempts"("content_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_attempted_at_idx" ON "public"."pronunciation_attempts"("attempted_at");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_is_successful_idx" ON "public"."pronunciation_attempts"("is_successful");

-- CreateIndex
CREATE INDEX "user_pronunciation_progress_user_id_idx" ON "public"."user_pronunciation_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_pronunciation_progress_content_set_id_idx" ON "public"."user_pronunciation_progress"("content_set_id");

-- CreateIndex
CREATE INDEX "user_pronunciation_progress_completion_status_idx" ON "public"."user_pronunciation_progress"("completion_status");

-- CreateIndex
CREATE UNIQUE INDEX "user_pronunciation_progress_user_id_content_set_id_key" ON "public"."user_pronunciation_progress"("user_id", "content_set_id");
