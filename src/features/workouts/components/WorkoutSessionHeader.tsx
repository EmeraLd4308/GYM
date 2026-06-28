import { formatDateForInput, todayDateInput } from "@/shared/lib/date-local";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
import {
  uiButtonDangerTextClass,
  uiButtonGhostClass,
  uiButtonPrimarySmClass,
  uiDateClass,
  uiInputClass,
  uiInputInlineTitleClass,
  uiLabelClass,
  uiMutedTextClass,
  uiFieldErrorClass,
} from "@/shared/ui/styles";

type Props = Pick<
  WorkoutSessionController,
  | "workout"
  | "titleDraft"
  | "setTitleDraft"
  | "titleError"
  | "setTitleError"
  | "titleSaveState"
  | "setTitleSaveState"
  | "notesSaveState"
  | "setNotesSaveState"
  | "copyDate"
  | "setCopyDate"
  | "copyBusy"
  | "patchTitle"
  | "patchDate"
  | "scheduleNotesSave"
  | "duplicateWorkout"
  | "copyWorkoutAsText"
  | "setWorkout"
  | "setConfirm"
>;

export function WorkoutSessionHeader({
  workout,
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
  patchTitle,
  patchDate,
  scheduleNotesSave,
  duplicateWorkout,
  copyWorkoutAsText,
  setWorkout,
  setConfirm,
}: Props) {
  if (!workout) return null;

  const weekdayLabel = new Date(workout.date).toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="sbd-card rounded-xl p-3.5 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 sm:max-w-xl">
          <label className={`mb-1.5 block ${uiLabelClass}`} htmlFor="wtitle">
            Назва тренування{" "}
            <span className="normal-case text-[11px] font-normal">
              {titleSaveState === "saving"
                ? "· Зберігається…"
                : titleSaveState === "saved"
                  ? "· Збережено"
                  : titleSaveState === "error"
                    ? "· Помилка збереження"
                    : ""}
            </span>
          </label>
          <input
            id="wtitle"
            type="text"
            maxLength={200}
            className={`${uiInputInlineTitleClass} box-border w-full min-w-0 cursor-text text-xl sm:text-lg`}
            placeholder="Наприклад День 3"
            value={titleDraft}
            onChange={(e) => {
              setTitleDraft(e.target.value);
              if (titleError) setTitleError(null);
              if (titleSaveState !== "idle") setTitleSaveState("idle");
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-nowrap sm:items-center sm:gap-2">
          <button
            type="button"
            disabled={copyBusy}
            className={`${uiButtonGhostClass} min-h-11 w-full px-3 text-xs font-bold uppercase tracking-wider sm:w-auto sm:whitespace-nowrap`}
            onClick={() => void copyWorkoutAsText()}
          >
            <span className="sm:hidden">{copyBusy ? "…" : "Копія текстом"}</span>
            <span className="hidden sm:inline">
              {copyBusy ? "Копіювання…" : "Копіювати тренування текстом"}
            </span>
          </button>
          <button
            type="button"
            className={`${uiButtonDangerTextClass} min-h-11 w-full shrink-0 sm:w-auto`}
            onClick={() => setConfirm({ kind: "wo" })}
          >
            Видалити
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className={`mb-2 block ${uiLabelClass}`} htmlFor="wdate">
          Дата тренування
        </label>
        <div className="flex max-w-full flex-wrap items-center gap-x-3 gap-y-1">
          <input
            id="wdate"
            type="date"
            className={`${uiDateClass} shrink-0`}
            value={formatDateForInput(workout.date)}
            onChange={(e) => patchDate(e.target.value)}
          />
          <p className={`${uiMutedTextClass} min-w-0 capitalize leading-none`}>{weekdayLabel}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label className={uiLabelClass} htmlFor="wnotes">
          Нотатки{" "}
          <span className="normal-case text-[11px] font-normal">
            {notesSaveState === "saving"
              ? "· Зберігається…"
              : notesSaveState === "saved"
                ? "· Збережено"
                : notesSaveState === "error"
                  ? "· Помилка збереження"
                  : ""}
          </span>
        </label>
        <textarea
          id="wnotes"
          rows={2}
          className={`${uiInputClass} min-h-[4.5rem] sm:min-h-[5.5rem]`}
          placeholder="Сон, самопочуття, загальний RPE…"
          value={workout.notes ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setWorkout((w) => (w ? { ...w, notes: v } : w));
            if (notesSaveState !== "idle") setNotesSaveState("idle");
            scheduleNotesSave(v);
          }}
        />
      </div>

      <div className="sbd-divider mt-4 border-t pt-4">
        <label className={`${uiLabelClass} block`} htmlFor="copydate">
          Копіювати на дату
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            id="copydate"
            type="date"
            className={`${uiDateClass} w-full max-w-none sm:w-auto`}
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 sm:contents">
            <button
              type="button"
              className={`${uiButtonGhostClass} min-h-11 w-full px-4 text-xs font-bold uppercase tracking-wider sm:w-auto`}
              onClick={() => duplicateWorkout(copyDate)}
            >
              Копіювати
            </button>
            <button
              type="button"
              className={`${uiButtonPrimarySmClass} min-h-11 w-full shrink-0 sm:w-auto`}
              onClick={() => duplicateWorkout(todayDateInput())}
            >
              <span className="sm:hidden">На сьогодні</span>
              <span className="hidden sm:inline">Копія на сьогодні</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
