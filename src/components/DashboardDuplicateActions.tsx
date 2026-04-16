"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayDateInput } from "@/lib/date-local";
import { useToast } from "@/components/ToastProvider";

const btn =
  "min-h-[44px] touch-manipulation rounded-lg border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_55%,transparent)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[var(--sbd-text)] transition hover:bg-[color-mix(in_oklab,var(--sbd-card)_75%,transparent)]";

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
    router.refresh();
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

      <div className="border-t border-[var(--sbd-border)] px-5 pb-5 pt-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-xs text-[var(--sbd-muted)]" htmlFor="dup-from">
              Від (дата джерела)
            </label>
            <input
              id="dup-from"
              type="date"
              className="mt-1 w-full rounded-md border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-3 py-2 text-sm text-[var(--sbd-text)]"
              value={sourceDay}
              onChange={(e) => setSourceDay(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-[var(--sbd-muted)]" htmlFor="dup-to">
              На дату
            </label>
            <input
              id="dup-to"
              type="date"
              className="mt-1 w-full rounded-md border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-3 py-2 text-sm text-[var(--sbd-text)]"
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="button" className={btn} onClick={duplicateFromDayToDay}>
              Копіювати
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
