import { baseLiftLabel } from "@/features/workouts/lib/base-lift";
import type { ExerciseRow } from "@/features/workouts/lib/workout-session-types";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
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

type Props = {
  ex: ExerciseRow;
  exerciseIndex: number;
} & Pick<
  WorkoutSessionController,
  | "exerciseNameErrors"
  | "setExerciseNameErrors"
  | "addingSetsFor"
  | "isSetDone"
  | "setSetDone"
  | "setWorkout"
  | "setConfirm"
  | "moveSetRelative"
  | "patchExerciseName"
  | "updateSet"
  | "addSet"
>;

export function WorkoutExerciseCard({
  ex,
  exerciseIndex,
  exerciseNameErrors,
  setExerciseNameErrors,
  addingSetsFor,
  isSetDone,
  setSetDone,
  setWorkout,
  setConfirm,
  moveSetRelative,
  patchExerciseName,
  updateSet,
  addSet,
}: Props) {
  return (
    <>
      <div className="mb-4">
        <div className="min-w-0 w-full sm:max-w-xl">
          <label className="sr-only" htmlFor={`ex-name-${ex.id}`}>
            Назва вправи {exerciseIndex + 1}
          </label>
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 font-display text-sm font-bold text-[var(--sbd-muted)]">
              {exerciseIndex + 1}.
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
              onBlur={() => patchExerciseName(ex.id, ex.name)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
            />
          </div>
          <p className={`mt-1 text-xs uppercase tracking-wider ${uiMutedTextClass}`}>
            {baseLiftLabel(ex.baseLift)}
          </p>
          {exerciseNameErrors[ex.id] ? (
            <p className={uiFieldErrorClass} role="alert">
              {exerciseNameErrors[ex.id]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {ex.sets.map((s, setIndex) => (
          <div key={s.id} className={uiSetCardClass}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className={uiLabelClass}>Підхід {setIndex + 1}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={uiButtonIconSmClass}
                  aria-label="Підхід вгору"
                  disabled={setIndex === 0}
                  onClick={() => moveSetRelative(ex.id, s.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={uiButtonIconSmClass}
                  aria-label="Підхід вниз"
                  disabled={setIndex >= ex.sets.length - 1}
                  onClick={() => moveSetRelative(ex.id, s.id, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={uiButtonDangerIconClass}
                  aria-label="Видалити підхід"
                  onClick={() => setConfirm({ kind: "set", id: s.id })}
                >
                  ×
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
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <div className="overflow-hidden rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_92%,transparent)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] [html[data-theme=light]_&]:shadow-[inset_0_1px_0_0_rgba(0,0,0,0.04)]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_75%,var(--sbd-red))] text-left text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]">
                <th className="w-[2.75rem] py-2.5 pl-3 pr-1 text-center">Пор.</th>
                <th className="py-2.5 pr-2">Вага (кг)</th>
                <th className="py-2.5 pr-2">Повтори</th>
                <th className="w-[4.5rem] py-2.5 pr-2">Зроблено</th>
                <th className="w-[4.5rem] py-2.5 pr-2">Розминка</th>
                <th className="w-10 py-2.5 pr-3" />
              </tr>
            </thead>
            <tbody>
              {ex.sets.map((s, setIndex) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--sbd-border)] transition-colors last:border-b-0 hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_96%)]"
                >
                  <td className="py-2 pl-3 pr-1 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        className={uiButtonIconSmClass}
                        aria-label="Підхід вгору"
                        disabled={setIndex === 0}
                        onClick={() => moveSetRelative(ex.id, s.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={uiButtonIconSmClass}
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
                      aria-label={`Зроблено, підхід ${setIndex + 1}`}
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
                  <td className="py-2 pr-3 text-right">
                    <button
                      type="button"
                      className="text-[var(--sbd-red)]/90 transition hover:text-[var(--sbd-red)]"
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
      </div>
      <div className={`mt-3 ${uiAccentGridClass}`}>
        {([1, 2, 3, 4, 5] as const).map((count) => (
          <button
            key={count}
            type="button"
            className={uiButtonAccentClass}
            disabled={addingSetsFor === ex.id}
            onClick={() => void addSet(ex.id, count)}
          >
            {addingSetsFor === ex.id ? "…" : `+${count}`}
          </button>
        ))}
      </div>
    </>
  );
}
