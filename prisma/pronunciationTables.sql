-- CreateTable
CREATE TABLE "pronunciation_contents" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audio_url" TEXT,
    "translation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "expected_phonemes" JSONB,
    "ipa" TEXT,
    "hints" JSONB,
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
CREATE TABLE "pronunciation_content_sets" (
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
CREATE TABLE "pronunciation_settings" (
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
CREATE TABLE "pronunciation_attempts" (
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
    "feedback" JSONB NOT NULL,
    "word_analysis" JSONB,
    "phoneme_analysis" JSONB,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pronunciation_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_pronunciation_progress" (
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
    "content_items_progress" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_pronunciation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pronunciation_contents_type_idx" ON "pronunciation_contents"("type");

-- CreateIndex
CREATE INDEX "pronunciation_contents_difficulty_idx" ON "pronunciation_contents"("difficulty");

-- CreateIndex
CREATE INDEX "pronunciation_contents_category_idx" ON "pronunciation_contents"("category");

-- CreateIndex
CREATE INDEX "pronunciation_contents_set_id_idx" ON "pronunciation_contents"("set_id");

-- CreateIndex
CREATE INDEX "pronunciation_content_sets_difficulty_idx" ON "pronunciation_content_sets"("difficulty");

-- CreateIndex
CREATE INDEX "pronunciation_content_sets_category_idx" ON "pronunciation_content_sets"("category");

-- CreateIndex
CREATE INDEX "pronunciation_content_sets_level_idx" ON "pronunciation_content_sets"("level");

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_settings_user_id_key" ON "pronunciation_settings"("user_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_user_id_idx" ON "pronunciation_attempts"("user_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_content_id_idx" ON "pronunciation_attempts"("content_id");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_attempted_at_idx" ON "pronunciation_attempts"("attempted_at");

-- CreateIndex
CREATE INDEX "pronunciation_attempts_is_successful_idx" ON "pronunciation_attempts"("is_successful");

-- CreateIndex
CREATE UNIQUE INDEX "user_pronunciation_progress_user_id_content_set_id_key" ON "user_pronunciation_progress"("user_id", "content_set_id");

-- CreateIndex
CREATE INDEX "user_pronunciation_progress_user_id_idx" ON "user_pronunciation_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_pronunciation_progress_content_set_id_idx" ON "user_pronunciation_progress"("content_set_id");

-- CreateIndex
CREATE INDEX "user_pronunciation_progress_completion_status_idx" ON "user_pronunciation_progress"("completion_status");

-- AddForeignKey
ALTER TABLE "pronunciation_contents" ADD CONSTRAINT "pronunciation_contents_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "pronunciation_content_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_settings" ADD CONSTRAINT "pronunciation_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "pronunciation_contents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pronunciation_progress" ADD CONSTRAINT "user_pronunciation_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pronunciation_progress" ADD CONSTRAINT "user_pronunciation_progress_content_set_id_fkey" FOREIGN KEY ("content_set_id") REFERENCES "pronunciation_content_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
