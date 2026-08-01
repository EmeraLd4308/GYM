import { formatDateForInput } from "@/shared/lib/date-local";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
import {
  uiButtonDangerTextClass,
  uiButtonGhostClass,
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

function saveHint(state: "idle" | "saving" | "saved" | "error"): string {
  if (state === "saving") return "· Зберігається…";
  if (state === "saved") return "· Збережено";
  if (state === "error") return "· Помилка";
  return "";
}

const actionBtn = `${uiButtonGhostClass} min-h-11 w-full px-3 text-xs font-bold uppercase tracking-wider sm:w-auto sm:min-w-[9.5rem]`;

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
    <div className="sbd-card rounded-xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <label className={`mb-1.5 block ${uiLabelClass}`} htmlFor="wtitle">
            Назва тренування{" "}
            <span className="normal-case text-[11px] font-normal text-[var(--sbd-muted)]">
              {saveHint(titleSaveState)}
            </span>
          </label>
          <input
            id="wtitle"
            type="text"
            maxLength={200}
            className={`${uiInputInlineTitleClass} box-border w-full min-w-0 cursor-text text-xl`}
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button
            type="button"
            disabled={copyBusy}
            className={actionBtn}
            onClick={() => void copyWorkoutAsText()}
          >
            {copyBusy ? "…" : "Копія текстом"}
          </button>
          <button
            type="button"
            className={`${uiButtonDangerTextClass} min-h-11 w-full sm:w-auto sm:min-w-[9.5rem]`}
            onClick={() => setConfirm({ kind: "wo" })}
          >
            Видалити
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
        <div>
          <label className={`mb-1.5 block ${uiLabelClass}`} htmlFor="wdate">
            Дата тренування
          </label>
          <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
            <input
              id="wdate"
              type="date"
              className={`${uiDateClass} w-full max-w-none sm:w-auto`}
              value={formatDateForInput(workout.date)}
              onChange={(e) => patchDate(e.target.value)}
            />
            <p className={`capitalize ${uiMutedTextClass}`}>{weekdayLabel}</p>
          </div>
        </div>

        <div>
          <label className={`mb-1.5 block ${uiLabelClass}`} htmlFor="wnotes">
            Нотатки{" "}
            <span className="normal-case text-[11px] font-normal text-[var(--sbd-muted)]">
              {saveHint(notesSaveState)}
            </span>
          </label>
          <textarea
            id="wnotes"
            rows={2}
            className={`${uiInputClass} min-h-[4.5rem] w-full resize-y sm:max-w-3xl`}
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
      </div>

      <div className="mt-4 border-t border-[var(--sbd-border)] pt-4 sm:mt-5 sm:pt-5">
        <label className={`mb-1.5 block ${uiLabelClass}`} htmlFor="copydate">
          Копіювати на дату
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            id="copydate"
            type="date"
            className={`${uiDateClass} w-full max-w-none sm:w-auto`}
            value={copyDate}
            onChange={(e) => setCopyDate(e.target.value)}
          />
          <button
            type="button"
            className={actionBtn}
            onClick={() => duplicateWorkout(copyDate)}
          >
            Копіювати
          </button>
        </div>
      </div>
    </div>
  );
}
