"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_LIFT_OPTIONS, baseLiftLabel } from "@/lib/base-lift";
import type { BaseLift } from "@prisma/client";
import { formatDateForInput, todayDateInput } from "@/lib/date-local";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExercisePlanCheck } from "@/components/ExercisePlanCheck";
import { SortableExerciseSection } from "@/components/SortableExerciseSection";
import { WorkoutSessionSkeleton } from "@/components/WorkoutSessionSkeleton";
import { useToast } from "@/components/ToastProvider";

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
  planDone: boolean;
  sets: SetRow[];
};

type WorkoutPayload = {
  id: string;
  date: string;
  title: string | null;
  notes: string | null;
  exercises: ExerciseRow[];
};

const inp =
  "rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-zinc-100 outline-none focus:border-[#e31e24]/35 focus:ring-1 focus:ring-[#e31e24]/25";

const setMoveBtn =
  "flex min-h-[36px] min-w-[36px] touch-manipulation items-center justify-center rounded border border-white/15 bg-black/40 text-base leading-none text-zinc-300 transition enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

function formatWeightForInput(w: unknown): string {
  if (w == null) return "";
  const n = typeof w === "number" ? w : Number(w);
  if (Number.isNaN(n)) return String(w);
  return String(n);
}

export function WorkoutSession({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [workout, setWorkout] = useState<WorkoutPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newExName, setNewExName] = useState("");
  const [newExBase, setNewExBase] = useState<BaseLift>("NONE");
  const [confirm, setConfirm] = useState<
    null | { kind: "set"; id: string } | { kind: "ex"; id: string } | { kind: "wo" }
  >(null);
  const [copyDate, setCopyDate] = useState(() => todayDateInput());
  const [titleDraft, setTitleDraft] = useState("");
  const titleDraftRef = useRef(titleDraft);
  const savedTitleRef = useRef<string | null>(null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  titleDraftRef.current = titleDraft;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    const res = await fetch(`/api/workouts/${workoutId}`);
    const data = await res.json();
    if (!res.ok) {
      setLoadError(data.error ?? "Не вдалося завантажити.");
      return;
    }
    const w = data.workout;
    setTitleDraft(w.title ?? "");
    savedTitleRef.current = w.title ?? null;
    setWorkout({
      id: w.id,
      date: w.date,
      title: w.title,
      notes: w.notes ?? null,
      exercises: w.exercises.map(
        (ex: {
          id: string;
          sortOrder: number;
          name: string;
          baseLift: BaseLift;
          planDone?: boolean;
          sets: Array<{
            id: string;
            sortOrder: number;
            weightKg: unknown;
            reps: number;
            isWarmup: boolean;
          }>;
        }) => ({
          ...ex,
          planDone: ex.planDone ?? false,
          sets: ex.sets.map((s) => ({
            ...s,
            weightKg: formatWeightForInput(s.weightKg),
          })),
        }),
      ),
    });
    setLoadError(null);
  }, [workoutId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current);
    };
  }, []);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const next = titleDraftRef.current.trim() === "" ? null : titleDraftRef.current.trim();
      if (next === savedTitleRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    return () => {
      const next = titleDraftRef.current.trim() === "" ? null : titleDraftRef.current.trim();
      if (next === savedTitleRef.current) return;
      void fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: next }),
        keepalive: true,
      });
    };
  }, [workoutId]);

  function scheduleNotesSave(nextNotes: string) {
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: nextNotes.trim() === "" ? null : nextNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error ?? "Не вдалося зберегти нотатку.");
        return;
      }
      router.refresh();
    }, 500);
  }

  async function duplicateWorkout(targetDate?: string) {
    const res = await fetch("/api/workouts/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceWorkoutId: workoutId,
        ...(targetDate ? { targetDate } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toastError(data.error ?? "Не вдалося скопіювати.");
      return;
    }
    const nw = data.workout as { id: string };
    toastSuccess("Тренування скопійовано.");
    router.push(`/workouts/${nw.id}`);
    router.refresh();
  }

  async function persistExerciseOrder(nextEx: ExerciseRow[]) {
    setWorkout((w) => (w ? { ...w, exercises: nextEx } : w));
    const res = await fetch(`/api/workouts/${workoutId}/exercises/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: nextEx.map((e) => e.id) }),
    });
    if (!res.ok) {
      toastError("Не вдалося зберегти порядок.");
      await load();
      return;
    }
    router.refresh();
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !workout) return;
    const oldIndex = workout.exercises.findIndex((e) => e.id === active.id);
    const newIndex = workout.exercises.findIndex((e) => e.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const nextEx = arrayMove(workout.exercises, oldIndex, newIndex);
    await persistExerciseOrder(nextEx);
  }

  function moveExerciseRelative(exerciseId: string, delta: -1 | 1) {
    if (!workout) return;
    const idx = workout.exercises.findIndex((e) => e.id === exerciseId);
    if (idx < 0) return;
    const newIndex = idx + delta;
    if (newIndex < 0 || newIndex >= workout.exercises.length) return;
    const nextEx = arrayMove(workout.exercises, idx, newIndex);
    void persistExerciseOrder(nextEx);
  }

  async function persistSetOrder(exerciseId: string, nextSets: SetRow[]) {
    setWorkout((w) => {
      if (!w) return w;
      return {
        ...w,
        exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, sets: nextSets } : e)),
      };
    });
    const res = await fetch(`/api/workout-exercises/${exerciseId}/sets/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: nextSets.map((s) => s.id) }),
    });
    if (!res.ok) {
      toastError("Не вдалося зберегти порядок підходів.");
      await load();
      return;
    }
    router.refresh();
  }

  function moveSetRelative(exerciseId: string, setId: string, delta: -1 | 1) {
    if (!workout) return;
    const ex = workout.exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const idx = ex.sets.findIndex((s) => s.id === setId);
    if (idx < 0) return;
    const newIndex = idx + delta;
    if (newIndex < 0 || newIndex >= ex.sets.length) return;
    const nextSets = arrayMove(ex.sets, idx, newIndex);
    void persistSetOrder(exerciseId, nextSets);
  }

  async function patchExerciseName(exerciseId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      toastError("Введіть назву вправи.");
      await load();
      return;
    }
    const res = await fetch(`/api/workout-exercises/${exerciseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toastError((data as { error?: string }).error ?? "Не вдалося зберегти назву.");
      await load();
      return;
    }
    setWorkout((w) =>
      w
        ? {
            ...w,
            exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, name: trimmed } : e)),
          }
        : w,
    );
    router.refresh();
  }

  async function patchTitle() {
    if (!workout) return;
    const next = titleDraftRef.current.trim() === "" ? null : titleDraftRef.current.trim();
    if (next === savedTitleRef.current) return;
    const res = await fetch(`/api/workouts/${workoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      toastError(data.error ?? "Не вдалося зберегти назву.");
      setTitleDraft(workout.title ?? "");
      titleDraftRef.current = workout.title ?? "";
      return;
    }
    savedTitleRef.current = next;
    setWorkout((w) => (w ? { ...w, title: next } : w));
    router.refresh();
  }

  async function patchDate(dateStr: string) {
    const res = await fetch(`/api/workouts/${workoutId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr }),
    });
    const data = await res.json();
    if (!res.ok) {
      toastError(data.error ?? "Не вдалося змінити дату.");
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
      toastError(data.error ?? "Помилка.");
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
      toastError(data.error ?? "Помилка.");
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
      toastError(data.error ?? "Помилка оновлення.");
      return;
    }
    await load();
  }

  async function deleteSet(setId: string) {
    const res = await fetch(`/api/sets/${setId}`, { method: "DELETE" });
    if (!res.ok) {
      toastError("Не вдалося видалити підхід.");
      return;
    }
    toastSuccess("Підхід видалено.");
    await load();
    router.refresh();
  }

  async function deleteExercise(exerciseId: string) {
    const res = await fetch(`/api/workout-exercises/${exerciseId}`, { method: "DELETE" });
    if (!res.ok) {
      toastError("Не вдалося видалити вправу.");
      return;
    }
    toastSuccess("Вправу видалено.");
    await load();
    router.refresh();
  }

  async function deleteWorkout() {
    const res = await fetch(`/api/workouts/${workoutId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toastError((data as { error?: string }).error ?? "Не вдалося видалити.");
      return;
    }
    toastSuccess("Тренування видалено.");
    router.push("/workouts");
    router.refresh();
  }

  if (loadError && !workout) {
    return <p className="text-red-400">{loadError}</p>;
  }
  if (!workout) {
    return <WorkoutSessionSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm?.kind === "set"
            ? "Видалити підхід?"
            : confirm?.kind === "ex"
              ? "Видалити вправу?"
              : "Видалити тренування?"
        }
        description={
          confirm?.kind === "ex"
            ? "Усі підходи цієї вправи будуть видалені без відновлення."
            : confirm?.kind === "wo"
              ? "Усі вправи та підходи цього тренування зникнуть без відновлення."
              : undefined
        }
        confirmLabel={confirm?.kind === "wo" ? "Видалити" : "Так"}
        cancelLabel="Скасувати"
        danger
        onConfirm={async () => {
          if (!confirm) return;
          if (confirm.kind === "set") await deleteSet(confirm.id);
          else if (confirm.kind === "ex") await deleteExercise(confirm.id);
          else await deleteWorkout();
        }}
      />

      <div className="sbd-card rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="wtitle">
              Назва тренування
            </label>
            <input
              id="wtitle"
              type="text"
              maxLength={200}
              className="font-display w-full min-w-0 max-w-xl border-b border-transparent bg-transparent pb-1 text-xl font-bold uppercase tracking-tight text-white outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/50"
              placeholder="Назва тренування"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={patchTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
          </div>
          <button
            type="button"
            className="min-h-[44px] shrink-0 touch-manipulation rounded-md border border-red-500/40 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/15 active:bg-red-500/25"
            onClick={() => setConfirm({ kind: "wo" })}
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
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="wnotes">
            Нотатки (необов&apos;язково)
          </label>
          <textarea
            id="wnotes"
            rows={3}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#e31e24]/35"
            placeholder="Сон, самопочуття, загальний RPE…"
            value={workout.notes ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setWorkout((w) => (w ? { ...w, notes: v } : w));
              scheduleNotesSave(v);
            }}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500" htmlFor="copydate">
              Копіювати це тренування на дату
            </label>
            <input
              id="copydate"
              type="date"
              className="max-w-[200px] rounded-md border border-white/10 bg-black/50 px-3 py-2 text-zinc-100"
              value={copyDate}
              onChange={(e) => setCopyDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/10"
            onClick={() => duplicateWorkout(copyDate)}
          >
            Копіювати
          </button>
          <button
            type="button"
            className="rounded-md bg-[#e31e24]/90 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#c41a21]"
            onClick={() => duplicateWorkout(todayDateInput())}
          >
            Копія на сьогодні
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={workout.exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
          {workout.exercises.map((ex, exerciseIndex) => (
            <SortableExerciseSection
              key={ex.id}
              id={ex.id}
              canMoveUp={exerciseIndex > 0}
              canMoveDown={exerciseIndex < workout.exercises.length - 1}
              onMoveUp={() => moveExerciseRelative(ex.id, -1)}
              onMoveDown={() => moveExerciseRelative(ex.id, 1)}
            >
          {ex.baseLift === "NONE" ? (
            <ExercisePlanCheck
              workoutId={workoutId}
              exerciseId={ex.id}
              planDone={ex.planDone}
              onPlanDoneChange={(next) =>
                setWorkout((w) =>
                  w
                    ? {
                        ...w,
                        exercises: w.exercises.map((row) =>
                          row.id === ex.id ? { ...row, planDone: next } : row,
                        ),
                      }
                    : w,
                )
              }
            />
          ) : null}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor={`ex-name-${ex.id}`}>
                Назва вправи
              </label>
              <input
                id={`ex-name-${ex.id}`}
                type="text"
                maxLength={200}
                spellCheck={false}
                autoCapitalize="sentences"
                className="font-display w-full min-w-0 max-w-xl border-b border-transparent bg-transparent pb-1 text-lg font-semibold uppercase tracking-wide text-white outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/40"
                value={ex.name}
                onChange={(e) =>
                  setWorkout((w) =>
                    w
                      ? {
                          ...w,
                          exercises: w.exercises.map((row) =>
                            row.id === ex.id ? { ...row, name: e.target.value } : row,
                          ),
                        }
                      : w,
                  )
                }
                onBlur={() => patchExerciseName(ex.id, ex.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              <p className="mt-1 text-xs uppercase tracking-wider text-zinc-600">{baseLiftLabel(ex.baseLift)}</p>
            </div>
            <button
              type="button"
              className="text-xs font-medium uppercase tracking-wide text-red-400/90 hover:text-red-300"
              onClick={() => setConfirm({ kind: "ex", id: ex.id })}
            >
              Видалити вправу
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="w-[2.75rem] py-2 pr-1 text-center">Пор.</th>
                  <th className="py-2 pr-2">Вага (кг)</th>
                  <th className="py-2 pr-2">Повтори</th>
                  <th className="py-2 pr-2">Розминка</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((s, setIndex) => (
                  <tr key={s.id} className="border-b border-white/[0.04]">
                    <td className="py-2 pr-1 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          className={setMoveBtn}
                          aria-label="Підхід вгору"
                          disabled={setIndex === 0}
                          onClick={() => moveSetRelative(ex.id, s.id, -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={setMoveBtn}
                          aria-label="Підхід вниз"
                          disabled={setIndex >= ex.sets.length - 1}
                          onClick={() => moveSetRelative(ex.id, s.id, 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </td>
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
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        spellCheck={false}
                        className={`w-20 ${inp}`}
                        value={s.reps < 1 ? "" : String(s.reps)}
                        onChange={(e) => {
                          const t = e.target.value.replace(/\D/g, "").slice(0, 3);
                          const num = t === "" ? 0 : Math.min(999, parseInt(t, 10) || 0);
                          setWorkout((w) =>
                            w
                              ? {
                                  ...w,
                                  exercises: w.exercises.map((x) =>
                                    x.id === ex.id
                                      ? {
                                          ...x,
                                          sets: x.sets.map((row) =>
                                            row.id === s.id ? { ...row, reps: num } : row,
                                          ),
                                        }
                                      : x,
                                  ),
                                }
                              : w,
                          );
                        }}
                        onBlur={() => {
                          let reps = s.reps;
                          if (reps < 1) reps = 1;
                          if (reps > 999) reps = 999;
                          if (reps !== s.reps) {
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
                          }
                          updateSet(s.id, { reps });
                        }}
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
                        onClick={() => setConfirm({ kind: "set", id: s.id })}
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
            </SortableExerciseSection>
          ))}
          </div>
        </SortableContext>
      </DndContext>

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
