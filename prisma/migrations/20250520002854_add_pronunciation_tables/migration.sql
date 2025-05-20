/*
  Warnings:

  - You are about to drop the column `set_id` on the `pronunciation_contents` table. All the data in the column will be lost.
  - You are about to drop the `daily_grammar_challenge_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_grammar_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_grammar_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_listening_challenge_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_listening_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_listening_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_rewards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_sentence_scramble_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_sentence_scrambles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_streaks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_vocabulary_quiz_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_vocabulary_quiz_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_vocabulary_quizzes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_word_challenge_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_word_challenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `game_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pronunciation_attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pronunciation_content_sets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pronunciation_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "public"."pronunciation_contents_set_id_idx";

-- AlterTable
ALTER TABLE "public"."pronunciation_contents" DROP COLUMN "set_id",
ADD COLUMN     "exp_reward" INTEGER NOT NULL DEFAULT 50;

-- DropTable
DROP TABLE "public"."daily_grammar_challenge_attempts";

-- DropTable
DROP TABLE "public"."daily_grammar_challenges";

-- DropTable
DROP TABLE "public"."daily_grammar_questions";

-- DropTable
DROP TABLE "public"."daily_listening_challenge_attempts";

-- DropTable
DROP TABLE "public"."daily_listening_challenges";

-- DropTable
DROP TABLE "public"."daily_listening_questions";

-- DropTable
DROP TABLE "public"."daily_rewards";

-- DropTable
DROP TABLE "public"."daily_sentence_scramble_attempts";

-- DropTable
DROP TABLE "public"."daily_sentence_scrambles";

-- DropTable
DROP TABLE "public"."daily_streaks";

-- DropTable
DROP TABLE "public"."daily_vocabulary_quiz_attempts";

-- DropTable
DROP TABLE "public"."daily_vocabulary_quiz_questions";

-- DropTable
DROP TABLE "public"."daily_vocabulary_quizzes";

-- DropTable
DROP TABLE "public"."daily_word_challenge_attempts";

-- DropTable
DROP TABLE "public"."daily_word_challenges";

-- DropTable
DROP TABLE "public"."game_activities";

-- DropTable
DROP TABLE "public"."game_questions";

-- DropTable
DROP TABLE "public"."game_sessions";

-- DropTable
DROP TABLE "public"."game_types";

-- DropTable
DROP TABLE "public"."pronunciation_attempts";

-- DropTable
DROP TABLE "public"."pronunciation_content_sets";

-- DropTable
DROP TABLE "public"."pronunciation_settings";
