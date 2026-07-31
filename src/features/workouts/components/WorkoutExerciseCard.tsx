import { memo } from "react";
import { baseLiftLabel } from "@/features/workouts/lib/base-lift";
import { SetWorkingNumberBadge } from "@/features/workouts/components/SetWorkingNumberBadge";
import type { ExerciseRow } from "@/features/workouts/lib/workout-session-types";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
import {
  computeWorkingSetNumbers,
  countWorkingSets,
} from "@/features/workouts/lib/working-set-number";
import { IconArrowDown, IconArrowUp, IconClose } from "@/shared/ui/icons";
import {
  uiAccentGridClass,
  uiButtonAccentClass,
  uiButtonDangerIconClass,
  uiButtonIconSmClass,
  uiCheckboxClass,
  uiCheckboxLgClass,
  uiFieldErrorClass,
  uiInputClass,
  uiInputInlineTitleClass,
  uiLabelClass,
  uiMutedTextClass,
  uiSetCardClass,
} from "@/shared/ui/styles";

const inpMobile = `${uiInputClass} min-h-[48px] w-full px-3 text-base`;

const SUPERSET_LETTERS = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З"];

type SetRowT = ExerciseRow["sets"][number];

type Props = {
  ex: ExerciseRow;
  exerciseIndex: number;
  isChild?: boolean;
  exerciseNameError: string | null;
  isAddingSets: boolean;
  doneMap: Record<string, boolean>;
} & Pick<
  WorkoutSessionController,
  | "setExerciseNameErrors"
  | "isSetDone"
  | "setSetDone"
  | "setWorkout"
  | "setConfirm"
  | "moveSetRelative"
  | "patchExerciseName"
  | "updateSet"
  | "setSupersetGroups"
  | "addSet"
>;

function setsDoneEqual(
  sets: ExerciseRow["sets"],
  prevDone: Record<string, boolean>,
  nextDone: Record<string, boolean>,
): boolean {
  for (const s of sets) {
    if ((prevDone[s.id] ?? false) !== (nextDone[s.id] ?? false)) return false;
  }
  return true;
}

function newSupersetGroupId(): string {
  return `ss-${Math.random().toString(36).slice(2, 10)}`;
}

type SetChunk = { group: string | null; items: Array<{ s: SetRowT; idx: number }> };

function chunkSets(sets: SetRowT[]): SetChunk[] {
  const chunks: SetChunk[] = [];
  sets.forEach((s, idx) => {
    const last = chunks[chunks.length - 1];
    const g = s.supersetGroup ?? null;
    if (last && last.group != null && g === last.group) {
      last.items.push({ s, idx });
      return;
    }
    chunks.push({ group: g, items: [{ s, idx }] });
  });
  return chunks;
}

