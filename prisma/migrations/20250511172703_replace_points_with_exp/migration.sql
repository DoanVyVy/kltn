/*
  Warnings:

  - You are about to drop the column `points_reward` on the `achievements` table. All the data in the column will be lost.
  - You are about to drop the column `points_reward` on the `daily_idiom_challenges` table. All the data in the column will be lost.
  - You are about to drop the column `points_reward` on the `daily_sentence_scrambles` table. All the data in the column will be lost.
  - You are about to drop the column `points_reward` on the `daily_word_associations` table. All the data in the column will be lost.
  - You are about to drop the column `points_reward` on the `daily_word_guesses` table. All the data in the column will be lost.
  - You are about to drop the column `points_reward` on the `game_activities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."achievements" DROP COLUMN "points_reward",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."daily_idiom_challenges" DROP COLUMN "points_reward",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "public"."daily_sentence_scrambles" DROP COLUMN "points_reward",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "public"."daily_word_associations" DROP COLUMN "points_reward",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "public"."daily_word_guesses" DROP COLUMN "points_reward",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "public"."game_activities" DROP COLUMN "points_reward",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 10;
