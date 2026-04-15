"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { uk } from "date-fns/locale/uk";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { workoutTagLabelUk } from "@/lib/workout-tags";

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
type DayTag = "HEAVY" | "MEDIUM" | "LIGHT";

function tagCellClass(tag: DayTag | undefined): string {
  if (tag === "HEAVY") {
    return "border-[#e31e24]/50 bg-[#e31e24]/18 text-white shadow-[0_0_0_1px_rgba(227,30,36,0.24)]";
  }
  if (tag === "MEDIUM") {
    return "border-amber-400/45 bg-amber-400/12 text-amber-100 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]";
  }
  if (tag === "LIGHT") {
    return "border-emerald-400/45 bg-emerald-400/12 text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.2)]";
  }
  return "border-white/[0.06] bg-black/25 text-zinc-500";
}

function workoutNoTagCellClass(): string {
  return "border-zinc-500/45 bg-zinc-500/15 text-zinc-700 dark:text-zinc-200 shadow-[0_0_0_1px_rgba(113,113,122,0.28)]";
}

export function TrainingCalendar({
  workoutDayKeys,
  dayTagByKey,
}: {
  workoutDayKeys: string[];
  dayTagByKey?: Record<string, DayTag>;
}) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [openingDay, setOpeningDay] = useState<string | null>(null);
  const router = useRouter();
  const { error: toastError } = useToast();

  const trained = useMemo(() => new Set(workoutDayKeys), [workoutDayKeys]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const today = new Date();

  async function openWorkoutForDay(dayKey: string) {
    setOpeningDay(dayKey);
    try {
      const res = await fetch(`/api/workouts/by-date?day=${encodeURIComponent(dayKey)}`);
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Не вдалося відкрити тренування.";
        toastError(msg);
        return;
      }
      const id =
        data &&
        typeof data === "object" &&
        "workout" in data &&
        (data as { workout: { id: string } | null }).workout
          ? (data as { workout: { id: string } | null }).workout?.id
          : undefined;
      if (id) router.push(`/workouts/${id}`);
      else toastError("За цим днем тренування не знайдено.");
    } finally {
      setOpeningDay(null);
    }
  }

  return (
    <div className="sbd-card rounded-xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
          {format(viewMonth, "LLLL yyyy", { locale: uk })}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="min-h-[40px] rounded-md border border-white/12 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
          >
            ←
          </button>
          <button
            type="button"
            className="min-h-[40px] rounded-md border border-white/12 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            onClick={() => setViewMonth(startOfMonth(new Date()))}
          >
            Сьогодні
          </button>
          <button
            type="button"
            className="min-h-[40px] rounded-md border border-white/12 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-xs">
        {weekdayLabels.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, today);
          const hasWorkout = trained.has(key);
          const tag = dayTagByKey?.[key];
          const cellClass = `flex aspect-square min-h-[36px] w-full flex-col items-center justify-center rounded-lg border text-xs sm:min-h-[44px] ${
            !inMonth
              ? "border-transparent text-zinc-600 opacity-40"
              : hasWorkout
                ? tag
                  ? tagCellClass(tag)
                  : workoutNoTagCellClass()
                : tagCellClass(undefined)
          } ${isToday && inMonth ? "ring-1 ring-[#e31e24]/60" : ""}`;
          const busy = openingDay === key;

          if (hasWorkout) {
            return (
              <button
                key={key}
                type="button"
                disabled={busy}
                aria-label={`Відкрити тренування за ${format(day, "d MMMM yyyy", { locale: uk })}${tag ? `, інтенсивність: ${workoutTagLabelUk(tag)}` : ", інтенсивність: без визначення"}`}
                className={`${cellClass} touch-manipulation transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e31e24]/70 disabled:opacity-60`}
                onClick={() => void openWorkoutForDay(key)}
              >
                <span className={`font-semibold ${inMonth ? "text-zinc-100" : ""}`}>
                  {format(day, "d")}
                </span>
              </button>
            );
          }

          return (
            <div key={key} className={cellClass}>
              <span className={`font-semibold ${inMonth ? "text-zinc-100" : ""}`}>
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-[#e31e24]/45 bg-[#e31e24]/18" /> Є
          тренування (важке)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-amber-400/45 bg-amber-400/12" />{" "}
          тренування (середнє)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-emerald-400/45 bg-emerald-400/12" />{" "}
          тренування (легке)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-zinc-500/45 bg-zinc-500/15" /> тренування
          (складність невідома)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-white/[0.06] bg-black/25" /> Без запису
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-white/[0.06] ring-1 ring-[#e31e24]/60" />{" "}
          Сьогодні
        </span>
      </div>
    </div>
  );
}
