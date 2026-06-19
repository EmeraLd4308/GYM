import type { WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import { putCachedWorkout } from "@/shared/lib/offline-workouts-db";

export async function cacheWorkoutForOffline(payload: WorkoutPayload): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine) return;
  try {
    await putCachedWorkout(payload);
  } catch {
  }
}
