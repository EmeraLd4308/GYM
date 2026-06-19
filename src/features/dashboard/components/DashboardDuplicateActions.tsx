"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayDateInput } from "@/shared/lib/date-local";
import { useToast } from "@/shared/shell/ToastProvider";
import { uiButtonPrimaryClass, uiBtnRowStackSmClass, uiDateClass, uiFieldFitClass, uiFormRowClass, uiLabelClass } from "@/shared/ui/styles";

export function DashboardDuplicateActions({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const { error, success } = useToast();
  const [sourceDay, setSourceDay] = useState("");
  const [targetDay, setTargetDay] = useState(() => todayDateInput());

  async function duplicateFromDayToDay() {
    if (!sourceDay.trim() || !targetDay.trim()) {
      error("Обидві дати обов'язкові.");
      return;
    }
    const res = await fetch(`/api/workouts/by-date?day=${encodeURIComponent(sourceDay.trim())}`);
    const data = await res.json();
    if (!res.ok) {
      error(data.error ?? "Помилка.");
      return;
    }
    const found = data.workout as { id: string } | null;
    if (!found) {
      error("Немає тренування на обрану «від» дату.");
      return;
    }
    const dup = await fetch("/api/workouts/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceWorkoutId: found.id, targetDate: targetDay.trim() }),
    });
    const d = await dup.json();
    if (!dup.ok) {
      error(d.error ?? "Не вдалося скопіювати.");
      return;
    }
    success("Тренування скопійовано.");
    router.push(`/workouts/${(d.workout as { id: string }).id}`);
  }

  return (
    <details
      className={
        embedded
          ? "group overflow-hidden border-0 bg-transparent shadow-none"
          : "group sbd-card overflow-hidden rounded-xl"
      }
    >
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--sbd-red)] sm:text-xs">
          Копіювання тренувань
        </h3>
        <span
          className="text-xs text-[var(--sbd-muted)] transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▼
        </span>
      </summary>

      <div className="border-t border-[var(--sbd-border)] px-4 pb-5 pt-4 sm:px-5">
        <div className={uiFormRowClass}>
          <label className={uiFieldFitClass} htmlFor="dup-from">
            <span className={`${uiLabelClass} mb-1 block`}>Від (дата джерела)</span>
            <input
              id="dup-from"
              type="date"
              className={uiDateClass}
              value={sourceDay}
              onChange={(e) => setSourceDay(e.target.value)}
            />
          </label>
          <label className={uiFieldFitClass} htmlFor="dup-to">
            <span className={`${uiLabelClass} mb-1 block`}>На дату</span>
            <input
              id="dup-to"
              type="date"
              className={uiDateClass}
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
            />
          </label>
          <div className={uiBtnRowStackSmClass}>
            <button type="button" className={uiButtonPrimaryClass} onClick={duplicateFromDayToDay}>
              Копіювати
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
