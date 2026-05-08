WITH ranked_template_exercise AS (
  SELECT
    id,
    "templateId",
    ROW_NUMBER() OVER (PARTITION BY "templateId" ORDER BY "sortOrder", id) - 1 AS next_sort_order
  FROM "TemplateExercise"
),
ranked_workout_exercise AS (
  SELECT
    id,
    "workoutId",
    ROW_NUMBER() OVER (PARTITION BY "workoutId" ORDER BY "sortOrder", id) - 1 AS next_sort_order
  FROM "WorkoutExercise"
),
ranked_exercise_set AS (
  SELECT
    id,
    "workoutExerciseId",
    ROW_NUMBER() OVER (PARTITION BY "workoutExerciseId" ORDER BY "sortOrder", id) - 1 AS next_sort_order
  FROM "ExerciseSet"
)
UPDATE "TemplateExercise" te
SET "sortOrder" = rte.next_sort_order
FROM ranked_template_exercise rte
WHERE te.id = rte.id
  AND te."sortOrder" <> rte.next_sort_order;

WITH ranked_workout_exercise AS (
  SELECT
    id,
    "workoutId",
    ROW_NUMBER() OVER (PARTITION BY "workoutId" ORDER BY "sortOrder", id) - 1 AS next_sort_order
  FROM "WorkoutExercise"
)
UPDATE "WorkoutExercise" we
SET "sortOrder" = rwe.next_sort_order
FROM ranked_workout_exercise rwe
WHERE we.id = rwe.id
  AND we."sortOrder" <> rwe.next_sort_order;

WITH ranked_exercise_set AS (
  SELECT
    id,
    "workoutExerciseId",
    ROW_NUMBER() OVER (PARTITION BY "workoutExerciseId" ORDER BY "sortOrder", id) - 1 AS next_sort_order
  FROM "ExerciseSet"
)
UPDATE "ExerciseSet" es
SET "sortOrder" = res.next_sort_order
FROM ranked_exercise_set res
WHERE es.id = res.id
  AND es."sortOrder" <> res.next_sort_order;

CREATE UNIQUE INDEX "TemplateExercise_templateId_sortOrder_key"
ON "TemplateExercise"("templateId", "sortOrder");

CREATE UNIQUE INDEX "WorkoutExercise_workoutId_sortOrder_key"
ON "WorkoutExercise"("workoutId", "sortOrder");

CREATE UNIQUE INDEX "ExerciseSet_workoutExerciseId_sortOrder_key"
ON "ExerciseSet"("workoutExerciseId", "sortOrder");
