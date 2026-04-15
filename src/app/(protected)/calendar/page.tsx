import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { TrainingCalendar } from "@/components/TrainingCalendar";
import { formatDateForInput } from "@/lib/date-local";
import { inferWorkoutTagFromExercises, strongerWorkoutTag } from "@/lib/workout-tags";
import { sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";

const btnPrimary =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21] active:scale-[0.98]";
const btnGhost =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-semibold text-zinc-200 transition hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 active:scale-[0.98]";

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
    <div className="space-y-6">
      <p className="max-w-2xl text-zinc-500">
        Календар за датою тренування: дні з записом підсвічені; натисни на такий день, щоб відкрити
        тренування. Можна гортати місяці.
      </p>

      {workoutDayKeys.length === 0 ? (
        <div className="sbd-card rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-6 text-center sm:p-8">
          <p className="font-display text-base font-semibold text-white sm:text-lg">
            Поки немає днів з тренуваннями
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Створи перше тренування або заповни максимуми в профілі — календар одразу почне
            підсвічувати дні.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/workouts/new" className={btnPrimary}>
              Нове тренування
            </Link>
            <Link href="/profile" className={btnGhost}>
              Відкрити профіль
            </Link>
          </div>
        </div>
      ) : null}

      <TrainingCalendar workoutDayKeys={workoutDayKeys} dayTagByKey={dayTagByKey} />
    </div>
  );
}
