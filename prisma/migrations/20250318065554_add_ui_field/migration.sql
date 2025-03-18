-- AlterTable
ALTER TABLE "public"."vocabulary_categories" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."vocabulary_words" ADD COLUMN     "definitions" JSON NOT NULL DEFAULT '[]';
