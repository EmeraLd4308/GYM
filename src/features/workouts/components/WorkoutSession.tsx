"use client";

import { useMemo } from "react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import {
  ExerciseSection,
  ExerciseToolbarSection,
} from "@/features/workouts/components/ExerciseSection";
import { WorkoutSessionSkeleton } from "@/features/workouts/components/WorkoutSessionSkeleton";
import { WorkoutAddExercisePanel } from "@/features/workouts/components/WorkoutAddExercisePanel";
import { WorkoutExerciseCard } from "@/features/workouts/components/WorkoutExerciseCard";
import { WorkoutSessionHeader } from "@/features/workouts/components/WorkoutSessionHeader";
import { AddChildExerciseForm } from "@/features/workouts/components/AddChildExerciseForm";
import { useWorkoutSession } from "@/features/workouts/lib/use-workout-session";
import type { ExerciseRow, WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import {
  buildExerciseBlocks,
  canHaveChild,
  exerciseDisplayIndex,
  topLevelExercises,
} from "@/features/workouts/lib/exercise-relations";
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
  const session = useWorkoutSession(workoutId, initialWorkout, { readOnly });
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
    setSupersetGroups,
    addSet,
    addChildExercise,
  } = session;

  const blocks = useMemo(
    () => (workout ? buildExerciseBlocks(workout.exercises) : []),
    [workout],
  );

  if (loadError && !workout) {
    return <p className={uiFieldErrorClass}>{loadError}</p>;
  }
  if (!workout) {
    return <WorkoutSessionSkeleton />;
  }

  function renderCard(ex: ExerciseRow, opts?: { child?: boolean; parentIndex?: number }) {
    const idx = opts?.child
      ? (opts.parentIndex ?? 0)
      : exerciseDisplayIndex(workout!.exercises, ex.id);
    return (
      <WorkoutExerciseCard
        ex={ex}
        exerciseIndex={idx}
        isChild={Boolean(opts?.child)}
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
        setSupersetGroups={setSupersetGroups}
        addSet={addSet}
      />
    );
  }

  const topList = topLevelExercises(workout.exercises);

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
              ? "Усі підходи цієї вправи будуть видалені без відновлення. Дочірні вправи також зникнуть."
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

      <div className={`space-y-6 ${readOnly ? "pointer-events-none opacity-95" : ""}`}>
        {blocks.map((block) => {
          if (block.kind === "single") {
            const ex = block.exercise;
            const topIdx = topList.findIndex((e) => e.id === ex.id);
            return (
              <ExerciseToolbarSection
                key={ex.id}
                canMoveUp={!readOnly && topIdx > 0}
                canMoveDown={!readOnly && topIdx < topList.length - 1}
                onMoveUp={() => session.moveExerciseRelative(ex.id, -1)}
                onMoveDown={() => session.moveExerciseRelative(ex.id, 1)}
                onDelete={!readOnly ? () => setConfirm({ kind: "ex", id: ex.id }) : undefined}
              >
                {renderCard(ex)}
                {!readOnly && canHaveChild(ex) ? (
                  <AddChildExerciseForm onAdd={(name) => addChildExercise(ex.id, name)} />
                ) : null}
              </ExerciseToolbarSection>
            );
          }

          const { parent, children } = block;
          const topIdx = topList.findIndex((e) => e.id === parent.id);
          const parentDisplayIdx = exerciseDisplayIndex(workout.exercises, parent.id);
          return (
            <div
              key={parent.id}
              className="sbd-card sbd-card-interactive sbd-exercise-combo space-y-1"
            >
              <ExerciseToolbarSection
                flat
                canMoveUp={!readOnly && topIdx > 0}
                canMoveDown={!readOnly && topIdx < topList.length - 1}
                onMoveUp={() => session.moveExerciseRelative(parent.id, -1)}
                onMoveDown={() => session.moveExerciseRelative(parent.id, 1)}
                onDelete={
                  !readOnly ? () => setConfirm({ kind: "ex", id: parent.id }) : undefined
                }
              >
                {renderCard(parent)}
              </ExerciseToolbarSection>
              {children.map((child) => (
                <div key={child.id} className="sbd-exercise-child">
                  <ExerciseSection
                    onDelete={
                      !readOnly ? () => setConfirm({ kind: "ex", id: child.id }) : undefined
                    }
                  >
                    {renderCard(child, { child: true, parentIndex: parentDisplayIdx })}
                  </ExerciseSection>
                </div>
              ))}
              {!readOnly ? (
                <div className="px-3 pb-2 pt-1 sm:px-4">
                  <AddChildExerciseForm onAdd={(name) => addChildExercise(parent.id, name)} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {!readOnly ? <WorkoutAddExercisePanel {...session} /> : null}
    </div>
  );
}
