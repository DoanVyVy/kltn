-- CreateTable
CREATE TABLE "public"."user_game_completions" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "game_type" TEXT NOT NULL,
    "score" INTEGER,
    "time_taken" INTEGER,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_game_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_game_completions_user_id_idx" ON "public"."user_game_completions"("user_id");
