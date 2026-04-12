"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StatsFilterOptions } from "@/lib/stats-filters";
import { workoutListQueryString } from "@/lib/workout-list-where";
import { workoutListPageSizeOptionsForTotal } from "@/lib/workout-list-page-size";

const btn =
  "inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10";

const selectClass =
  "min-h-[44px] min-w-[4.5rem] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15";

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
  const router = useRouter();

  const hrefPage = (p: number) => {
    const s = workoutListQueryString(filters, p, pageSize);
    return s ? `/workouts?${s}` : "/workouts";
  };

  const applyPageSize = (nextSize: number) => {
    const s = workoutListQueryString(filters, 1, nextSize);
    router.push(s ? `/workouts?${s}` : "/workouts");
  };

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIdx = Math.min(page * pageSize, total);
  const sizeOptions = workoutListPageSizeOptionsForTotal(total);
  const showSizeSelect = sizeOptions.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-zinc-500">
          {total === 0 ? (
            "Записів немає"
          ) : (
            <>
              Показано <span className="text-zinc-400">{fromIdx}</span>
              {" — "}
              <span className="text-zinc-400">{toIdx}</span> з{" "}
              <span className="text-zinc-400">{total}</span>
              {totalPages > 1 ? (
                <>
                  {" · "}
                  сторінка {page} з {totalPages}
                </>
              ) : null}
            </>
          )}
        </p>

        {showSizeSelect ? (
          <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-xs font-medium text-zinc-500">На сторінці</span>
            <select
              className={selectClass}
              value={String(pageSize)}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (Number.isFinite(n)) applyPageSize(n);
              }}
              aria-label="Кількість записів на сторінці"
            >
              {sizeOptions.map((ps) => (
                <option key={ps} value={String(ps)}>
                  {ps}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          {prev != null ? (
            <Link href={hrefPage(prev)} className={btn}>
              Попередня
            </Link>
          ) : (
            <span className={`${btn} pointer-events-none opacity-40`} aria-disabled>
              Попередня
            </span>
          )}
          {next != null ? (
            <Link href={hrefPage(next)} className={btn}>
              Наступна
            </Link>
          ) : (
            <span className={`${btn} pointer-events-none opacity-40`} aria-disabled>
              Наступна
            </span>
          )}
          {totalPages > 2 ? (
            <div className="ml-auto flex flex-wrap gap-2 text-xs">
              <Link
                href={hrefPage(1)}
                className="rounded-md px-2 py-1.5 font-medium text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
              >
                На початок
              </Link>
              <Link
                href={hrefPage(totalPages)}
                className="rounded-md px-2 py-1.5 font-medium text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
              >
                В кінець
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
