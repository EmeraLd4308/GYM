import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/shared/lib/auth";
import { parseStatsFiltersFromSearchParams } from "@/features/stats/lib/stats-filters";
import { workoutListQueryString } from "@/features/workouts/lib/workout-list-where";
import { parseWorkoutListPageSize } from "@/features/workouts/lib/workout-list-page-size";
import { EmptyStateCallout } from "@/shared/ui/EmptyStateCallout";
import { WorkoutListFilters } from "@/features/workouts/components/WorkoutListFilters";
import { WorkoutListPagination } from "@/features/workouts/components/WorkoutListPagination";
import { workoutTagBadgeClass, workoutTagLabelUk } from "@/features/workouts/lib/workout-tags";
import { uiButtonPrimaryClass, uiButtonPrimaryLgClass } from "@/shared/ui/styles";
import {
  ensureWorkoutTagsScheduled,
  getWorkoutsListPageData,
} from "@/server/queries/workouts-list";

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

  await ensureWorkoutTagsScheduled(user.id);

  const sp = await searchParams;
  const filters = parseStatsFiltersFromSearchParams(
    sp as Record<string, string | string[] | undefined>,
  );
  const page = Math.max(1, parseInt(getParam(sp, "page") ?? "1", 10) || 1);
  const pageSize = parseWorkoutListPageSize(getParam(sp, "pageSize"));

  const {
    workoutsWithTag,
    total,
    totalPages,
    safePage,
    filteredOutAll,
    pagePastEnd,
  } = await getWorkoutsListPageData(user.id, filters, page, pageSize);

  if (page !== safePage) {
    const qs = workoutListQueryString(filters, safePage, pageSize);
    redirect(qs ? `/workouts?${qs}` : "/workouts");
  }

  return (
    <div className="sbd-stagger-children space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-[var(--sbd-text)] md:text-4xl">
            Усі тренування
          </h1>
        </div>
        <Link href="/workouts/new" className={uiButtonPrimaryClass}>
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
              description="Повернись на початок списку."
            >
              <Link href="/workouts" className={uiButtonPrimaryLgClass}>
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
              description="Спробуй скинути фільтри."
            >
              <Link href="/workouts" className={uiButtonPrimaryLgClass}>
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
              description="Створи перше тренування — додай вправи та підходи."
            >
              <Link href="/workouts/new" className={uiButtonPrimaryLgClass}>
                Нове тренування
              </Link>
              <Link
                href="/profile"
                className="text-center text-sm font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline sm:text-left"
              >
                Максимуми в профілі
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
