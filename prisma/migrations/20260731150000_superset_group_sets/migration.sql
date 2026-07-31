-- Superset becomes a group of sets counted as one set:
-- sets sharing supersetGroup within an exercise form one block.

-- AlterTable
ALTER TABLE "ExerciseSet" DROP COLUMN "isSuperset";

-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN "supersetGroup" TEXT;
