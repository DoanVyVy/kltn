-- AlterTable
ALTER TABLE "public"."grammar_contents" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "video_url" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "public"."vocabulary_words" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "video_url" TEXT;
