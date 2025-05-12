-- AlterTable
ALTER TABLE "public"."event_store" ALTER COLUMN "aggregate_type" DROP NOT NULL,
ALTER COLUMN "aggregate_id" DROP NOT NULL;
