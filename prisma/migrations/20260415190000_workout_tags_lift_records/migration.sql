-- CreateEnum
CREATE TYPE "WorkoutTag" AS ENUM ('LIGHT', 'VOLUME', 'PEAK', 'TECHNIQUE');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN "autoTag" "WorkoutTag";

-- CreateTable
CREATE TABLE "UserLiftRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baseLift" "BaseLift" NOT NULL,
    "topWeightKg" DECIMAL(12,4),
    "topVolumeKg" DECIMAL(12,4),
    "estOneRmKg" DECIMAL(12,4),
    "manualTopWeightKg" BOOLEAN NOT NULL DEFAULT false,
    "manualTopVolumeKg" BOOLEAN NOT NULL DEFAULT false,
    "manualEstOneRmKg" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLiftRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLiftRecord_userId_baseLift_key" ON "UserLiftRecord"("userId", "baseLift");

-- CreateIndex
CREATE INDEX "UserLiftRecord_userId_idx" ON "UserLiftRecord"("userId");

-- AddForeignKey
ALTER TABLE "UserLiftRecord" ADD CONSTRAINT "UserLiftRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

