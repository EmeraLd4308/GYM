"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";

const storageKey = (workoutId: string, exerciseId: string) =>
  `sbd-plan-done:${workoutId}:${exerciseId}`;

const migratedFromLs = new Set<string>();

/**
 * «Зроблено з плану» для небазових вправ — зберігається в БД; одноразова міграція з localStorage.
 */
export function ExercisePlanCheck({
  workoutId,
  exerciseId,
  planDone,
  onPlanDoneChange,
}: {
  workoutId: string;
  exerciseId: string;
  planDone: boolean;
  onPlanDoneChange?: (next: boolean) => void;
}) {
  const { error: toastError } = useToast();
  const [done, setDone] = useState(planDone);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setDone(planDone);
  }, [planDone]);

  useEffect(() => {
    const id = `${workoutId}:${exerciseId}`;
    if (migratedFromLs.has(id)) return;
    migratedFromLs.add(id);

    try {
      const k = storageKey(workoutId, exerciseId);
      if (localStorage.getItem(k) !== "1") return;
      localStorage.removeItem(k);
      if (planDone) return;
      void fetch(`/api/workout-exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planDone: true }),
      })
        .then((r) => {
          if (r.ok) {
            setDone(true);
            onPlanDoneChange?.(true);
          }
        })
        .catch(() => {});
    } catch {
      /* private mode */
    }
  }, [workoutId, exerciseId, planDone, onPlanDoneChange]);

  async function toggle() {
    const next = !done;
    setPending(true);
    try {
      const res = await fetch(`/api/workout-exercises/${exerciseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planDone: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося зберегти.");
        return;
      }
      const updated = (data as { exercise?: { planDone?: boolean } }).exercise?.planDone;
      const final = typeof updated === "boolean" ? updated : next;
      setDone(final);
      onPlanDoneChange?.(final);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-3">
      <button
        type="button"
        role="switch"
        aria-busy={pending}
        aria-checked={done}
        disabled={pending}
        onClick={toggle}
        className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e31e24]/35 disabled:opacity-60 md:max-w-md ${
          done
            ? "border-[#e31e24]/45 bg-[#e31e24]/[0.12] shadow-[0_0_24px_-8px_rgba(227,30,36,0.35)]"
            : "border-white/[0.08] bg-black/35 hover:border-white/15 hover:bg-black/45"
        }`}
      >
        <span
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 transition ${
            done
              ? "border-[#e31e24] bg-[#e31e24]/90 text-white shadow-inner shadow-black/20"
              : "border-zinc-600 bg-zinc-900/80 text-transparent group-hover:border-zinc-500"
          }`}
          aria-hidden
        >
          {done ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-200">З плану</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
            Познач для себе, що вправу з плану виконано.
          </span>
        </span>
      </button>
    </div>
  );
}
