-- Колонка могла вже існувати (db push / ручне додавання) — не падаємо на повторному застосуванні
ALTER TABLE "WorkoutExercise" ADD COLUMN IF NOT EXISTS "planDone" BOOLEAN NOT NULL DEFAULT false;
