-- Create the user_game_completions table
CREATE TABLE "public"."user_game_completions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "game_type" TEXT NOT NULL,
  "score" INTEGER,
  "time_taken" INTEGER,
  "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "exp_earned" INTEGER
);

-- Create an index on user_id for faster lookups
CREATE INDEX "user_game_completions_user_id_idx" ON "public"."user_game_completions"("user_id");

-- Add foreign key constraint to the users table
ALTER TABLE "public"."user_game_completions"
  ADD CONSTRAINT "user_game_completions_user_id_fkey"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("user_id")
  ON DELETE CASCADE;