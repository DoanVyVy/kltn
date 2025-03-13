/*
  Warnings:

  - The primary key for the `user_achievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `CollectionDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCollectionProcess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VocabularyCollection` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `user_id` on the `leaderboard_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_achievements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_activities` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `user_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - The required column `user_id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."leaderboard_entries" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_achievements" DROP CONSTRAINT "user_achievements_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("user_id", "achievement_id");

-- AlterTable
ALTER TABLE "public"."user_activities" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_progress" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "userId",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

-- AlterTable
ALTER TABLE "public"."vocabulary_words" ADD COLUMN     "paronymWords" TEXT[];

-- DropTable
DROP TABLE "public"."CollectionDetail";

-- DropTable
DROP TABLE "public"."UserCollectionProcess";

-- DropTable
DROP TABLE "public"."VocabularyCollection";

-- CreateIndex
CREATE INDEX "leaderboard_entries_user_id_idx" ON "public"."leaderboard_entries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_leaderboard_id_user_id_key" ON "public"."leaderboard_entries"("leaderboard_id", "user_id");

-- CreateIndex
CREATE INDEX "user_activities_user_id_idx" ON "public"."user_activities"("user_id");

-- CreateIndex
CREATE INDEX "user_progress_user_id_idx" ON "public"."user_progress"("user_id");
