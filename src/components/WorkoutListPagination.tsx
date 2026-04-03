import Link from "next/link";
import type { StatsFilterOptions } from "@/lib/stats-filters";
import { workoutListQueryString } from "@/lib/workout-list-where";

const btn =
  "inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10";

export function WorkoutListPagination({
  page,
  totalPages,
  pageSize,
  filters,
  total,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  filters: StatsFilterOptions;
  total: number;
}) {
  if (totalPages <= 1) {
    return (
      <p className="border-t border-white/[0.06] pt-4 text-xs text-zinc-500">
        Усього записів: {total}
      </p>
    );
  }

  const href = (p: number) => {
    const s = workoutListQueryString(filters, p, pageSize);
    return s ? `/workouts?${s}` : "/workouts";
  };

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIdx = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-xs text-zinc-500">
        Показано {fromIdx}–{toIdx} з {total} · сторінка {page} з {totalPages}
      </p>
      <div className="flex flex-wrap gap-2">
        {prev != null ? (
          <Link href={href(prev)} className={btn}>
            Назад
          </Link>
        ) : (
          <span className={`${btn} pointer-events-none opacity-40`} aria-disabled>
            Назад
          </span>
        )}
        {next != null ? (
          <Link href={href(next)} className={btn}>
            Далі
          </Link>
        ) : (
          <span className={`${btn} pointer-events-none opacity-40`} aria-disabled>
            Далі
          </span>
        )}
      </div>
    </div>
  );
}
