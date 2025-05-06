-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "is_vocabulary_course" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."user_review_words" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "word_id" INTEGER NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_review_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_review_words_user_id_idx" ON "public"."user_review_words"("user_id");

-- CreateIndex
CREATE INDEX "user_review_words_word_id_idx" ON "public"."user_review_words"("word_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_review_words_user_id_word_id_key" ON "public"."user_review_words"("user_id", "word_id");
