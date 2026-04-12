import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { effectiveCalendarDayFromRequest } from "@/lib/calendar-day-cookie";
import { localDayBoundsFromInput } from "@/lib/date-local";
import { DashboardDuplicateActions } from "@/components/DashboardDuplicateActions";
import { DashboardQuickGuide } from "@/components/DashboardQuickGuide";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";

function positiveKg(v: unknown): boolean {
  if (v == null) return false;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0;
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const listSelect = {
    id: true,
    title: true,
    date: true,
    exercises: {
      select: {
        _count: { select: { sets: true } },
      },
    },
  } as const;

  const todayStr = await effectiveCalendarDayFromRequest();
  const { start: todayStart, end: todayEnd } = localDayBoundsFromInput(todayStr);

  const [todayWorkouts, recent, profileRow, workoutTotal] = await Promise.all([
    prisma.workout.findMany({
      where: {
        userId: user.id,
        date: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { date: "asc" },
      select: listSelect,
    }),
    prisma.workout.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 12,
      select: listSelect,
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        glBodyweightKg: true,
        glMaxSquatKg: true,
        glMaxBenchKg: true,
        glMaxDeadliftKg: true,
      },
    }),
    prisma.workout.count({ where: { userId: user.id } }),
  ]);

  const profileDone = Boolean(
    profileRow &&
    (positiveKg(profileRow.glBodyweightKg) ||
      positiveKg(profileRow.glMaxSquatKg) ||
      positiveKg(profileRow.glMaxBenchKg) ||
      positiveKg(profileRow.glMaxDeadliftKg)),
  );
  const hasWorkout = workoutTotal > 0;

  const todayIds = new Set(todayWorkouts.map((w) => w.id));
  const otherRecent = recent.filter((w) => !todayIds.has(w.id)).slice(0, 3);

  function workoutRow(w: (typeof recent)[0]) {
    const setCount = w.exercises.reduce((acc, e) => acc + e._count.sets, 0);
    return (
      <li key={w.id}>
        <Link
          href={`/workouts/${w.id}`}
          className="sbd-workout-row-link flex flex-col gap-0.5 px-4 py-3.5 transition-colors duration-200 hover:bg-white/[0.04] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-4"
        >
          <span className="min-w-0 font-semibold text-[var(--sbd-text)]">{w.title ?? "Тренування"}</span>
          <span className="shrink-0 text-sm text-[var(--sbd-muted)] sm:text-right">
            {new Date(w.date).toLocaleDateString("uk-UA", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · підходів: {setCount}
          </span>
        </Link>
      </li>
    );
  }

  const hasAnyWorkout = todayWorkouts.length > 0 || recent.length > 0;

  return (
    <div className="space-y-8 md:space-y-10">
      <DashboardQuickGuide />

      <OnboardingChecklist profileDone={profileDone} hasWorkout={hasWorkout} />

      {!hasAnyWorkout ? (
        <div className="sbd-card rounded-2xl border border-[#e31e24]/20 bg-[#e31e24]/[0.06] p-6 text-center sm:p-8">
          <p className="font-display text-lg font-semibold text-[var(--sbd-text)]">
            Почнімо з першого тренування
          </p>
          <p className="mt-2 text-sm text-zinc-400">Натисни — відкриється запис підходів і ваги.</p>
          <Link
            href="/workouts/new"
            className="mt-5 inline-flex min-h-[52px] w-full max-w-xs touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-6 text-base font-bold text-white shadow-lg shadow-red-950/30 active:bg-[#a0151a] sm:w-auto"
          >
            Додати тренування
          </Link>
        </div>
      ) : null}

      {hasAnyWorkout ? (
        <>
          <section>
            <h2 className="font-display mb-3 text-base font-bold uppercase tracking-wide text-zinc-300 md:mb-4 md:text-lg">
              Сьогодні
            </h2>
            {todayWorkouts.length === 0 ? (
              <div className="sbd-card rounded-xl p-5 text-sm text-zinc-500 md:p-6">
                Сьогодні ще порожньо. Нижче — копія з іншої дати або{" "}
                <Link
                  href="/workouts/new"
                  className="font-medium text-[#e31e24] underline-offset-2 hover:underline"
                >
                  нове тренування
                </Link>
                .
              </div>
            ) : (
              <ul className="sbd-card sbd-card-interactive sbd-workout-rows divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
                {todayWorkouts.map(workoutRow)}
              </ul>
            )}
          </section>

          <DashboardDuplicateActions />

          <section>
            <h2 className="font-display mb-3 text-base font-bold uppercase tracking-wide text-zinc-300 md:mb-4 md:text-lg">
              Останні тренування
            </h2>
            {otherRecent.length === 0 && todayWorkouts.length === 0 ? (
              <div className="sbd-card rounded-xl p-6 text-center text-sm text-zinc-500 md:p-8">
                Інших записів ще немає — див. блок вище або «Журнал» у нижній панелі.
              </div>
            ) : otherRecent.length === 0 ? (
              <div className="sbd-card rounded-xl p-6 text-sm text-zinc-500">
                Інших нещодавніх у списку немає — глянь «Сьогодні» або календар.
              </div>
            ) : (
              <ul className="sbd-card sbd-card-interactive sbd-workout-rows divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
                {otherRecent.map(workoutRow)}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
