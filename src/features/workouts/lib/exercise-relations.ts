import type { ExerciseRow } from "@/features/workouts/lib/workout-session-types";

function isTopLevelExercise(ex: Pick<ExerciseRow, "parentId">): boolean {
  return ex.parentId == null;
}

export function canHaveChild(ex: Pick<ExerciseRow, "baseLift" | "parentId">): boolean {
  return ex.parentId == null && ex.baseLift !== "NONE";
}

export function childrenOf(exercises: ExerciseRow[], parentId: string): ExerciseRow[] {
  return exercises.filter((e) => e.parentId === parentId);
}

export function topLevelExercises(exercises: ExerciseRow[]): ExerciseRow[] {
  return exercises.filter(isTopLevelExercise);
}

export type ExerciseBlock =
  | { kind: "single"; exercise: ExerciseRow }
  | { kind: "combo"; parent: ExerciseRow; children: ExerciseRow[] };

export function buildExerciseBlocks(exercises: ExerciseRow[]): ExerciseBlock[] {
  const sorted = [...exercises].sort((a, b) => a.sortOrder - b.sortOrder);
  const top = sorted.filter(isTopLevelExercise);
  const blocks: ExerciseBlock[] = [];

  for (const ex of top) {
    const kids = sorted.filter((c) => c.parentId === ex.id);
    if (kids.length > 0) {
      blocks.push({ kind: "combo", parent: ex, children: kids });
    } else {
      blocks.push({ kind: "single", exercise: ex });
    }
  }
  return blocks;
}

export function exerciseDisplayIndex(exercises: ExerciseRow[], exerciseId: string): number {
  const top = topLevelExercises([...exercises].sort((a, b) => a.sortOrder - b.sortOrder));
  const idx = top.findIndex((e) => e.id === exerciseId);
  return idx >= 0 ? idx : 0;
}
