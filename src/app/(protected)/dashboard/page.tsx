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

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display mb-4 text-lg font-bold uppercase tracking-wide text-zinc-300">
          Сьогодні
        </h2>
        {todayWorkouts.length === 0 ? (
          <div className="sbd-card rounded-xl p-6 text-sm text-zinc-500">
            На сьогодні ще немає тренування. Створи нове або скопіюй з іншої дати в блоці нижче.
          </div>
        ) : (
          <ul className="sbd-card sbd-card-interactive divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
            {todayWorkouts.map(workoutRow)}
          </ul>
        )}
      </section>

      <DashboardDuplicateActions />

      <section>
        <h2 className="font-display mb-4 text-lg font-bold uppercase tracking-wide text-zinc-300">
          Останні тренування
        </h2>
        {otherRecent.length === 0 && todayWorkouts.length === 0 ? (
          <div className="sbd-card rounded-xl p-8 text-center text-zinc-500">
            Поки немає записів. Створи перше тренування через пункт «Тренування» у меню.
          </div>
        ) : otherRecent.length === 0 ? (
          <div className="sbd-card rounded-xl p-6 text-sm text-zinc-500">
            Інших нещодавніх тренувань у списку немає — переглянь блок «Сьогодні» або календар.
          </div>
        ) : (
          <ul className="sbd-card sbd-card-interactive divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
            {otherRecent.map(workoutRow)}
          </ul>
        )}
      </section>
    </div>
  );
}
