/*
  Warnings:

  - You are about to drop the `user_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_flashcard_answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."user_progress" ADD COLUMN     "content_type" TEXT NOT NULL DEFAULT 'vocabulary';

-- DropTable
DROP TABLE "public"."user_activities";

-- DropTable
DROP TABLE "public"."user_answers";

-- DropTable
DROP TABLE "public"."user_flashcard_answers";

-- CreateTable
CREATE TABLE "public"."user_learning_answers" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "word_id" INTEGER,
    "grammar_id" INTEGER,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "process_id" INTEGER NOT NULL,

    CONSTRAINT "user_learning_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_review_grammar" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "grammar_id" INTEGER NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_review_grammar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_learning_answers_user_id_idx" ON "public"."user_learning_answers"("user_id");

-- CreateIndex
CREATE INDEX "user_learning_answers_word_id_idx" ON "public"."user_learning_answers"("word_id");

-- CreateIndex
CREATE INDEX "user_learning_answers_grammar_id_idx" ON "public"."user_learning_answers"("grammar_id");

-- CreateIndex
CREATE INDEX "user_learning_answers_process_id_idx" ON "public"."user_learning_answers"("process_id");

-- CreateIndex
CREATE INDEX "user_review_grammar_user_id_idx" ON "public"."user_review_grammar"("user_id");

-- CreateIndex
CREATE INDEX "user_review_grammar_grammar_id_idx" ON "public"."user_review_grammar"("grammar_id");
