import type { BaseLift } from "@prisma/client";

export const BASE_LIFT_OPTIONS: { value: BaseLift; label: string }[] = [
  { value: "NONE", label: "Не базова" },
  { value: "BENCH", label: "Жим" },
  { value: "SQUAT", label: "Присяд" },
  { value: "DEADLIFT", label: "Тяга" },
];

export function baseLiftLabel(v: BaseLift): string {
  return BASE_LIFT_OPTIONS.find((o) => o.value === v)?.label ?? v;
}
