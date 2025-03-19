-- AlterTable
ALTER TABLE "public"."user_progress" ADD COLUMN     "process_percentage" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."user_flashcard_answers" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "word_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "process_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_flashcard_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_flashcard_answers_user_id_idx" ON "public"."user_flashcard_answers"("user_id");

-- CreateIndex
CREATE INDEX "user_flashcard_answers_word_id_idx" ON "public"."user_flashcard_answers"("word_id");

-- CreateIndex
CREATE INDEX "user_flashcard_answers_process_id_idx" ON "public"."user_flashcard_answers"("process_id");
