import { formatDateForInput, todayDateInput } from "@/shared/lib/date-local";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
import {
  uiButtonDangerTextClass,
  uiButtonGhostClass,
  uiButtonPrimarySmClass,
  uiDateCompactClass,
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

  return (
    <div className="sbd-card rounded-xl p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1 md:max-w-xl">
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
            className={`${uiInputInlineTitleClass} box-border w-full min-w-0 cursor-text`}
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
        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 md:justify-end">
          <button
            type="button"
            disabled={copyBusy}
            className={`${uiButtonGhostClass} shrink min-w-0 max-w-full px-3 text-xs font-bold uppercase tracking-wider`}
            onClick={() => void copyWorkoutAsText()}
          >
            {copyBusy ? "Копіювання…" : "Копіювати тренування текстом"}
          </button>
          <button
            type="button"
            className={`${uiButtonDangerTextClass} shrink-0`}
            onClick={() => setConfirm({ kind: "wo" })}
          >
            Видалити
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <label className={`shrink-0 ${uiLabelClass}`} htmlFor="wdate">
          Дата тренування
        </label>
        <input
          id="wdate"
          type="date"
          className={uiDateCompactClass}
          value={formatDateForInput(workout.date)}
          onChange={(e) => patchDate(e.target.value)}
        />
      </div>
      <p className={`mt-2 ${uiMutedTextClass}`}>
        {new Date(workout.date).toLocaleDateString("uk-UA", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
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
          rows={3}
          className={uiInputClass}
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
      <div className="sbd-divider mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1 sm:max-w-[240px]">
          <label className={uiLabelClass} htmlFor="copydate">
            Копіювати це тренування на дату
          </label>
          <input
            id="copydate"
            type="date"
            className={uiDateCompactClass}
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`${uiButtonGhostClass} shrink min-w-0 px-4 text-xs font-bold uppercase tracking-wider`}
            onClick={() => duplicateWorkout(copyDate)}
          >
            Копіювати
          </button>
          <button
            type="button"
            className={`${uiButtonPrimarySmClass} box-border h-11`}
            onClick={() => duplicateWorkout(todayDateInput())}
          >
            Копія на сьогодні
          </button>
        </div>
      </div>
    </div>
  );
}
