"use client";

import { useCallback, useEffect, useState } from "react";
import { WorkoutSession } from "@/features/workouts/components/WorkoutSession";
import { WorkoutRestTimer } from "@/features/workouts/components/WorkoutRestTimer";
import type { CachedWorkoutRow } from "@/shared/lib/offline-workouts-db";
import {
  anchorOfflineWeek,
  getOfflineWeekMeta,
  listCachedWorkoutsForOfflineWeek,
} from "@/shared/lib/offline-workouts-db";
import { uiButtonGhostClass, uiButtonPrimarySmClass } from "@/shared/ui/styles";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function OfflineWorkoutsModal({ open, onClose }: Props) {
  const [rows, setRows] = useState<CachedWorkoutRow[]>([]);
  const [weekLabel, setWeekLabel] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewPayload, setViewPayload] = useState<CachedWorkoutRow["payload"] | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!navigator.onLine) {
        await anchorOfflineWeek();
      }
      const meta = await getOfflineWeekMeta();
      if (meta) {
        setWeekLabel(`${meta.weekStart} — ${meta.weekEnd}`);
      }
      const list = await listCachedWorkoutsForOfflineWeek();
      setRows(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void refresh();
    setViewId(null);
    setViewPayload(null);
  }, [open, refresh]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9990] flex flex-col bg-[var(--sbd-bg)]"
      role="dialog"
      aria-modal
      aria-labelledby="offline-workouts-title"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--sbd-border)] px-4 py-3">
        <div className="min-w-0">
          <h2 id="offline-workouts-title" className="font-display text-lg font-bold text-[var(--sbd-text)]">
            {viewId ? "Тренування (офлайн)" : "Тренування тижня"}
          </h2>
          {weekLabel ? (
            <p className="text-xs text-[var(--sbd-muted)]">Тиждень: {weekLabel}</p>
          ) : null}
        </div>
        <button type="button" className={uiButtonGhostClass} onClick={viewId ? () => setViewId(null) : onClose}>
          {viewId ? "Назад" : "Закрити"}
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {viewId && viewPayload ? (
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/90">
              Офлайн-перегляд. Редагування недоступне без інтернету.
            </p>
            <WorkoutRestTimer />
            <div className="mt-6">
              <WorkoutSession workoutId={viewId} initialWorkout={viewPayload} readOnly />
            </div>
          </div>
        ) : loading ? (
          <p className="text-sm text-[var(--sbd-muted)]">Завантаження кешу…</p>
        ) : rows.length === 0 ? (
          <div className="space-y-3 text-sm text-[var(--sbd-muted)]">
            <p>Немає збережених тренувань цього тижня.</p>
            <p>Підключись до інтернету і відкрий тренування — вони зʼявляться тут для офлайн-перегляду.</p>
          </div>
        ) : (
          <ul className="mx-auto max-w-lg space-y-2">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="sbd-card w-full rounded-xl border border-[var(--sbd-border)] px-4 py-3 text-left transition hover:border-[var(--sbd-red)]/35"
                  onClick={() => {
                    setViewId(r.id);
                    setViewPayload(r.payload);
                  }}
                >
                  <span className="block font-semibold text-[var(--sbd-text)]">
                    {r.title ?? "Тренування"}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--sbd-muted)]">{r.dateKey}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!viewId && rows.length > 0 ? (
        <footer className="shrink-0 border-t border-[var(--sbd-border)] p-4">
          <button type="button" className={uiButtonPrimarySmClass} onClick={() => void refresh()}>
            Оновити список
          </button>
        </footer>
      ) : null}
    </div>
  );
}
