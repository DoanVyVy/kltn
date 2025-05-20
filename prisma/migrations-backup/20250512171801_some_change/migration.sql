-- AlterTable
ALTER TABLE "public"."grammar_contents" ADD COLUMN     "syntax" TEXT;

-- AlterTable
ALTER TABLE "public"."user_game_completions" ADD COLUMN     "exp_earned" INTEGER;

-- CreateTable
CREATE TABLE "public"."event_store" (
    "event_id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSON,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aggregate_type" TEXT,
    "aggregate_id" TEXT,

    CONSTRAINT "event_store_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "event_store_user_id_idx" ON "public"."event_store"("user_id");
