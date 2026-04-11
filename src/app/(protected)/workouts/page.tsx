import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseStatsFiltersFromSearchParams } from "@/lib/stats-filters";
import { workoutListWhere } from "@/lib/workout-list-where";
import { WorkoutListFilters } from "@/components/WorkoutListFilters";
import { WorkoutListPagination } from "@/components/WorkoutListPagination";

const btnPrimary =
  "rounded-md bg-[#e31e24] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21]";
const btnPrimaryLg =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21] active:scale-[0.98]";
const btnGhost =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-semibold text-zinc-200 transition hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 active:scale-[0.98]";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  k: string,
): string | undefined {
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
  const filters = parseStatsFiltersFromSearchParams(
    sp as Record<string, string | string[] | undefined>,
  );
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

  const hasFilters = Boolean(
    filters.dateFrom?.trim() ||
    filters.dateTo?.trim() ||
    filters.weightMin !== undefined ||
    filters.weightMax !== undefined ||
    filters.search?.trim(),
  );

  let anyWorkoutsUnfiltered = 0;
  if (workouts.length === 0) {
    anyWorkoutsUnfiltered = await prisma.workout.count({ where: { userId: user.id } });
  }

  const filteredOutAll = workouts.length === 0 && total === 0 && anyWorkoutsUnfiltered > 0;
  const pagePastEnd = workouts.length === 0 && total > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            Усі тренування
          </h1>
        </div>
        <Link
          href="/workouts/new"
          className={`${btnPrimary} inline-flex min-h-[44px] items-center justify-center`}
        >
          Нове тренування
        </Link>
      </div>

      <WorkoutListFilters />

      {workouts.length === 0 ? (
        <div className="sbd-card rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-6 text-center sm:p-10">
          {pagePastEnd ? (
            <>
              <p className="font-display text-base font-semibold text-white sm:text-lg">
                На цій сторінці записів немає
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Повернись до початку списку або зміни фільтри.
              </p>
            </>
          ) : filteredOutAll ? (
            <>
              <p className="font-display text-base font-semibold text-white sm:text-lg">
                Жодне тренування не підходить
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Спробуй скинути пошук, діапазон дат чи вагу — або створи новий запис.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-base font-semibold text-white sm:text-lg">
                Ще немає тренувань
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Додай перше тренування або відкрий профіль — максимуми знадобляться для статистики
                RPE.
              </p>
            </>
          )}
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {pagePastEnd ? (
              <Link href="/workouts" className={btnPrimaryLg}>
                До списку
              </Link>
            ) : hasFilters ? (
              <Link href="/workouts" className={btnGhost}>
                Скинути фільтри
              </Link>
            ) : null}
            <Link href="/workouts/new" className={btnPrimaryLg}>
              Нове тренування
            </Link>
            <Link href="/profile" className={btnGhost}>
              Відкрити профіль
            </Link>
          </div>
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
