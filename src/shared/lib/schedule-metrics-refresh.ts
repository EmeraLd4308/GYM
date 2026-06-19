import { after } from "next/server";
import type { BaseLift } from "@prisma/client";
import { recalculateUserLiftRecordForLift, recalculateWorkoutAutoTag } from "@/features/workouts/lib/lift-records";

export function scheduleWorkoutMetricsRefresh(
  userId: string,
  workoutId: string,
  baseLift: BaseLift,
  extraLifts: BaseLift[] = [],
): void {
  const lifts = new Set<BaseLift>([baseLift, ...extraLifts].filter((l) => l !== "NONE"));
  after(async () => {
    try {
      await recalculateWorkoutAutoTag(workoutId);
      await Promise.all(
        [...lifts].map((lift) => recalculateUserLiftRecordForLift(userId, lift)),
      );
    } catch (error) {
      console.error("[metrics-refresh]", error);
    }
  });
}
