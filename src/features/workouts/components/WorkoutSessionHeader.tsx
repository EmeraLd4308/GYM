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

const actionBtnClass =
  "sbd-btn sbd-btn--ghost sbd-btn--lift min-h-11 w-full px-3 text-xs font-bold uppercase tracking-wider";

const dangerBtnClass = "sbd-btn sbd-btn--danger-text min-h-11 w-full px-3 text-xs font-bold uppercase";

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
      <div className="space-y-3">
        <div className="min-w-0">
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end sm:gap-2">
          <button
            type="button"
            disabled={copyBusy}
            className={`${actionBtnClass} sm:w-auto`}
            onClick={() => void copyWorkoutAsText()}
          >
            <span className="sm:hidden">{copyBusy ? "…" : "Текстом"}</span>
            <span className="hidden sm:inline">
              {copyBusy ? "Копіювання…" : "Копіювати тренування текстом"}
            </span>
          </button>
          <button
            type="button"
            className={`${dangerBtnClass} sm:w-auto`}
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
        <div className="mt-2 space-y-2 sm:flex sm:items-center sm:gap-3 sm:space-y-0">
          <input
            id="copydate"
            type="date"
            className={`${uiDateClass} w-full max-w-none sm:w-auto`}
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:gap-2">
            <button
              type="button"
              className={`${uiButtonGhostClass} min-h-11 w-full px-3 text-xs font-bold uppercase tracking-wider sm:w-auto`}
              onClick={() => duplicateWorkout(copyDate)}
            >
              Копіювати
            </button>
            <button
              type="button"
              className={`${uiButtonPrimarySmClass} min-h-11 w-full sm:w-auto`}
              onClick={() => duplicateWorkout(todayDateInput())}
            >
              <span className="sm:hidden">Сьогодні</span>
              <span className="hidden sm:inline">Копія на сьогодні</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
