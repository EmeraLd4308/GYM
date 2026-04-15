-- Rename old enum and create new enum with three levels
ALTER TYPE "WorkoutTag" RENAME TO "WorkoutTag_old";
CREATE TYPE "WorkoutTag" AS ENUM ('HEAVY', 'MEDIUM', 'LIGHT');

-- Re-map existing values to the new tag scale
ALTER TABLE "Workout"
  ALTER COLUMN "autoTag" TYPE "WorkoutTag"
  USING (
    CASE
      WHEN "autoTag"::text = 'PEAK' THEN 'HEAVY'
      WHEN "autoTag"::text = 'VOLUME' THEN 'MEDIUM'
      WHEN "autoTag"::text = 'LIGHT' THEN 'LIGHT'
      WHEN "autoTag"::text = 'TECHNIQUE' THEN 'LIGHT'
      ELSE NULL
    END
  )::"WorkoutTag";

DROP TYPE "WorkoutTag_old";

