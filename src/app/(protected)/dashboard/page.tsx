import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { formatDateForInput, todayDateInput } from "@/lib/date-local";
import { DashboardDuplicateActions } from "@/components/DashboardDuplicateActions";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const recent = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 16,
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  const todayStr = todayDateInput();
  const todayWorkouts = recent.filter((w) => formatDateForInput(w.date.toISOString()) === todayStr);
  const todayIds = new Set(todayWorkouts.map((w) => w.id));
  const otherRecent = recent.filter((w) => !todayIds.has(w.id)).slice(0, 6);

  function workoutRow(w: (typeof recent)[0]) {
    const sets = w.exercises.flatMap((e) => e.sets);
    return (
      <li key={w.id}>
        <Link
          href={`/workouts/${w.id}`}
          className="flex flex-col gap-1 px-4 py-4 transition-colors duration-200 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="font-medium text-zinc-100">{w.title ?? "Тренування"}</span>
          <span className="text-sm text-zinc-500">
            {new Date(w.date).toLocaleDateString("uk-UA", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · підходів: {sets.length}
          </span>
        </Link>
      </li>
    );
  }

  const hasAnyWorkout = recent.length > 0;

  return (
    <div className="space-y-8 md:space-y-10">
      {!hasAnyWorkout ? (
        <div className="sbd-card rounded-2xl border border-[#e31e24]/20 bg-[#e31e24]/[0.06] p-6 text-center sm:p-8">
          <p className="font-display text-lg font-semibold text-white">Почнімо з першого тренування</p>
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
                <Link href="/workouts/new" className="font-medium text-[#e31e24] underline-offset-2 hover:underline">
                  нове тренування
                </Link>
                .
              </div>
            ) : (
              <ul className="sbd-card sbd-card-interactive divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
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
                Інших записів ще немає — див. блок вище або «Тренування» внизу.
              </div>
            ) : otherRecent.length === 0 ? (
              <div className="sbd-card rounded-xl p-6 text-sm text-zinc-500">
                Інших нещодавніх у списку немає — глянь «Сьогодні» або календар.
              </div>
            ) : (
              <ul className="sbd-card sbd-card-interactive divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
                {otherRecent.map(workoutRow)}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
