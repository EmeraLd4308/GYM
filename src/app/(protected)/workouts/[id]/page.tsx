import { notFound } from "next/navigation";
import { getSessionUser } from "@/shared/lib/auth";
import { WorkoutSession } from "@/features/workouts/components/WorkoutSession";
import { getWorkoutSessionPayload } from "@/server/queries/workout-detail";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;
  const initialWorkout = await getWorkoutSessionPayload(user.id, id);
  if (!initialWorkout) notFound();

  return (
    <div className="space-y-6">
      <p className="text-[var(--sbd-muted)]">
        Дату можна змінити в будь-який момент — статистика йде за обраним днем. Вага довільна;
        розминка не входить у базові графіки.
      </p>
      <WorkoutSession workoutId={id} initialWorkout={initialWorkout} />
    </div>
  );
}
