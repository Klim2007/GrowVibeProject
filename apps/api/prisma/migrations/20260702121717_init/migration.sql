-- CreateEnum
CREATE TYPE "TrainerStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "HotspotType" AS ENUM ('click', 'input');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('exact', 'regex', 'nonEmpty');

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'ru',
    "passing_score" INTEGER NOT NULL DEFAULT 80,
    "scorm_version" TEXT NOT NULL DEFAULT '1.2',
    "status" "TrainerStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screens" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "narration" TEXT,
    "slug" TEXT,

    CONSTRAINT "screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspots" (
    "id" TEXT NOT NULL,
    "screen_id" TEXT NOT NULL,
    "type" "HotspotType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT,
    "region_x" DOUBLE PRECISION NOT NULL,
    "region_y" DOUBLE PRECISION NOT NULL,
    "region_width" DOUBLE PRECISION NOT NULL,
    "region_height" DOUBLE PRECISION NOT NULL,
    "match_type" "MatchType",
    "match_value" TEXT,
    "next_screen_id" TEXT,
    "success_score" INTEGER NOT NULL DEFAULT 0,
    "error_hint" TEXT,
    "error_retry" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "screens_trainer_id_order_idx" ON "screens"("trainer_id", "order");

-- CreateIndex
CREATE INDEX "hotspots_screen_id_idx" ON "hotspots"("screen_id");

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspots" ADD CONSTRAINT "hotspots_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
