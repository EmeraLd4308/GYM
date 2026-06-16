"use client";

import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { SortableExerciseSection } from "@/features/workouts/components/SortableExerciseSection";
import { WorkoutSessionSkeleton } from "@/features/workouts/components/WorkoutSessionSkeleton";
import { WorkoutAddExercisePanel } from "@/features/workouts/components/WorkoutAddExercisePanel";
import { WorkoutExerciseCard } from "@/features/workouts/components/WorkoutExerciseCard";
import { WorkoutSessionHeader } from "@/features/workouts/components/WorkoutSessionHeader";
import { useWorkoutSession } from "@/features/workouts/lib/use-workout-session";
import type { WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import { uiFieldErrorClass } from "@/shared/ui/styles";

export function WorkoutSession({
  workoutId,
  initialWorkout,
}: {
  workoutId: string;
  initialWorkout?: WorkoutPayload | null;
}) {
  const session = useWorkoutSession(workoutId, initialWorkout);
  const { workout, loadError, confirm, setConfirm, handleConfirm } = session;

  if (loadError && !workout) {
    return <p className={uiFieldErrorClass}>{loadError}</p>;
  }
  if (!workout) {
    return <WorkoutSessionSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === "set"
            ? "Видалити підхід?"
            : confirm?.kind === "ex"
              ? "Видалити вправу?"
              : "Видалити тренування?"
        }
        description={
          confirm?.kind === "ex"
            ? "Усі підходи цієї вправи будуть видалені без відновлення."
            : confirm?.kind === "wo"
              ? "Усі вправи та підходи цього тренування зникнуть без відновлення."
              : undefined
        }
        confirmLabel={confirm?.kind === "wo" ? "Видалити" : "Так"}
        cancelLabel="Скасувати"
        danger
        onConfirm={handleConfirm}
      />

      <WorkoutSessionHeader {...session} />

      <div className="space-y-8">
        {workout.exercises.map((ex, exerciseIndex) => (
          <SortableExerciseSection
            key={ex.id}
            canMoveUp={exerciseIndex > 0}
            canMoveDown={exerciseIndex < workout.exercises.length - 1}
            onMoveUp={() => session.moveExerciseRelative(ex.id, -1)}
            onMoveDown={() => session.moveExerciseRelative(ex.id, 1)}
          >
            <WorkoutExerciseCard ex={ex} exerciseIndex={exerciseIndex} {...session} />
          </SortableExerciseSection>
        ))}
      </div>

      <WorkoutAddExercisePanel {...session} />
    </div>
  );
}
