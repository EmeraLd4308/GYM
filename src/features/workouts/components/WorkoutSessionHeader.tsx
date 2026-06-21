import { formatDateForInput, todayDateInput } from "@/shared/lib/date-local";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
import {
  uiBtnRowMobileStackClass,
  uiButtonDangerTextClass,
  uiButtonGhostClass,
  uiButtonPrimarySmClass,
  uiDateClass,
  uiFormRowClass,
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
    <div className="sbd-card rounded-xl p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
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
        <div className={`shrink-0 ${uiBtnRowMobileStackClass} sm:flex-nowrap sm:justify-end`}>
          <button
            type="button"
            disabled={copyBusy}
            className={`${uiButtonGhostClass} whitespace-normal px-3 text-xs font-bold uppercase tracking-wider sm:whitespace-nowrap`}
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
      <div className={`mt-4 ${uiFormRowClass}`}>
        <label className={uiLabelClass} htmlFor="wdate">
          Дата тренування
        </label>
        <input
          id="wdate"
          type="date"
          className={uiDateClass}
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
      <div className="sbd-divider mt-4 border-t pt-4">
        <label className={`${uiLabelClass} block`} htmlFor="copydate">
          Копіювати це тренування на дату
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            id="copydate"
            type="date"
            className={uiDateClass}
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
          <div className={`${uiBtnRowMobileStackClass} sm:w-auto sm:flex-nowrap`}>
            <button
              type="button"
              className={`${uiButtonGhostClass} px-4 text-xs font-bold uppercase tracking-wider`}
              onClick={() => duplicateWorkout(copyDate)}
            >
              Копіювати
            </button>
            <button
              type="button"
              className={`${uiButtonPrimarySmClass} shrink-0`}
              onClick={() => duplicateWorkout(todayDateInput())}
            >
              Копія на сьогодні
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
