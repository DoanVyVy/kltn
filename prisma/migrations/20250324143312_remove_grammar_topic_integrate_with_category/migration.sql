/*
  Warnings:

  - You are about to drop the column `topic_id` on the `grammar_contents` table. All the data in the column will be lost.
  - You are about to drop the column `topic_id` on the `user_progress` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `vocabulary_words` table. All the data in the column will be lost.
  - You are about to drop the `grammar_topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vocabulary_categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `grammar_contents` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."grammar_contents_topic_id_idx";

-- DropIndex
DROP INDEX "public"."user_progress_topic_id_idx";

-- AlterTable
ALTER TABLE "public"."grammar_contents" DROP COLUMN "topic_id",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_progress" DROP COLUMN "topic_id";

-- AlterTable
ALTER TABLE "public"."vocabulary_words" DROP COLUMN "image_url";

-- DropTable
DROP TABLE "public"."grammar_topics";

-- DropTable
DROP TABLE "public"."vocabulary_categories";

-- CreateTable
CREATE TABLE "public"."categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty_level" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER,
    "total_words" INTEGER NOT NULL DEFAULT 0,
    "total_grammar" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "content_type" TEXT NOT NULL DEFAULT 'vocabulary',

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateIndex
CREATE INDEX "grammar_contents_category_id_idx" ON "public"."grammar_contents"("category_id");
