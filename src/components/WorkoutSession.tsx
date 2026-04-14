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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BASE_LIFT_OPTIONS, baseLiftLabel } from "@/lib/base-lift";
import type { BaseLift } from "@prisma/client";
import { formatDateForInput, todayDateInput } from "@/lib/date-local";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExercisePlanCheck } from "@/components/ExercisePlanCheck";
import { SortableExerciseSection } from "@/components/SortableExerciseSection";
import { WorkoutSessionSkeleton } from "@/components/WorkoutSessionSkeleton";
import { useToast } from "@/components/ToastProvider";
import {
  uiButtonPrimaryClass,
  uiFieldErrorClass,
  uiInputClass,
  uiLabelClass,
} from "@/components/ui/styles";

type SetRow = {
  id: string;
  sortOrder: number;
  weightKg: string;
  reps: number;
  isWarmup: boolean;

  rpe: string;
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

const inpMobile = `${inp} min-h-[48px] w-full px-3 text-base`;

const setMoveBtn =
  "flex min-h-9 min-w-9 touch-manipulation items-center justify-center rounded-lg border border-white/15 bg-black/40 text-base leading-none text-zinc-300 transition enabled:active:scale-95 enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35 md:min-h-[36px] md:min-w-[36px]";

function formatWeightForInput(w: unknown): string {
  if (w == null) return "";
  const n = typeof w === "number" ? w : Number(w);
  if (Number.isNaN(n)) return String(w);
  return String(n);
}

function formatRpeForInput(w: unknown): string {
  if (w == null || w === "") return "";
  const n = typeof w === "number" ? w : Number(w);
  if (!Number.isFinite(n)) return "";
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
  const [copyBusy, setCopyBusy] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [exerciseNameErrors, setExerciseNameErrors] = useState<Record<string, string>>({});
  const [newExerciseError, setNewExerciseError] = useState<string | null>(null);
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
            rpe?: unknown;
          }>;
        }) => ({
          ...ex,
          planDone: ex.planDone ?? false,
          sets: ex.sets.map((s) => ({
            ...s,
            weightKg: formatWeightForInput(s.weightKg),
            rpe: formatRpeForInput(s.rpe),
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
      const message = "Введіть назву вправи.";
      setExerciseNameErrors((prev) => ({ ...prev, [exerciseId]: message }));
      toastError(message);
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
      const message = (data as { error?: string }).error ?? "Не вдалося зберегти назву.";
      setExerciseNameErrors((prev) => ({ ...prev, [exerciseId]: message }));
      toastError(message);
      await load();
      return;
    }
    setExerciseNameErrors((prev) => {
      if (!prev[exerciseId]) return prev;
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
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
      const message = data.error ?? "Не вдалося зберегти назву.";
      setTitleError(message);
      toastError(message);
      setTitleDraft(workout.title ?? "");
      titleDraftRef.current = workout.title ?? "";
      return;
    }
    setTitleError(null);
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
    const trimmed = newExName.trim();
    if (!trimmed) {
      const message = "Введіть назву вправи.";
      setNewExerciseError(message);
      toastError(message);
      return;
    }
    const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, baseLift: newExBase }),
    });
    const data = await res.json();
    if (!res.ok) {
      const message = data.error ?? "Помилка.";
      setNewExerciseError(message);
      toastError(message);
      return;
    }
    setNewExerciseError(null);
    setNewExName("");
    setNewExBase("NONE");
    await load();
    router.refresh();
  }

  async function addSet(exerciseId: string) {
    const ex = workout?.exercises.find((e) => e.id === exerciseId);
    let weightKg = 0;
    let reps = 1;
    if (ex?.sets.length) {
      const sorted = [...ex.sets].sort((a, b) => a.sortOrder - b.sortOrder);
      const prev = sorted[sorted.length - 1];
      const raw = prev.weightKg.trim().replace(",", ".");
      const w = raw === "" ? Number.NaN : parseFloat(raw);
      if (Number.isFinite(w)) weightKg = w;
      if (prev.reps >= 1 && prev.reps <= 999) reps = prev.reps;
    }

    const res = await fetch(`/api/workout-exercises/${exerciseId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg, reps, isWarmup: false }),
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
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      set?: {
        id: string;
        sortOrder: number;
        weightKg: unknown;
        reps: number;
        isWarmup: boolean;
        rpe?: unknown;
      };
    };
    if (!res.ok) {
      toastError(data.error ?? "Помилка оновлення.");
      await load();
      return;
    }
    const raw = data.set;
    if (!raw) {
      await load();
      return;
    }
    setWorkout((w) => {
      if (!w) return w;
      return {
        ...w,
        exercises: w.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((row) =>
            row.id === setId
              ? {
                  ...row,
                  weightKg: formatWeightForInput(raw.weightKg),
                  reps: raw.reps,
                  isWarmup: raw.isWarmup,
                  sortOrder: raw.sortOrder,
                  rpe: formatRpeForInput(raw.rpe),
                }
              : row,
          ),
        })),
      };
    });
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

  async function copyWorkoutAsText() {
    setCopyBusy(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}/share-text`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        let msg = "Не вдалося отримати текст.";
        try {
          const j = (await res.json()) as { error?: string };
          if (typeof j.error === "string") msg = j.error;
        } catch {}
        toastError(msg);
        return;
      }
      const text = await res.text();
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toastSuccess("Тренування скопійовано в буфер.");
        return;
      }
      toastError("Немає доступу до буфера обміну на цьому пристрої.");
    } finally {
      setCopyBusy(false);
    }
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
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1 md:max-w-xl">
            <label
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
              htmlFor="wtitle"
            >
              Назва тренування
            </label>
            <input
              id="wtitle"
              type="text"
              maxLength={200}
              className="font-display box-border h-11 w-full min-w-0 cursor-text rounded-md border border-white/10 bg-black/50 px-3 text-base font-bold uppercase leading-tight tracking-tight text-[var(--sbd-text)] outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15 md:text-lg"
              placeholder="Наприклад День 3"
              value={titleDraft}
              onChange={(e) => {
                setTitleDraft(e.target.value);
                if (titleError) setTitleError(null);
              }}
              onBlur={patchTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
            {titleError ? (
              <p className={uiFieldErrorClass} role="alert">
                {titleError}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 md:justify-end">
            <button
              type="button"
              disabled={copyBusy}
              className="box-border inline-flex h-11 touch-manipulation items-center justify-center rounded-md border border-white/15 bg-white/5 px-3 text-xs font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-45"
              onClick={() => void copyWorkoutAsText()}
            >
              {copyBusy ? "Копіювання…" : "Копіювати тренування текстом"}
            </button>
            <button
              type="button"
              className="box-border inline-flex h-11 shrink-0 touch-manipulation items-center justify-center rounded-md border border-red-500/40 px-3 text-xs font-bold uppercase tracking-wider text-red-400 transition hover:bg-red-500/15 active:bg-red-500/25"
              onClick={() => setConfirm({ kind: "wo" })}
            >
              Видалити
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <label
            className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500"
            htmlFor="wdate"
          >
            Дата тренування
          </label>
          <input
            id="wdate"
            type="date"
            className="box-border h-11 max-w-[200px] rounded-md border border-white/10 bg-black/50 px-3 text-sm text-zinc-100 outline-none focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15"
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
          <label
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
            htmlFor="wnotes"
          >
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
        <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1 sm:max-w-[240px]">
            <label className="text-xs text-zinc-500" htmlFor="copydate">
              Копіювати це тренування на дату
            </label>
            <input
              id="copydate"
              type="date"
              className="box-border h-11 max-w-[200px] rounded-md border border-white/10 bg-black/50 px-3 text-sm text-zinc-100 outline-none focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15"
              value={copyDate}
              onChange={(e) => setCopyDate(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="box-border inline-flex h-11 items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-white/10"
            onClick={() => duplicateWorkout(copyDate)}
          >
            Копіювати
          </button>
          <button
            type="button"
            className="box-border inline-flex h-11 items-center justify-center rounded-md bg-[#e31e24]/90 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#c41a21]"
            onClick={() => duplicateWorkout(todayDateInput())}
          >
            Копія на сьогодні
          </button>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={workout.exercises.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
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
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
                  <div className="min-w-0 w-full flex-1 sm:max-w-xl">
                    <label className="sr-only" htmlFor={`ex-name-${ex.id}`}>
                      Назва вправи
                    </label>
                    <input
                      id={`ex-name-${ex.id}`}
                      type="text"
                      maxLength={200}
                      spellCheck={false}
                      autoCapitalize="sentences"
                      className="font-display w-full min-w-0 border-b border-transparent bg-transparent pb-1 text-lg font-semibold uppercase tracking-wide text-[var(--sbd-text)] outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/40"
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
                      onInput={() =>
                        setExerciseNameErrors((prev) => {
                          if (!prev[ex.id]) return prev;
                          const next = { ...prev };
                          delete next[ex.id];
                          return next;
                        })
                      }
                      onBlur={() => patchExerciseName(ex.id, ex.name)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                    <p className="mt-1 text-xs uppercase tracking-wider text-zinc-600">
                      {baseLiftLabel(ex.baseLift)}
                    </p>
                    {exerciseNameErrors[ex.id] ? (
                      <p className={uiFieldErrorClass} role="alert">
                        {exerciseNameErrors[ex.id]}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="min-h-[44px] shrink-0 self-start touch-manipulation text-xs font-medium uppercase tracking-wide text-red-400/90 hover:text-red-300 sm:min-h-0"
                    onClick={() => setConfirm({ kind: "ex", id: ex.id })}
                  >
                    Видалити вправу
                  </button>
                </div>

                <div className="space-y-3 md:hidden">
                  {ex.sets.map((s, setIndex) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-white/[0.1] bg-black/25 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                          Підхід {setIndex + 1}
                        </span>
                        <div className="flex items-center gap-1">
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
                          <button
                            type="button"
                            className="min-h-9 min-w-9 touch-manipulation rounded-lg text-lg text-red-400/90 hover:bg-red-500/10 hover:text-red-300"
                            aria-label="Видалити підхід"
                            onClick={() => setConfirm({ kind: "set", id: s.id })}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-0 space-y-1">
                          <label
                            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                            htmlFor={`w-${s.id}`}
                          >
                            Вага (кг)
                          </label>
                          <input
                            id={`w-${s.id}`}
                            className={inpMobile}
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
                            onBlur={(e) => {
                              const num = parseFloat(e.target.value.replace(",", "."));
                              if (!Number.isFinite(num)) return;
                              void updateSet(s.id, { weightKg: num });
                            }}
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <label
                            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                            htmlFor={`r-${s.id}`}
                          >
                            Повтори
                          </label>
                          <input
                            id={`r-${s.id}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            spellCheck={false}
                            className={inpMobile}
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
                            onBlur={(e) => {
                              const t = e.target.value.replace(/\D/g, "").slice(0, 3);
                              let reps = t === "" ? 1 : Math.min(999, parseInt(t, 10) || 1);
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
                              void updateSet(s.id, { reps });
                            }}
                          />
                        </div>
                      </div>
                      {ex.baseLift !== "NONE" ? (
                        <div className="mt-3 min-w-0 space-y-1">
                          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                            RPE
                          </div>
                          <div
                            className={`${inpMobile} flex items-center border border-white/10 bg-black/30 text-zinc-200`}
                          >
                            {s.rpe.trim() === "" ? "—" : s.rpe.trim()}
                          </div>
                          <p className="text-[11px] leading-snug text-zinc-600">
                            За вагою, повторами та максимумами в профілі.
                          </p>
                        </div>
                      ) : null}
                      <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 touch-manipulation">
                        <input
                          type="checkbox"
                          className="h-5 w-5 shrink-0 rounded border-white/20 bg-black/50 text-[#e31e24] focus:ring-[#e31e24]/50"
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
                        <span className="text-sm text-zinc-300">Розминка</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="w-[2.75rem] py-2 pr-1 text-center">Пор.</th>
                        <th className="py-2 pr-2">Вага (кг)</th>
                        <th className="py-2 pr-2">Повтори</th>
                        {ex.baseLift !== "NONE" ? (
                          <th className="py-2 pr-2">RPE</th>
                        ) : null}
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
                              onBlur={(e) => {
                                const num = parseFloat(e.target.value.replace(",", "."));
                                if (!Number.isFinite(num)) return;
                                void updateSet(s.id, { weightKg: num });
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
                              onBlur={(e) => {
                                const t = e.target.value.replace(/\D/g, "").slice(0, 3);
                                let reps = t === "" ? 1 : Math.min(999, parseInt(t, 10) || 1);
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
                                void updateSet(s.id, { reps });
                              }}
                            />
                          </td>
                          {ex.baseLift !== "NONE" ? (
                            <td className="py-2 pr-2 align-middle text-zinc-300">
                              {s.rpe.trim() === "" ? "—" : s.rpe.trim()}
                            </td>
                          ) : null}
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
                  className="mt-4 min-h-[44px] touch-manipulation text-xs font-bold uppercase tracking-wider text-[#e31e24] hover:text-[#ff6b6b] md:min-h-0"
                  onClick={() => addSet(ex.id)}
                >
                  + Підхід
                </button>
              </SortableExerciseSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-zinc-600 sm:text-left sm:text-xs">
        Для жиму / присіду / тяги RPE рахується автоматично з ваги, повторів та{" "}
        <Link href="/profile" className="text-[#e31e24] underline-offset-2 hover:underline">
          максимумів у профілі
        </Link>
        . Для інших вправ RPE не використовується.
      </p>

      <div className="rounded-xl border border-dashed border-white/15 bg-black/30 p-5 transition-colors hover:border-[#e31e24]/25">
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Додати вправу
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-exercise-name" className={`${uiLabelClass} sr-only`}>
              Назва вправи
            </label>
            <input
              id="new-exercise-name"
              className={`${uiInputClass} border-white/10 bg-black/40 text-zinc-100`}
              placeholder="Назва вправи"
              value={newExName}
              onChange={(e) => {
                setNewExName(e.target.value);
                if (newExerciseError) setNewExerciseError(null);
              }}
              aria-invalid={newExerciseError ? "true" : "false"}
              aria-describedby={newExerciseError ? "new-exercise-error" : undefined}
            />
          </div>
          <select
            className={`${uiInputClass} border-white/10 bg-black/40 text-zinc-100 sm:w-48`}
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
            className={`${uiButtonPrimaryClass} px-5`}
            onClick={addExercise}
          >
            Додати
          </button>
        </div>
        {newExerciseError ? (
          <p id="new-exercise-error" className={uiFieldErrorClass} role="alert">
            {newExerciseError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
