"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StatsFilterOptions } from "@/features/stats/lib/stats-filters";
import { workoutListQueryString } from "@/features/workouts/lib/workout-list-where";
import { workoutListPageSizeOptionsForTotal } from "@/features/workouts/lib/workout-list-page-size";

import {
  uiButtonGhostSmClass,
  uiMutedTextClass,
  uiSelectClass,
} from "@/shared/ui/styles";

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
        <p className={`text-xs leading-relaxed ${uiMutedTextClass}`}>
          {total === 0 ? (
            "Записів немає"
          ) : (
            <>
              Показано <span className="text-[var(--sbd-text)]">{fromIdx}</span>
              {" — "}
              <span className="text-[var(--sbd-text)]">{toIdx}</span> з{" "}
              <span className="text-[var(--sbd-text)]">{total}</span>
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
            <span className={`text-xs font-medium ${uiMutedTextClass}`}>На сторінці</span>
            <select
              className={`${uiSelectClass} min-w-[4.5rem]`}
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
            <Link href={hrefPage(prev)} className={uiButtonGhostSmClass}>
              Попередня
            </Link>
          ) : (
            <span className={`${uiButtonGhostSmClass} pointer-events-none opacity-40`} aria-disabled>
              Попередня
            </span>
          )}
          {next != null ? (
            <Link href={hrefPage(next)} className={uiButtonGhostSmClass}>
              Наступна
            </Link>
          ) : (
            <span className={`${uiButtonGhostSmClass} pointer-events-none opacity-40`} aria-disabled>
              Наступна
            </span>
          )}
          {totalPages > 2 ? (
            <div className="ml-auto flex flex-wrap gap-2 text-xs">
              <Link
                href={hrefPage(1)}
                className="sbd-text-link rounded-md px-2 py-1.5 text-xs font-medium"
              >
                На початок
              </Link>
              <Link
                href={hrefPage(totalPages)}
                className="sbd-text-link rounded-md px-2 py-1.5 text-xs font-medium"
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
