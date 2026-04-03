"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayDateInput } from "@/lib/date-local";
import { useToast } from "@/components/ToastProvider";

const btn =
  "min-h-[44px] touch-manipulation rounded-md border border-white/12 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/[0.08]";

export function DashboardDuplicateActions() {
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
    <div className="sbd-card rounded-xl p-5">
      <h3 className="font-display mb-4 text-sm font-bold uppercase tracking-wide text-white">
        Копіювання тренувань
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs text-zinc-500" htmlFor="dup-from">
            Від (дата джерела)
          </label>
          <input
            id="dup-from"
            type="date"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
            value={sourceDay}
            onChange={(e) => setSourceDay(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500" htmlFor="dup-to">
            На дату
          </label>
          <input
            id="dup-to"
            type="date"
            className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
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
  );
}
