"use client";

import { arrayMove } from "@/shared/lib/array-move";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BaseLift } from "@prisma/client";
import { todayDateInput } from "@/shared/lib/date-local";
import { useWorkoutSetDone } from "@/features/workouts/lib/use-workout-set-done";
import { useToast } from "@/shared/shell/ToastProvider";
import {
  formatRpeForInput,
  formatWeightForInput,
  mapApiSet,
  type ExerciseRow,
  type SetRow,
  type WorkoutConfirmState,
  type WorkoutPayload,
} from "@/features/workouts/lib/workout-session-types";
import { cacheWorkoutForOffline } from "@/features/workouts/lib/offline-workout-cache";
import { getCachedWorkout } from "@/shared/lib/offline-workouts-db";

type SessionOptions = {
  readOnly?: boolean;
  onSetMarkedDone?: () => void;
};

export function useWorkoutSession(
  workoutId: string,
  initialWorkout?: WorkoutPayload | null,
  options: SessionOptions = {},
) {
  const { readOnly = false, onSetMarkedDone } = options;
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [workout, setWorkout] = useState<WorkoutPayload | null>(initialWorkout ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newExName, setNewExName] = useState("");
  const [newExBase, setNewExBase] = useState<BaseLift>("NONE");
  const [confirm, setConfirm] = useState<WorkoutConfirmState>(null);
  const [copyDate, setCopyDate] = useState(() => todayDateInput());
  const [copyBusy, setCopyBusy] = useState(false);
  const [titleDraft, setTitleDraft] = useState(() => initialWorkout?.title ?? "");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [exerciseNameErrors, setExerciseNameErrors] = useState<Record<string, string>>({});
  const [newExerciseError, setNewExerciseError] = useState<string | null>(null);
  const [addingSetsFor, setAddingSetsFor] = useState<string | null>(null);
  const [titleSaveState, setTitleSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [notesSaveState, setNotesSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const titleDraftRef = useRef(titleDraft);
  const savedTitleRef = useRef<string | null>(initialWorkout?.title ?? null);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reorderBusyRef = useRef(false);
  const skipInitialLoadRef = useRef(initialWorkout != null);
  titleDraftRef.current = titleDraft;

  const { isSetDone, setSetDone: persistSetDone, doneMap } = useWorkoutSetDone(workoutId);

  const setSetDone = useCallback(
    (setId: string, done: boolean) => {
      if (readOnly) return;
      persistSetDone(setId, done);
      if (done) onSetMarkedDone?.();
    },
    [onSetMarkedDone, persistSetDone, readOnly],
  );

  const applyWorkoutPayload = useCallback((w: WorkoutPayload) => {
    setTitleDraft(w.title ?? "");
    savedTitleRef.current = w.title ?? null;
    setWorkout(w);
    setLoadError(null);
    void cacheWorkoutForOffline(w);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}`);
      const data = await res.json();
      if (!res.ok) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const cached = await getCachedWorkout(workoutId);
          if (cached) {
            applyWorkoutPayload(cached);
            return;
          }
        }
        setLoadError(data.error ?? "Не вдалося завантажити.");
        return;
      }
      const w = data.workout;
      applyWorkoutPayload({
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
            sets: ex.sets.map(mapApiSet),
          }),
        ),
      });
    } catch {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const cached = await getCachedWorkout(workoutId);
        if (cached) {
          applyWorkoutPayload(cached);
          return;
        }
      }
      setLoadError("Не вдалося завантажити.");
    }
  }, [applyWorkoutPayload, workoutId]);

  useEffect(() => {
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      return;
    }
    load();
  }, [load]);

  useEffect(() => {
    if (initialWorkout) void cacheWorkoutForOffline(initialWorkout);
  }, [initialWorkout]);

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
    setNotesSaveState("saving");
    notesTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: nextNotes.trim() === "" ? null : nextNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error ?? "Не вдалося зберегти нотатку.");
        setNotesSaveState("error");
        return;
      }
      setNotesSaveState("saved");
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
  }

  async function persistExerciseOrder(nextEx: ExerciseRow[]) {
    if (reorderBusyRef.current) return;
    reorderBusyRef.current = true;
    setWorkout((w) => (w ? { ...w, exercises: nextEx } : w));
    try {
      const res = await fetch(`/api/workouts/${workoutId}/exercises/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: nextEx.map((e) => e.id) }),
      });
      if (!res.ok) {
        toastError("Не вдалося зберегти порядок.");
        await load();
      }
    } finally {
      reorderBusyRef.current = false;
    }
  }

  function moveExerciseRelative(exerciseId: string, delta: -1 | 1) {
    setWorkout((w) => {
      if (!w) return w;
      const idx = w.exercises.findIndex((e) => e.id === exerciseId);
      if (idx < 0) return w;
      const newIndex = idx + delta;
      if (newIndex < 0 || newIndex >= w.exercises.length) return w;
      const nextEx = arrayMove(w.exercises, idx, newIndex);
      void persistExerciseOrder(nextEx);
      return { ...w, exercises: nextEx };
    });
  }

  async function persistSetOrder(exerciseId: string, nextSets: SetRow[]) {
    if (reorderBusyRef.current) return;
    reorderBusyRef.current = true;
    setWorkout((w) => {
      if (!w) return w;
      return {
        ...w,
        exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, sets: nextSets } : e)),
      };
    });
    try {
      const res = await fetch(`/api/workout-exercises/${exerciseId}/sets/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: nextSets.map((s) => s.id) }),
      });
      if (!res.ok) {
        toastError("Не вдалося зберегти порядок підходів.");
        await load();
      }
    } finally {
      reorderBusyRef.current = false;
    }
  }

  function moveSetRelative(exerciseId: string, setId: string, delta: -1 | 1) {
    setWorkout((w) => {
      if (!w) return w;
      const ex = w.exercises.find((e) => e.id === exerciseId);
      if (!ex) return w;
      const idx = ex.sets.findIndex((s) => s.id === setId);
      if (idx < 0) return w;
      const newIndex = idx + delta;
      if (newIndex < 0 || newIndex >= ex.sets.length) return w;
      const nextSets = arrayMove(ex.sets, idx, newIndex);
      void persistSetOrder(exerciseId, nextSets);
      return {
        ...w,
        exercises: w.exercises.map((e) => (e.id === exerciseId ? { ...e, sets: nextSets } : e)),
      };
    });
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
  }

  async function patchTitle() {
    if (!workout) return;
    const next = titleDraftRef.current.trim() === "" ? null : titleDraftRef.current.trim();
    if (next === savedTitleRef.current) return;
    setTitleSaveState("saving");
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
      setTitleSaveState("error");
      return;
    }
    setTitleError(null);
    savedTitleRef.current = next;
    setWorkout((w) => (w ? { ...w, title: next } : w));
    setTitleSaveState("saved");
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
    const created = data.exercise as {
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
        rpe?: unknown;
      }>;
    };
    setWorkout((w) =>
      w
        ? {
            ...w,
            exercises: [
              ...w.exercises,
              {
                id: created.id,
                sortOrder: created.sortOrder,
                name: created.name,
                baseLift: created.baseLift,
                sets: created.sets.map(mapApiSet),
              },
            ],
          }
        : w,
    );
  }

  async function addSet(exerciseId: string, count = 1) {
    if (addingSetsFor === exerciseId) return;
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

    setAddingSetsFor(exerciseId);
    try {
      const res = await fetch(`/api/workout-exercises/${exerciseId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg, reps, isWarmup: false, count }),
      });
      const data = (await res.json()) as {
        error?: string;
        sets?: Array<{
          id: string;
          sortOrder: number;
          weightKg: unknown;
          reps: number;
          isWarmup: boolean;
          rpe?: unknown;
        }>;
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
        toastError(data.error ?? "Помилка.");
        return;
      }
      const created = data.sets ?? (data.set ? [data.set] : []);
      if (created.length === 0) return;
      setWorkout((w) => {
        if (!w) return w;
        return {
          ...w,
          exercises: w.exercises.map((row) =>
            row.id === exerciseId
              ? { ...row, sets: [...row.sets, ...created.map(mapApiSet)] }
              : row,
          ),
        };
      });
    } finally {
      setAddingSetsFor(null);
    }
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
    setWorkout((w) => {
      if (!w) return w;
      return {
        ...w,
        exercises: w.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.filter((s) => s.id !== setId),
        })),
      };
    });
  }

  async function deleteExercise(exerciseId: string) {
    const res = await fetch(`/api/workout-exercises/${exerciseId}`, { method: "DELETE" });
    if (!res.ok) {
      toastError("Не вдалося видалити вправу.");
      return;
    }
    toastSuccess("Вправу видалено.");
    setWorkout((w) =>
      w ? { ...w, exercises: w.exercises.filter((ex) => ex.id !== exerciseId) } : w,
    );
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

  async function handleConfirm() {
    if (!confirm) return;
    if (confirm.kind === "set") await deleteSet(confirm.id);
    else if (confirm.kind === "ex") await deleteExercise(confirm.id);
    else await deleteWorkout();
  }

  return {
    workout,
    loadError,
    confirm,
    setConfirm,
    titleDraft,
    setTitleDraft,
    titleError,
    setTitleError,
    titleSaveState,
    setTitleSaveState,
    notesSaveState,
    setNotesSaveState,
    copyDate,
    setCopyDate,
    copyBusy,
    newExName,
    setNewExName,
    newExBase,
    setNewExBase,
    newExerciseError,
    setNewExerciseError,
    exerciseNameErrors,
    setExerciseNameErrors,
    addingSetsFor,
    isSetDone,
    setSetDone,
    doneMap,
    setWorkout,
    patchTitle,
    patchDate,
    scheduleNotesSave,
    duplicateWorkout,
    moveExerciseRelative,
    moveSetRelative,
    patchExerciseName,
    addExercise,
    addSet,
    updateSet,
    copyWorkoutAsText,
    handleConfirm,
  };
}

export type WorkoutSessionController = ReturnType<typeof useWorkoutSession>;
