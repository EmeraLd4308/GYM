import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { EmptyStateCallout } from "@/components/EmptyStateCallout";
import { TrainingCalendar } from "@/components/TrainingCalendar";
import { formatDateForInput } from "@/lib/date-local";
import { inferWorkoutTagFromExercises, strongerWorkoutTag } from "@/lib/workout-tags";
import { sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";
const btnPrimary =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/25 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#c41a21] hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.98]";
const btnGhost =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-semibold text-zinc-200 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] active:translate-y-0 active:scale-[0.98]";

export default async function CalendarPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [profileMax, workouts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
    }),
    prisma.workout.findMany({
      where: { userId: user.id },
      select: {
        date: true,
        autoTag: true,
        exercises: {
          select: {
            baseLift: true,
            sets: { select: { weightKg: true, reps: true, isWarmup: true } },
          },
        },
      },
    }),
  ]);
  const maxes = sbdMaxKgFromUserRow(profileMax);

  const workoutDayKeys = [
    ...new Set(workouts.map((w) => formatDateForInput(w.date.toISOString()))),
  ];
  const dayTagByKey: Record<string, "HEAVY" | "MEDIUM" | "LIGHT"> = {};
  for (const w of workouts) {
    const key = formatDateForInput(w.date.toISOString());
    const inferred = inferWorkoutTagFromExercises(w.exercises, maxes);
    const displayTag = inferred ?? w.autoTag;
    if (!displayTag) continue;
    const next = strongerWorkoutTag(dayTagByKey[key], displayTag);
    if (next) dayTagByKey[key] = next;
  }

  return (
    <div className="sbd-stagger-children space-y-6">
      <p className="max-w-2xl text-zinc-500">
        Календар за датою тренування: дні з записом підсвічені; натисни на такий день, щоб відкрити
        тренування. Можна гортати місяці.
      </p>

      {workoutDayKeys.length === 0 ? (
        <div className="sbd-card rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-6 sm:p-8">
          <EmptyStateCallout
            title="Календар чекає на перші тренування"
            description="Як тільки зʼявиться запис з датою, відповідний день підсвітиться. Можна гортати місяці й відкривати день одним тапом."
            nextSteps={[
              "Головне — додати хоча б одне тренування з датою.",
              "Максимуми в профілі не обовʼязкові для календаря; вони потрібні для RPE і GL.",
            ]}
          >
            <Link href="/workouts/new" className={btnPrimary}>
              Додати тренування
            </Link>
            <Link
              href="/profile"
              className="text-center text-sm font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              Відкрити профіль (максимуми за бажанням)
            </Link>
          </EmptyStateCallout>
        </div>
      ) : null}

      <TrainingCalendar workoutDayKeys={workoutDayKeys} dayTagByKey={dayTagByKey} />
    </div>
  );
}
