"use client";

import { useMemo, useState } from "react";
import { calendarWeekBounds, shiftCalendarWeek } from "@/shared/lib/calendar-week";
import { parseWorkoutDateInput } from "@/shared/lib/date-local";
import { formatWeekRangeLabel } from "@/features/workouts/lib/week-program-text";
import { useToast } from "@/shared/shell/ToastProvider";
import {
  uiBtnRowClass,
  uiBtnRowMobileStackClass,
  uiButtonGhostSmClass,
  uiButtonPrimaryClass,
  uiChipClass,
  uiDateClass,
  uiLabelClass,
  uiMutedTextClass,
} from "@/shared/ui/styles";

const detailsShell =
  "group sbd-card overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-lg shadow-black/30 transition-[box-shadow,transform] duration-300 open:scale-[1.002] open:shadow-xl open:shadow-black/40 motion-reduce:open:scale-100";

const chip = uiChipClass;
const chipActive =
  "border-[color-mix(in_oklab,var(--sbd-red),transparent_52%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_82%)] text-[var(--sbd-text)] shadow-inner shadow-black/20";

function noonDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function formatLocalDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function WeekProgramCopyPanel() {
  const { success, error } = useToast();
  const [anchor, setAnchor] = useState(() => noonDate(new Date()));
  const [busy, setBusy] = useState(false);

  const { weekStart, weekEnd } = useMemo(() => calendarWeekBounds(anchor), [anchor]);
  const rangeLabel = formatWeekRangeLabel(weekStart, weekEnd);
  const isCurrentWeek = useMemo(() => {
    const now = calendarWeekBounds(new Date());
    return weekStart === now.weekStart;
  }, [weekStart]);

  async function copyWeekProgram() {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/workouts/week-program-text?week=${encodeURIComponent(weekStart)}`,
        { credentials: "same-origin" },
      );
      if (!res.ok) {
        let msg = "Не вдалося сформувати план.";
        try {
          const j = (await res.json()) as { error?: string };
          if (typeof j.error === "string") msg = j.error;
        } catch {
          /* plain text */
        }
        error(msg);
        return;
      }
      const text = await res.text();
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success("План скопійовано. Встав у чат або нотатку.");
        return;
      }
      error("Немає доступу до буфера обміну на цьому пристрої.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className={detailsShell}>
      <summary className="cursor-pointer list-none px-4 py-3.5 marker:content-none sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[#e31e24]/90">
            Поділитися планом
          </span>
          <span className="shrink-0 text-zinc-500 transition group-open:rotate-180" aria-hidden>
            ▼
          </span>
        </span>
      </summary>
      <div className="space-y-4 border-t border-white/[0.06] p-4 sm:p-5">
        <p className={`${uiMutedTextClass} text-sm leading-relaxed`}>
          Сформує текстовий план обраного тижня: назви тренувань, дати та вправи — без підходів
          і ваг. Зручно для надсилання комусь.
        </p>

        <div>
          <p className={`${uiLabelClass} mb-1`}>Тиждень плану</p>
          <p className="font-display text-base font-semibold text-[var(--sbd-text)] sm:text-lg">
            {rangeLabel}
          </p>
        </div>

        <div className={uiBtnRowMobileStackClass}>
          <button
            type="button"
            className={uiButtonGhostSmClass}
            onClick={() => setAnchor((d) => shiftCalendarWeek(d, -1))}
          >
            ← Попередній
          </button>
          <button
            type="button"
            className={`${chip} ${isCurrentWeek ? chipActive : ""}`}
            onClick={() => setAnchor(noonDate(new Date()))}
          >
            Цей тиждень
          </button>
          <button
            type="button"
            className={uiButtonGhostSmClass}
            onClick={() => setAnchor((d) => shiftCalendarWeek(d, 1))}
          >
            Наступний →
          </button>
        </div>

        <div>
          <label className={`${uiLabelClass} mb-1.5 block`} htmlFor="week-program-date">
            Або вкажи будь-яку дату в тижні
          </label>
          <input
            id="week-program-date"
            type="date"
            className={uiDateClass}
            value={formatLocalDateForInput(anchor)}
            onChange={(e) => {
              if (!e.target.value) return;
              setAnchor(parseWorkoutDateInput(e.target.value));
            }}
          />
        </div>

        <div className={uiBtnRowClass}>
          <button
            type="button"
            disabled={busy}
            className={`${uiButtonPrimaryClass} min-h-11 w-full sm:w-auto`}
            onClick={() => void copyWeekProgram()}
          >
            {busy ? "Готуємо…" : "Скопіювати план"}
          </button>
        </div>
      </div>
    </details>
  );
}
