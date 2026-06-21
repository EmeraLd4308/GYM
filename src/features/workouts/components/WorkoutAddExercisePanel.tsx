import { BASE_LIFT_OPTIONS } from "@/features/workouts/lib/base-lift";
import type { BaseLift } from "@prisma/client";
import type { WorkoutSessionController } from "@/features/workouts/lib/use-workout-session";
import {
  uiButtonPrimaryClass,
  uiFieldErrorClass,
  uiInputClass,
  uiLabelClass,
  uiPanelDashedClass,
  uiMutedTextClass,
  uiSelectClass,
} from "@/shared/ui/styles";

type Props = Pick<
  WorkoutSessionController,
  | "newExName"
  | "setNewExName"
  | "newExBase"
  | "setNewExBase"
  | "newExerciseError"
  | "setNewExerciseError"
  | "addExercise"
>;

export function WorkoutAddExercisePanel({
  newExName,
  setNewExName,
  newExBase,
  setNewExBase,
  newExerciseError,
  setNewExerciseError,
  addExercise,
}: Props) {
  return (
    <div className={uiPanelDashedClass}>
      <h3 className={`mb-3 font-display text-sm font-semibold uppercase tracking-wide ${uiMutedTextClass}`}>
        Додати вправу
      </h3>
      <div className="flex flex-col gap-3">
        <div className="w-full min-w-0">
          <label htmlFor="new-exercise-name" className={`${uiLabelClass} mb-1 block`}>
            Назва
          </label>
          <input
            id="new-exercise-name"
            className={`${uiInputClass} w-full`}
            placeholder="Наприклад, Жим лежачи"
            value={newExName}
            onChange={(e) => {
              setNewExName(e.target.value);
              if (newExerciseError) setNewExerciseError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addExercise();
              }
            }}
            aria-invalid={newExerciseError ? "true" : "false"}
            aria-describedby={newExerciseError ? "new-exercise-error" : undefined}
          />
        </div>
        <div className="w-full min-w-0">
          <label htmlFor="new-exercise-base" className={`${uiLabelClass} mb-1 block`}>
            Базова для статистики
          </label>
          <select
            id="new-exercise-base"
            className={`${uiSelectClass} w-full`}
            value={newExBase}
            onChange={(e) => setNewExBase(e.target.value as BaseLift)}
          >
            {BASE_LIFT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={`${uiButtonPrimaryClass} w-full sm:w-auto sm:self-start`}
          onClick={() => void addExercise()}
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
  );
}
