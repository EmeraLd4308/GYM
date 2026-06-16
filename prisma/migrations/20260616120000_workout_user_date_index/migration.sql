-- Composite index for user workout date-range queries (dashboard, stats, calendar dupes).
CREATE INDEX IF NOT EXISTS "Workout_userId_date_idx" ON "Workout"("userId", "date");
