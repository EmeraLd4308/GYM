"use client";

import { useCallback, useEffect, useState } from "react";
import { OfflineWorkoutsModal } from "@/features/workouts/components/OfflineWorkoutsModal";
import type { WorkoutPayload } from "@/features/workouts/lib/workout-session-types";
import {
  anchorOfflineWeek,
  putCachedWorkouts,
} from "@/shared/lib/offline-workouts-db";
import { uiButtonGhostClass } from "@/shared/ui/styles";

export function OfflineWeekProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "ok" | "error">("idle");

  const syncWeek = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncState("syncing");
    try {
      const res = await fetch("/api/workouts/week-cache");
      if (!res.ok) throw new Error("sync failed");
      const data = (await res.json()) as { workouts?: WorkoutPayload[] };
      await anchorOfflineWeek();
      await putCachedWorkouts(data.workouts ?? []);
      setSyncState("ok");
    } catch {
      setSyncState("error");
    }
  }, []);

  useEffect(() => {
    const apply = () => {
      const nowOnline = navigator.onLine;
      setOnline(nowOnline);
      if (!nowOnline) {
        void anchorOfflineWeek();
      }
    };
    apply();
    window.addEventListener("online", apply);
    window.addEventListener("offline", apply);
    return () => {
      window.removeEventListener("online", apply);
      window.removeEventListener("offline", apply);
    };
  }, []);

  useEffect(() => {
    if (online) void syncWeek();
  }, [online, syncWeek]);

  return (
    <>
      {!online ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm">
          <span className="text-amber-100/95">Немає інтернету — доступні тренування цього тижня з кешу.</span>
          <button
            type="button"
            className={`${uiButtonGhostClass} shrink-0 border-amber-500/30 text-amber-50`}
            onClick={() => setModalOpen(true)}
          >
            Відкрити тренування
          </button>
        </div>
      ) : syncState === "error" ? (
        <p className="mb-2 text-xs text-[var(--sbd-muted)]">Не вдалося оновити офлайн-кеш тижня.</p>
      ) : null}
      {children}
      <OfflineWorkoutsModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
