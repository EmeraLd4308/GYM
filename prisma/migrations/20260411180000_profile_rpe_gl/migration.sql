-- CreateEnum
CREATE TYPE "GlSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "GlEquipment" AS ENUM ('CLASSIC', 'EQUIPPED');

-- CreateEnum
CREATE TYPE "GlDiscipline" AS ENUM ('POWERLIFTING', 'BENCH_ONLY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "glBodyweightKg" DECIMAL(8,3),
ADD COLUMN "glMaxSquatKg" DECIMAL(12,4),
ADD COLUMN "glMaxBenchKg" DECIMAL(12,4),
ADD COLUMN "glMaxDeadliftKg" DECIMAL(12,4),
ADD COLUMN "glSex" "GlSex",
ADD COLUMN "glEquipment" "GlEquipment",
ADD COLUMN "glDiscipline" "GlDiscipline";

-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN "rpe" DECIMAL(4,2);
