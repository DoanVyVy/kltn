-- CreateTable
CREATE TABLE "public"."users" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."levels" (
    "level_id" SERIAL NOT NULL,
    "level_number" INTEGER NOT NULL,
    "level_name" TEXT NOT NULL,
    "points_required" INTEGER NOT NULL,
    "description" TEXT,
    "badge_url" TEXT,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "public"."achievements" (
    "achievement_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,
    "required_condition" TEXT,
    "points_reward" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("achievement_id")
);

-- CreateTable
CREATE TABLE "public"."user_achievements" (
    "user_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "date_achieved" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id","achievement_id")
);

-- CreateTable
CREATE TABLE "public"."vocabulary_categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER,

    CONSTRAINT "vocabulary_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."vocabulary_words" (
    "word_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "pronunciation" TEXT,
    "part_of_speech" TEXT,
    "definition" TEXT NOT NULL,
    "example_sentence" TEXT,
    "image_url" TEXT,
    "audio_url" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "vocabulary_words_pkey" PRIMARY KEY ("word_id")
);

-- CreateTable
CREATE TABLE "public"."grammar_topics" (
    "topic_id" SERIAL NOT NULL,
    "topic_name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER,

    CONSTRAINT "grammar_topics_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "public"."grammar_contents" (
    "content_id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "examples" TEXT,
    "notes" TEXT,
    "order_index" INTEGER,

    CONSTRAINT "grammar_contents_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "public"."game_types" (
    "game_type_id" SERIAL NOT NULL,
    "game_name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT,
    "instructions" TEXT,

    CONSTRAINT "game_types_pkey" PRIMARY KEY ("game_type_id")
);

-- CreateTable
CREATE TABLE "public"."game_activities" (
    "activity_id" SERIAL NOT NULL,
    "game_type_id" INTEGER NOT NULL,
    "activity_name" TEXT NOT NULL,
    "description" TEXT,
    "skill_focus" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "points_reward" INTEGER NOT NULL DEFAULT 10,
    "time_limit_seconds" INTEGER,
    "instructions" TEXT,

    CONSTRAINT "game_activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "public"."game_questions" (
    "question_id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "question_type" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "options" JSONB,
    "hint" TEXT,
    "explanation" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 5,
    "media_url" TEXT,
    "related_word_id" INTEGER,
    "related_grammar_id" INTEGER,

    CONSTRAINT "game_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "activity_log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity_id" INTEGER,
    "start_time" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMPTZ(6),
    "score" INTEGER,
    "answers_correct" INTEGER NOT NULL DEFAULT 0,
    "answers_wrong" INTEGER NOT NULL DEFAULT 0,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "completion_status" TEXT NOT NULL DEFAULT 'incomplete',

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("activity_log_id")
);

-- CreateTable
CREATE TABLE "public"."user_answers" (
    "answer_id" SERIAL NOT NULL,
    "activity_log_id" INTEGER NOT NULL,
    "question_id" INTEGER,
    "user_answer" TEXT,
    "is_correct" BOOLEAN,
    "time_taken_seconds" INTEGER,
    "points_earned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "public"."user_progress" (
    "progress_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "topic_id" INTEGER,
    "mastery_level" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "times_practiced" INTEGER NOT NULL DEFAULT 0,
    "last_practiced" TIMESTAMPTZ(6),
    "next_review_date" TIMESTAMPTZ(6),

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "public"."leaderboards" (
    "leaderboard_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("leaderboard_id")
);

-- CreateTable
CREATE TABLE "public"."leaderboard_entries" (
    "entry_id" SERIAL NOT NULL,
    "leaderboard_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "rank" INTEGER,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "public"."VocabularyCollection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "VocabularyCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CollectionDetail" (
    "id" SERIAL NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "inCorrectAnswers" TEXT[],

    CONSTRAINT "CollectionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCollectionProcess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "collectionDetailId" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "vocabularyCollectionId" INTEGER,

    CONSTRAINT "UserCollectionProcess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "levels_level_number_key" ON "public"."levels"("level_number");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_id_idx" ON "public"."user_achievements"("achievement_id");

-- CreateIndex
CREATE INDEX "vocabulary_words_category_id_idx" ON "public"."vocabulary_words"("category_id");

-- CreateIndex
CREATE INDEX "grammar_contents_topic_id_idx" ON "public"."grammar_contents"("topic_id");

-- CreateIndex
CREATE INDEX "game_activities_game_type_id_idx" ON "public"."game_activities"("game_type_id");

-- CreateIndex
CREATE INDEX "game_questions_activity_id_idx" ON "public"."game_questions"("activity_id");

-- CreateIndex
CREATE INDEX "game_questions_related_word_id_idx" ON "public"."game_questions"("related_word_id");

-- CreateIndex
CREATE INDEX "game_questions_related_grammar_id_idx" ON "public"."game_questions"("related_grammar_id");

-- CreateIndex
CREATE INDEX "user_activities_user_id_idx" ON "public"."user_activities"("user_id");

-- CreateIndex
CREATE INDEX "user_activities_activity_id_idx" ON "public"."user_activities"("activity_id");

-- CreateIndex
CREATE INDEX "user_answers_activity_log_id_idx" ON "public"."user_answers"("activity_log_id");

-- CreateIndex
CREATE INDEX "user_answers_question_id_idx" ON "public"."user_answers"("question_id");

-- CreateIndex
CREATE INDEX "user_progress_user_id_idx" ON "public"."user_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_progress_category_id_idx" ON "public"."user_progress"("category_id");

-- CreateIndex
CREATE INDEX "user_progress_topic_id_idx" ON "public"."user_progress"("topic_id");

-- CreateIndex
CREATE INDEX "leaderboard_entries_user_id_idx" ON "public"."leaderboard_entries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_leaderboard_id_user_id_key" ON "public"."leaderboard_entries"("leaderboard_id", "user_id");

-- CreateIndex
CREATE INDEX "CollectionDetail_wordId_idx" ON "public"."CollectionDetail"("wordId");

-- CreateIndex
CREATE INDEX "CollectionDetail_collectionId_idx" ON "public"."CollectionDetail"("collectionId");

-- CreateIndex
CREATE INDEX "UserCollectionProcess_userId_idx" ON "public"."UserCollectionProcess"("userId");

-- CreateIndex
CREATE INDEX "UserCollectionProcess_collectionDetailId_idx" ON "public"."UserCollectionProcess"("collectionDetailId");

-- CreateIndex
CREATE INDEX "UserCollectionProcess_vocabularyCollectionId_idx" ON "public"."UserCollectionProcess"("vocabularyCollectionId");
