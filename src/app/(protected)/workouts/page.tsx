import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseStatsFiltersFromSearchParams } from "@/lib/stats-filters";
import { workoutListWhere } from "@/lib/workout-list-where";
import { WorkoutListFilters } from "@/components/WorkoutListFilters";
import { WorkoutListPagination } from "@/components/WorkoutListPagination";

const btnPrimary =
  "rounded-md bg-[#e31e24] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21]";

function getParam(sp: Record<string, string | string[] | undefined>, k: string): string | undefined {
  const v = sp[k];
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}

export default async function WorkoutsListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const sp = await searchParams;
  const filters = parseStatsFiltersFromSearchParams(sp as Record<string, string | string[] | undefined>);
  const page = Math.max(1, parseInt(getParam(sp, "page") ?? "1", 10) || 1);
  const rawPs = parseInt(getParam(sp, "pageSize") ?? "20", 10);
  const pageSize = Math.min(50, Math.max(1, Number.isFinite(rawPs) ? rawPs : 20));

  const where = workoutListWhere(user.id, filters);
  const [total, workouts] = await prisma.$transaction([
    prisma.workout.count({ where }),
    prisma.workout.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
          select: {
            _count: { select: { sets: true } },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            Усі тренування
          </h1>
        </div>
        <Link href="/workouts/new" className={`${btnPrimary} inline-flex min-h-[44px] items-center justify-center`}>
          Нове тренування
        </Link>
      </div>

      <WorkoutListFilters />

      {workouts.length === 0 ? (
        <div className="sbd-card rounded-xl p-10 text-center text-sm text-zinc-500">
          Немає тренувань за цими умовами. Спробуй змінити фільтри або{" "}
          <Link href="/workouts/new" className="text-[#e31e24] underline-offset-2 hover:underline">
            створити нове
          </Link>
          .
        </div>
      ) : (
        <div className="sbd-card overflow-hidden rounded-xl shadow-2xl shadow-black/50">
          <ul className="divide-y divide-white/[0.06]">
            {workouts.map((w) => {
              const setCount = w.exercises.reduce((acc, e) => acc + e._count.sets, 0);
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
                      · підходів: {setCount}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-white/[0.06] px-4 py-4">
            <WorkoutListPagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              filters={filters}
              total={total}
            />
          </div>
        </div>
      )}
    </div>
  );
}
