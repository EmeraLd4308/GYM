import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseStatsFiltersFromSearchParams } from "@/lib/stats-filters";
import { workoutListWhere, workoutListQueryString } from "@/lib/workout-list-where";
import { parseWorkoutListPageSize } from "@/lib/workout-list-page-size";
import { EmptyStateCallout } from "@/components/EmptyStateCallout";
import { WorkoutListFilters } from "@/components/WorkoutListFilters";
import { WorkoutListPagination } from "@/components/WorkoutListPagination";
import { workoutTagBadgeClass, workoutTagLabelUk, inferWorkoutTagFromExercises } from "@/lib/workout-tags";
import { sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";
import { recalculateAllWorkoutTagsForUser } from "@/lib/lift-records";
const btnPrimary =
  "inline-flex min-h-11 touch-manipulation items-center justify-center rounded-md bg-[#e31e24] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#c41a21] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.48)] active:translate-y-0";
const btnPrimaryLg =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/25 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#c41a21] hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.98]";
const btnGhost =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-semibold text-zinc-200 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] active:translate-y-0 active:scale-[0.98]";

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

  const missingTags = await prisma.workout.count({
    where: { userId: user.id, autoTag: null },
  });
  if (missingTags > 0) {
    await recalculateAllWorkoutTagsForUser(user.id);
  }

  const sp = await searchParams;
  const filters = parseStatsFiltersFromSearchParams(
    sp as Record<string, string | string[] | undefined>,
  );
  const page = Math.max(1, parseInt(getParam(sp, "page") ?? "1", 10) || 1);
  const pageSize = parseWorkoutListPageSize(getParam(sp, "pageSize"));

  const where = workoutListWhere(user.id, filters);
  const total = await prisma.workout.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  if (page !== safePage) {
    const qs = workoutListQueryString(filters, safePage, pageSize);
    redirect(qs ? `/workouts?${qs}` : "/workouts");
  }

  const [profileMax, workouts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
    }),
    prisma.workout.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
          select: {
            baseLift: true,
            _count: { select: { sets: true } },
            sets: {
              select: { weightKg: true, reps: true, isWarmup: true },
            },
          },
        },
      },
    }),
  ]);
  const maxes = sbdMaxKgFromUserRow(profileMax);
  const workoutsWithTag = workouts.map((w) => {
    const inferred = inferWorkoutTagFromExercises(
      w.exercises.map((ex) => ({
        baseLift: ex.baseLift,
        sets: ex.sets,
      })),
      maxes,
    );
    return { ...w, displayTag: inferred ?? w.autoTag };
  });

  const hasFilters = Boolean(
    filters.dateFrom?.trim() ||
    filters.dateTo?.trim() ||
    filters.weightMin !== undefined ||
    filters.weightMax !== undefined ||
    filters.search?.trim() ||
    filters.tag,
  );

  let anyWorkoutsUnfiltered = 0;
  if (workouts.length === 0) {
    anyWorkoutsUnfiltered = await prisma.workout.count({ where: { userId: user.id } });
  }

  const filteredOutAll = workouts.length === 0 && total === 0 && anyWorkoutsUnfiltered > 0;
  const pagePastEnd = workouts.length === 0 && total > 0;

  return (
    <div className="sbd-stagger-children space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-[var(--sbd-text)] md:text-4xl">
            Усі тренування
          </h1>
        </div>
        <Link href="/workouts/new" className={btnPrimary}>
          Нове тренування
        </Link>
      </div>

      <details className="group sbd-card overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-lg shadow-black/30 transition-[box-shadow,transform] duration-300 open:scale-[1.002] open:shadow-xl open:shadow-black/40 motion-reduce:open:scale-100">
        <summary className="cursor-pointer list-none px-4 py-3.5 marker:content-none sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-3">
            <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[#e31e24]/90">
              Фільтри тренувань
            </span>
            <span className="shrink-0 text-zinc-500 transition group-open:rotate-180" aria-hidden>
              ▼
            </span>
          </span>
        </summary>
        <div className="border-t border-white/[0.06] p-2 sm:p-3">
          <WorkoutListFilters />
        </div>
      </details>

      {workoutsWithTag.length === 0 ? (
        <div className="sbd-card rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-6 sm:p-10">
          {pagePastEnd ? (
            <EmptyStateCallout
              title="Ця сторінка списку порожня"
              description="Номер сторінки був занадто великий — повернись на початок або обери сторінку з пагінації внизу, коли зʼявляться записи."
              nextSteps={["Почни з першої сторінки — там завжди актуальні тренування."]}
            >
              <Link href="/workouts" className={btnPrimaryLg}>
                На початок списку
              </Link>
              <Link
                href="/workouts/new"
                className="text-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline sm:text-left"
              >
                Або створити нове тренування
              </Link>
            </EmptyStateCallout>
          ) : filteredOutAll ? (
            <EmptyStateCallout
              title="За цими фільтрами нічого не знайдено"
              description="Записи є, але жоден не підходить під обрані дату, пошук, вагу чи тег. Скинь фільтри — і одразу побачиш увесь журнал."
              nextSteps={[
                "Відкрий «Фільтри тренувань» вище й прибери зайві умови.",
                "Або натисни скинути — повернеться повний список.",
              ]}
            >
              <Link href="/workouts" className={btnPrimaryLg}>
                Скинути фільтри
              </Link>
              <Link
                href="/workouts/new"
                className="text-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline sm:text-left"
              >
                Додати нове тренування
              </Link>
            </EmptyStateCallout>
          ) : (
            <EmptyStateCallout
              title="У журналі ще нічого немає"
              description="Перший запис займає хвилину: дата, вправи, підходи. Після цього зʼявляться календар, графіки та RPE — точніші, якщо вказати максимуми в профілі."
              nextSteps={[
                "Натисни «Нове тренування» і заповни хоча б одну вправу.",
                "За бажанням: профіль → максимуми SBD для кращих оцінок RPE.",
              ]}
            >
              <Link href="/workouts/new" className={btnPrimaryLg}>
                Нове тренування
              </Link>
              <Link
                href="/profile"
                className="text-center text-sm font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline sm:text-left"
              >
                Максимуми в профілі (для RPE)
              </Link>
            </EmptyStateCallout>
          )}
        </div>
      ) : (
        <div className="sbd-card overflow-hidden rounded-xl shadow-2xl shadow-black/50">
          <ul className="sbd-workout-rows divide-y divide-white/[0.06]">
            {workoutsWithTag.map((w) => {
              const setCount = w.exercises.reduce((acc, e) => acc + e._count.sets, 0);
              return (
                <li key={w.id}>
                  <Link
                    href={`/workouts/${w.id}`}
                    className="sbd-workout-row-link flex flex-col gap-0.5 px-4 py-3.5 transition-colors duration-200 hover:bg-white/[0.04] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-4"
                  >
                    <span className="min-w-0 font-semibold text-[var(--sbd-text)]">
                      <span className="inline-flex items-center gap-2">
                        <span>{w.title ?? "Тренування"}</span>
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${workoutTagBadgeClass(w.displayTag)}`}
                        >
                          {workoutTagLabelUk(w.displayTag)}
                        </span>
                      </span>
                    </span>
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
            })}
          </ul>
          <div className="border-t border-white/[0.06] px-4 py-4">
            <WorkoutListPagination
              page={safePage}
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
