"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_LIFT_OPTIONS, baseLiftLabel } from "@/lib/base-lift";
import type { BaseLift } from "@prisma/client";
import { formatDateForInput } from "@/lib/date-local";

type SetRow = {
  id: string;
  sortOrder: number;
  weightKg: string;
  reps: number;
  isWarmup: boolean;
};

type ExerciseRow = {
  id: string;
  sortOrder: number;
  name: string;
  baseLift: BaseLift;
  sets: SetRow[];
};

type WorkoutPayload = {
  id: string;
  date: string;
  title: string | null;
  exercises: ExerciseRow[];
};

const inp =
  "rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-zinc-100 outline-none focus:border-[#e31e24]/35 focus:ring-1 focus:ring-[#e31e24]/25";

function formatWeightForInput(w: unknown): string {
  if (w == null) return "";
  const n = typeof w === "number" ? w : Number(w);
  if (Number.isNaN(n)) return String(w);
  return String(n);
}

export function WorkoutSession({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newExName, setNewExName] = useState("");
  const [newExBase, setNewExBase] = useState<BaseLift>("NONE");

  const load = useCallback(async () => {
    const res = await fetch(`/api/workouts/${workoutId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Не вдалося завантажити.");
      return;
    }
    const w = data.workout;
    setWorkout({
      id: w.id,
      date: w.date,
      title: w.title,
      exercises: w.exercises.map(
        (ex: {
          id: string;
          sortOrder: number;
          name: string;
          baseLift: BaseLift;
          sets: Array<{
            id: string;
            sortOrder: number;
            weightKg: unknown;
            reps: number;
            isWarmup: boolean;
          }>;
        }) => ({
          ...ex,
          sets: ex.sets.map((s) => ({
            ...s,
            weightKg: formatWeightForInput(s.weightKg),
          })),
        }),
      ),
    });
    setError(null);
  }, [workoutId]);

  useEffect(() => {
    load();
  }, [load]);

  async function patchDate(dateStr: string) {
    const res = await fetch(`/api/workouts/${workoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Не вдалося змінити дату.");
      return;
    }
    await load();
    router.refresh();
  }

  async function addExercise() {
    if (!newExName.trim()) return;
    const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newExName.trim(), baseLift: newExBase }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Помилка.");
      return;
    }
    setNewExName("");
    setNewExBase("NONE");
    await load();
    router.refresh();
  }

  async function addSet(exerciseId: string) {
    const res = await fetch(`/api/workout-exercises/${exerciseId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: 0, reps: 1, isWarmup: false }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Помилка.");
      return;
    }
    await load();
    router.refresh();
  }

  async function updateSet(
    setId: string,
    patch: Partial<{ weightKg: number; reps: number; isWarmup: boolean }>,
  ) {
    const res = await fetch(`/api/sets/${setId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Помилка оновлення.");
      return;
    }
    await load();
  }

  async function deleteSet(setId: string) {
    if (!confirm("Видалити підхід?")) return;
    const res = await fetch(`/api/sets/${setId}`, { method: "DELETE" });
    if (!res.ok) return;
    await load();
    router.refresh();
  }

  async function deleteExercise(exerciseId: string) {
    if (!confirm("Видалити вправу з усіма підходами?")) return;
    const res = await fetch(`/api/workout-exercises/${exerciseId}`, { method: "DELETE" });
    if (!res.ok) return;
    await load();
    router.refresh();
  }

  async function deleteWorkout() {
    if (!confirm("Видалити це тренування повністю? Усі вправи та підходи зникнуть.")) return;
    const res = await fetch(`/api/workouts/${workoutId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Не вдалося видалити.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (error && !workout) {
    return <p className="text-red-400">{error}</p>;
  }
  if (!workout) {
    return <p className="text-zinc-500">Завантаження…</p>;
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="sbd-card rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-white">
            {workout.title ?? "Тренування"}
          </h2>
          <button
            type="button"
            className="min-h-[44px] shrink-0 touch-manipulation rounded-md border border-red-500/40 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/15 active:bg-red-500/25"
            onClick={deleteWorkout}
          >
            Видалити
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="wdate">
            Дата тренування
          </label>
          <input
            id="wdate"
            type="date"
            className="max-w-[200px] rounded-md border border-white/10 bg-black/50 px-3 py-2 text-zinc-100 outline-none focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15"
            value={formatDateForInput(workout.date)}
            onChange={(e) => patchDate(e.target.value)}
          />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {new Date(workout.date).toLocaleDateString("uk-UA", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {workout.exercises.map((ex) => (
        <section
          key={ex.id}
          className="sbd-card sbd-card-interactive rounded-xl p-5"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
                {ex.name}
              </h3>
              <p className="text-xs uppercase tracking-wider text-zinc-600">{baseLiftLabel(ex.baseLift)}</p>
            </div>
            <button
              type="button"
              className="text-xs font-medium uppercase tracking-wide text-red-400/90 hover:text-red-300"
              onClick={() => deleteExercise(ex.id)}
            >
              Видалити вправу
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="py-2 pr-2">Вага (кг)</th>
                  <th className="py-2 pr-2">Повтори</th>
                  <th className="py-2 pr-2">Розминка</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04]">
                    <td className="py-2 pr-2">
                      <input
                        className={`w-28 ${inp}`}
                        value={s.weightKg}
                        inputMode="decimal"
                        onChange={(e) => {
                          const v = e.target.value;
                          setWorkout((w) =>
                            w
                              ? {
                                  ...w,
                                  exercises: w.exercises.map((x) =>
                                    x.id === ex.id
                                      ? {
                                          ...x,
                                          sets: x.sets.map((row) =>
                                            row.id === s.id ? { ...row, weightKg: v } : row,
                                          ),
                                        }
                                      : x,
                                  ),
                                }
                              : w,
                          );
                        }}
                        onBlur={() => {
                          const num = parseFloat(s.weightKg.replace(",", "."));
                          if (!Number.isFinite(num)) return;
                          updateSet(s.id, { weightKg: num });
                        }}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={1}
                        className={`w-24 ${inp}`}
                        value={s.reps}
                        onChange={(e) => {
                          const reps = parseInt(e.target.value, 10) || 1;
                          setWorkout((w) =>
                            w
                              ? {
                                  ...w,
                                  exercises: w.exercises.map((x) =>
                                    x.id === ex.id
                                      ? {
                                          ...x,
                                          sets: x.sets.map((row) =>
                                            row.id === s.id ? { ...row, reps } : row,
                                          ),
                                        }
                                      : x,
                                  ),
                                }
                              : w,
                          );
                        }}
                        onBlur={() => updateSet(s.id, { reps: s.reps })}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/20 bg-black/50 text-[#e31e24] focus:ring-[#e31e24]/50"
                        checked={s.isWarmup}
                        onChange={(e) => {
                          const isWarmup = e.target.checked;
                          setWorkout((w) =>
                            w
                              ? {
                                  ...w,
                                  exercises: w.exercises.map((x) =>
                                    x.id === ex.id
                                      ? {
                                          ...x,
                                          sets: x.sets.map((row) =>
                                            row.id === s.id ? { ...row, isWarmup } : row,
                                          ),
                                        }
                                      : x,
                                  ),
                                }
                              : w,
                          );
                          updateSet(s.id, { isWarmup });
                        }}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        className="text-red-400/90 hover:text-red-300"
                        onClick={() => deleteSet(s.id)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="mt-4 text-xs font-bold uppercase tracking-wider text-[#e31e24] hover:text-[#ff6b6b]"
            onClick={() => addSet(ex.id)}
          >
            + Підхід
          </button>
        </section>
      ))}

      <div className="rounded-xl border border-dashed border-white/15 bg-black/30 p-5 transition-colors hover:border-[#e31e24]/25">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Додати вправу
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            className="flex-1 rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-zinc-100 outline-none focus:border-[#e31e24]/35"
            placeholder="Назва вправи"
            value={newExName}
            onChange={(e) => setNewExName(e.target.value)}
          />
          <select
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-zinc-100 outline-none sm:w-48"
            value={newExBase}
            onChange={(e) => setNewExBase(e.target.value as BaseLift)}
          >
            {BASE_LIFT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-md bg-[#e31e24] px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#c41a21]"
            onClick={addExercise}
          >
            Додати
          </button>
        </div>
      </div>
    </div>
  );
}
