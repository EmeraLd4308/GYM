-- Drop planDone from WorkoutExercise (UI removed; was extra DB writes)
ALTER TABLE "WorkoutExercise" DROP COLUMN IF EXISTS "planDone";