function IconLink({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.4 4.53M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUnlink({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 7l-2.5 2.5M7 17l2.5-2.5M4 4l16 16M10.5 5.5l.9-.9a5 5 0 0 1 7.07 7.07l-.9.9M5.5 10.5l-.9.9a5 5 0 0 0 7.07 7.07l.9-.9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkoutExerciseCardInner({
  ex,
  exerciseIndex,
  isChild = false,
  exerciseNameError,
  isAddingSets,
  doneMap,
  setExerciseNameErrors,
  isSetDone,
  setSetDone,
  setWorkout,
  setConfirm,
  moveSetRelative,
  patchExerciseName,
  updateSet,
  setSupersetGroups,
  addSet,
}: Props) {
  const workingCount = countWorkingSets(ex.sets);
  const setNumbers = computeWorkingSetNumbers(ex.sets);
  const chunks = chunkSets(ex.sets);

  function mergeWithNext(setIndex: number) {
    const cur = ex.sets[setIndex];
    const next = ex.sets[setIndex + 1];
    if (!cur || !next) return;
    const target = cur.supersetGroup ?? next.supersetGroup ?? newSupersetGroupId();
    const changes: Record<string, string | null> = {};
    for (const s of ex.sets) {
      const belongs =
        s.id === cur.id ||
        s.id === next.id ||
        (s.supersetGroup != null &&
          (s.supersetGroup === cur.supersetGroup || s.supersetGroup === next.supersetGroup));
      if (belongs && s.supersetGroup !== target) changes[s.id] = target;
    }
    void setSupersetGroups(ex.id, changes);
  }

  function dissolveGroup(groupId: string) {
    const changes: Record<string, string | null> = {};
    for (const s of ex.sets) {
      if (s.supersetGroup === groupId) changes[s.id] = null;
    }
    void setSupersetGroups(ex.id, changes);
  }

  function renderMobileSetCard(s: SetRowT, setIndex: number, blockLetter?: string) {
    const setNum = setNumbers[setIndex];
    return (
      <div
        key={s.id}
        className={`${uiSetCardClass}${doneMap[s.id] ? " sbd-set-card--done" : ""}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          {blockLetter ? (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_oklab,var(--sbd-red),transparent_65%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_92%)] font-display text-sm font-bold text-[color-mix(in_oklab,var(--sbd-red),white_25%)]"
              aria-label={`Суперсет, частина ${blockLetter}`}
            >
              {blockLetter}
            </span>
          ) : (
            <SetWorkingNumberBadge number={setNum} isWarmup={s.isWarmup} />
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={uiButtonIconSmClass}
              aria-label="Підхід вгору"
              disabled={setIndex === 0}
              onClick={() => moveSetRelative(ex.id, s.id, -1)}
            >
              <IconArrowUp />
            </button>
            <button
              type="button"
              className={uiButtonIconSmClass}
              aria-label="Підхід вниз"
              disabled={setIndex >= ex.sets.length - 1}
              onClick={() => moveSetRelative(ex.id, s.id, 1)}
            >
              <IconArrowDown />
            </button>
            <button
              type="button"
              className={uiButtonDangerIconClass}
              aria-label="Видалити підхід"
              onClick={() => setConfirm({ kind: "set", id: s.id })}
            >
              <IconClose />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0 space-y-1">
            <label className={uiLabelClass} htmlFor={`w-${s.id}`}>
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
            <label className={uiLabelClass} htmlFor={`r-${s.id}`}>
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
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 touch-manipulation">
            <input
              type="checkbox"
              className={uiCheckboxLgClass}
              checked={isSetDone(s.id)}
              onChange={(e) => setSetDone(s.id, e.target.checked)}
            />
            <span className="text-sm text-[var(--sbd-muted)]">Зроблено</span>
          </label>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 touch-manipulation">
            <input
              type="checkbox"
              className={uiCheckboxLgClass}
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
            <span className="text-sm text-[var(--sbd-muted)]">Розминка</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="min-w-0 w-full sm:max-w-xl">
          <label className="sr-only" htmlFor={`ex-name-${ex.id}`}>
            Назва вправи {isChild ? "(дочірня)" : exerciseIndex + 1}
          </label>
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 font-display text-sm font-bold text-[var(--sbd-muted)]">
              {isChild ? "↳" : `${exerciseIndex + 1}.`}
            </span>
            <input
              id={`ex-name-${ex.id}`}
              type="text"
              maxLength={200}
              spellCheck={false}
              autoCapitalize="sentences"
              className={`${uiInputInlineTitleClass} w-full min-w-0 text-lg`}
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
              onBlur={(e) => void patchExerciseName(ex.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
          </div>
          <p className={`mt-1 text-xs uppercase tracking-wider ${uiMutedTextClass}`}>
            {isChild ? "Дочірня" : baseLiftLabel(ex.baseLift)}
            {workingCount > 0 ? (
              <span className="normal-case tracking-normal"> · {workingCount} робочих</span>
            ) : null}
          </p>
          {exerciseNameError ? (
            <p className={uiFieldErrorClass} role="alert">
              {exerciseNameError}
            </p>
          ) : null}
        </div>
      </div>

      <div className={`space-y-3 md:hidden${ex.sets.length === 0 ? " hidden" : ""}`}>
        {chunks.map((chunk, chunkIdx) => {
          const isBlock = chunk.group != null && chunk.items.length > 1;
          const lastIdx = chunk.items[chunk.items.length - 1].idx;
          const connector =
            chunkIdx < chunks.length - 1 ? (
              <div key={`conn-${chunk.items[0].s.id}`} className="flex items-center gap-2">
                <span className="h-px flex-1 bg-[var(--sbd-border)]" />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[color-mix(in_oklab,var(--sbd-red),transparent_55%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--sbd-red)] transition hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_92%)]"
                  onClick={() => mergeWithNext(lastIdx)}
                >
                  <IconLink className="h-3.5 w-3.5" />
                  Суперсет
                </button>
                <span className="h-px flex-1 bg-[var(--sbd-border)]" />
              </div>
            ) : null;

          if (!isBlock) {
            return (
              <div key={`chunk-${chunk.items[0].s.id}`} className="space-y-3">
                {chunk.items.map(({ s, idx }) => renderMobileSetCard(s, idx))}
                {connector}
              </div>
            );
          }

          const blockNumber = setNumbers[chunk.items[0].idx];
          return (
            <div key={`chunk-${chunk.items[0].s.id}`} className="space-y-3">
              <div className="sbd-superset-block">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SetWorkingNumberBadge number={blockNumber} isWarmup={false} />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sbd-red)]">
                      Суперсет · {chunk.items.length} підходи як один
                    </span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[var(--sbd-muted)] transition hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_92%)] hover:text-[var(--sbd-red)]"
                    onClick={() => dissolveGroup(chunk.group!)}
                  >
                    <IconUnlink className="h-3.5 w-3.5" />
                    Роз&apos;єднати
                  </button>
                </div>
                {chunk.items.map(({ s, idx }, i) =>
                  renderMobileSetCard(s, idx, SUPERSET_LETTERS[i] ?? String(i + 1)),
                )}
              </div>
              {connector}
            </div>
          );
        })}
      </div>

      <div className={`overflow-x-auto ${ex.sets.length === 0 ? "hidden" : "hidden md:block"}`}>
        <div className="overflow-hidden rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_92%,transparent)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] [html[data-theme=light]_&]:shadow-[inset_0_1px_0_0_rgba(0,0,0,0.04)]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_75%,var(--sbd-red))] text-left text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]">
                <th className="w-10 py-2.5 pl-3 pr-1 text-center">№</th>
                <th className="w-[2.75rem] py-2.5 pr-1 text-center">Пор.</th>
                <th className="py-2.5 pr-2">Вага (кг)</th>
                <th className="py-2.5 pr-2">Повтори</th>
                <th className="w-[4.5rem] py-2.5 pr-2">Зроблено</th>
                <th className="w-[4.5rem] py-2.5 pr-2">Розминка</th>
                <th className="w-[6.5rem] py-2.5 pr-3 text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {ex.sets.map((s, setIndex) => {
                const setNum = setNumbers[setIndex];
                const next = ex.sets[setIndex + 1];
                const inGroup = s.supersetGroup != null;
                const prevSameGroup =
                  inGroup && setIndex > 0 && ex.sets[setIndex - 1].supersetGroup === s.supersetGroup;
                const canMergeNext =
                  next != null && !(inGroup && next.supersetGroup === s.supersetGroup);
                return (
                <tr
                  key={s.id}
                  className={`border-b border-[var(--sbd-border)] transition-colors last:border-b-0 hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_96%)]${
                    inGroup
                      ? " bg-[color-mix(in_oklab,var(--sbd-red),transparent_94%)] shadow-[inset_3px_0_0_0_var(--sbd-red)]"
                      : ""
                  }`}
                >
                  <td className="py-2 pl-3 pr-1 align-middle text-center">
                    {prevSameGroup ? (
                      <span
                        className="font-display text-sm font-bold text-[var(--sbd-red)]"
                        aria-label="Продовження суперсету"
                      >
                        ↳
                      </span>
                    ) : (
                      <SetWorkingNumberBadge number={setNum} isWarmup={s.isWarmup} size="sm" />
                    )}
                  </td>
                  <td className="py-2 pr-1 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className={uiButtonIconSmClass}
                        aria-label="Підхід вгору"
                        disabled={setIndex === 0}
                        onClick={() => moveSetRelative(ex.id, s.id, -1)}
                      >
                        <IconArrowUp />
                      </button>
                      <button
                        type="button"
                        className={uiButtonIconSmClass}
                        aria-label="Підхід вниз"
                        disabled={setIndex >= ex.sets.length - 1}
                        onClick={() => moveSetRelative(ex.id, s.id, 1)}
                      >
                        <IconArrowDown />
                      </button>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      className={`w-28 ${uiInputClass}`}
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
                      className={`w-20 ${uiInputClass}`}
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
                  <td className="py-2 pr-2 align-middle">
                    <input
                      type="checkbox"
                      className={uiCheckboxClass}
                      checked={isSetDone(s.id)}
                      onChange={(e) => setSetDone(s.id, e.target.checked)}
                      aria-label={
                        s.isWarmup
                          ? `Зроблено, розминка`
                          : `Зроблено, підхід ${setNum}`
                      }
                    />
                  </td>
                  <td className="py-2 pr-2 align-middle">
                    <input
                      type="checkbox"
                      className={uiCheckboxClass}
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
                  <td className="py-2 pr-3">
                    <div className="flex items-center justify-end gap-0.5">
                      {canMergeNext ? (
                        <button
                          type="button"
                          className="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-md text-[var(--sbd-muted)] transition hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_90%)] hover:text-[var(--sbd-red)]"
                          aria-label="Об'єднати з наступним підходом у суперсет"
                          title="Об'єднати з наступним підходом у суперсет"
                          onClick={() => mergeWithNext(setIndex)}
                        >
                          <IconLink />
                        </button>
                      ) : null}
                      {inGroup ? (
                        <button
                          type="button"
                          className="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-md text-[var(--sbd-muted)] transition hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_90%)] hover:text-[var(--sbd-red)]"
                          aria-label="Роз'єднати суперсет"
                          title="Роз'єднати суперсет"
                          onClick={() => dissolveGroup(s.supersetGroup!)}
                        >
                          <IconUnlink />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-md text-[var(--sbd-red)]/90 transition hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_90%)] hover:text-[var(--sbd-red)]"
                        aria-label="Видалити підхід"
                        onClick={() => setConfirm({ kind: "set", id: s.id })}
                      >
                        <IconClose className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className={`mt-3 ${uiAccentGridClass}`}>
        {([1, 2, 3, 4, 5] as const).map((count) => (
          <button
            key={count}
            type="button"
            className={uiButtonAccentClass}
            disabled={isAddingSets}
            onClick={() => void addSet(ex.id, count)}
          >
            {isAddingSets ? "…" : `+${count}`}
          </button>
        ))}
      </div>
    </>
  );
}

export const WorkoutExerciseCard = memo(WorkoutExerciseCardInner, (prev, next) => {
  return (
    prev.ex === next.ex &&
    prev.exerciseIndex === next.exerciseIndex &&
    prev.isChild === next.isChild &&
    prev.exerciseNameError === next.exerciseNameError &&
    prev.isAddingSets === next.isAddingSets &&
    setsDoneEqual(prev.ex.sets, prev.doneMap, next.doneMap) &&
    prev.setExerciseNameErrors === next.setExerciseNameErrors &&
    prev.isSetDone === next.isSetDone &&
    prev.setSetDone === next.setSetDone &&
    prev.setWorkout === next.setWorkout &&
    prev.setConfirm === next.setConfirm &&
    prev.moveSetRelative === next.moveSetRelative &&
    prev.patchExerciseName === next.patchExerciseName &&
    prev.updateSet === next.updateSet &&
    prev.setSupersetGroups === next.setSupersetGroups &&
    prev.addSet === next.addSet
  );
});
