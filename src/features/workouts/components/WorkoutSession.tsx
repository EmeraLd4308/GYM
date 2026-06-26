"use client";

import { useCallback, useRef } from "react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { SortableExerciseSection } from "@/features/workouts/components/SortableExerciseSection";
import { WorkoutSessionSkeleton } from "@/features/workouts/components/WorkoutSessionSkeleton";
import { WorkoutAddExercisePanel } from "@/features/workouts/components/WorkoutAddExercisePanel";
import { WorkoutExerciseCard } from "@/features/workouts/components/WorkoutExerciseCard";
import { WorkoutSessionHeader } from "@/features/workouts/components/WorkoutSessionHeader";
import { WorkoutRestTimer } from "@/features/workouts/components/WorkoutRestTimer";
import { useWorkoutSession } from "@/features/workouts/lib/use-workout-session";
import type { WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import { uiFieldErrorClass } from "@/shared/ui/styles";

export function WorkoutSession({
  workoutId,
  initialWorkout,
  readOnly = false,
}: {
  workoutId: string;
  initialWorkout?: WorkoutPayload | null;
  readOnly?: boolean;
}) {
  const startRestRef = useRef<(() => void) | null>(null);
  const session = useWorkoutSession(workoutId, initialWorkout, {
    readOnly,
    onSetMarkedDone: () => startRestRef.current?.(),
  });
  const {
    workout,
    loadError,
    confirm,
    setConfirm,
    handleConfirm,
    exerciseNameErrors,
    addingSetsFor,
    doneMap,
    setExerciseNameErrors,
    isSetDone,
    setSetDone,
    setWorkout,
    moveSetRelative,
    patchExerciseName,
    updateSet,
    addSet,
  } = session;

  const registerRestStart = useCallback((start: () => void) => {
    startRestRef.current = start;
  }, []);

  if (loadError && !workout) {
    return <p className={uiFieldErrorClass}>{loadError}</p>;
  }
  if (!workout) {
    return <WorkoutSessionSkeleton />;
  }

  return (
    <div className="space-y-8">
      {!readOnly ? (
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
      ) : null}

      {!readOnly ? <WorkoutSessionHeader {...session} /> : null}

      {!readOnly ? <WorkoutRestTimer onRegisterStart={registerRestStart} /> : null}

      <div className={`space-y-8 ${readOnly ? "pointer-events-none opacity-95" : ""}`}>
        {workout.exercises.map((ex, exerciseIndex) => (
          <SortableExerciseSection
            key={ex.id}
            canMoveUp={!readOnly && exerciseIndex > 0}
            canMoveDown={!readOnly && exerciseIndex < workout.exercises.length - 1}
            onMoveUp={() => session.moveExerciseRelative(ex.id, -1)}
            onMoveDown={() => session.moveExerciseRelative(ex.id, 1)}
            onDelete={!readOnly ? () => setConfirm({ kind: "ex", id: ex.id }) : undefined}
          >
            <WorkoutExerciseCard
              ex={ex}
              exerciseIndex={exerciseIndex}
              exerciseNameError={exerciseNameErrors[ex.id] ?? null}
              isAddingSets={addingSetsFor === ex.id}
              doneMap={doneMap}
              setExerciseNameErrors={setExerciseNameErrors}
              isSetDone={isSetDone}
              setSetDone={setSetDone}
              setWorkout={setWorkout}
              setConfirm={setConfirm}
              moveSetRelative={moveSetRelative}
              patchExerciseName={patchExerciseName}
              updateSet={updateSet}
              addSet={addSet}
            />
          </SortableExerciseSection>
        ))}
      </div>

      {!readOnly ? <WorkoutAddExercisePanel {...session} /> : null}
    </div>
  );
}
