-- Supersets moved from exercise level to set level:
-- adjacent marked sets of one exercise form a back-to-back block.

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "supersetGroup";

-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN "isSuperset" BOOLEAN NOT NULL DEFAULT false;
