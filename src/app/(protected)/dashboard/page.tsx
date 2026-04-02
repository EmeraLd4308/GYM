import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const btnPrimary =
  "rounded-md bg-[#e31e24] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21] active:scale-[0.98]";
const btnGhost =
  "rounded-md border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-300 transition hover:bg-white/[0.07] active:scale-[0.98]";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const recent = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 8,
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
          Головна
        </h1>
        <p className="mt-2 text-zinc-500">Останні тренування та швидкі дії.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/workouts/new" className={btnPrimary}>
          Нове тренування
        </Link>
        <Link href="/templates/new" className={btnGhost}>
          Новий шаблон
        </Link>
        <Link href="/stats" className={btnGhost}>
          Статистика
        </Link>
      </div>

      <section>
        <h2 className="font-display mb-4 text-lg font-bold uppercase tracking-wide text-zinc-300">
          Останні тренування
        </h2>
        {recent.length === 0 ? (
          <div className="sbd-card rounded-xl p-8 text-center text-zinc-500">
            Поки немає записів. Створи перше тренування — кнопка вище.
          </div>
        ) : (
          <ul className="sbd-card sbd-card-interactive divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
            {recent.map((w) => {
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
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
