import type { BaseLift } from "@prisma/client";

export type SetRow = {
  id: string;
  sortOrder: number;
  weightKg: string;
  reps: number;
  isWarmup: boolean;
  rpe: string;
};

export type ExerciseRow = {
  id: string;
  sortOrder: number;
  name: string;
  baseLift: BaseLift;
  sets: SetRow[];
};

export type WorkoutPayload = {
  id: string;
  date: string;
  title: string | null;
  notes: string | null;
  exercises: ExerciseRow[];
};

export type WorkoutConfirmState =
  | null
  | { kind: "set"; id: string }
  | { kind: "ex"; id: string }
  | { kind: "wo" };

export function formatWeightForInput(w: unknown): string {
  if (w == null) return "";
  const n = typeof w === "number" ? w : Number(w);
  if (Number.isNaN(n)) return String(w);
  return String(n);
}

export function formatRpeForInput(w: unknown): string {
  if (w == null || w === "") return "";
  const n = typeof w === "number" ? w : Number(w);
  if (!Number.isFinite(n)) return "";
  return String(n);
}

export function mapApiSet(raw: {
  id: string;
  sortOrder: number;
  weightKg: unknown;
  reps: number;
  isWarmup: boolean;
  rpe?: unknown;
}): SetRow {
  return {
    id: raw.id,
    sortOrder: raw.sortOrder,
    weightKg: formatWeightForInput(raw.weightKg),
    reps: raw.reps,
    isWarmup: raw.isWarmup,
    rpe: formatRpeForInput(raw.rpe),
  };
}
