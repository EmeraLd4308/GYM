"use client";

import { arrayMove } from "@/shared/lib/array-move";
import { BASE_LIFT_OPTIONS } from "@/features/workouts/lib/base-lift";
import type { BaseLift } from "@prisma/client";
import {
  uiButtonDangerIconClass,
  uiButtonIconClass,
  uiInputClass,
  uiLabelClass,
  uiSelectClass,
} from "@/shared/ui/styles";
import { IconArrowDown, IconArrowUp, IconClose } from "@/shared/ui/icons";

export type DraftExercise = {
  clientKey: string;
  name: string;
  baseLift: BaseLift;
};

export function parseDraftExercises(rows: DraftExercise[]) {
  return rows
    .map((row) => ({
      name: row.name.trim(),
      baseLift: row.baseLift,
    }))
    .filter((e) => e.name.length > 0);
}

export function NewWorkoutCustomExercises({
  rows,
  onChange,
}: {
  rows: DraftExercise[];
  onChange: (rows: DraftExercise[]) => void;
}) {
  function addRow() {
    onChange([
      ...rows,
      { clientKey: `draft-ex-${Date.now()}-${rows.length}`, name: "", baseLift: "NONE" },
    ]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function moveRow(index: number, delta: -1 | 1) {
    const next = index + delta;
    if (next < 0 || next >= rows.length) return;
    onChange(arrayMove(rows, index, next));
  }

  function updateRow(index: number, patch: Partial<Pick<DraftExercise, "name" | "baseLift">>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3
          id="new-wo-custom-ex-heading"
          className="text-sm font-semibold text-[var(--sbd-text)]"
        >
          Вправи тренування
        </h3>
        <button
          type="button"
          className="min-h-[44px] touch-manipulation self-start rounded-lg px-1 text-left text-xs font-bold uppercase tracking-wider text-[#e31e24] hover:bg-[#e31e24]/[0.08] hover:text-[#c41a21] sm:min-h-0 sm:self-auto sm:px-0 sm:text-right"
          onClick={addRow}
        >
          + Додати вправу
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--sbd-muted)]">
        Необовʼязково. Можна додати вправи зараз або після створення тренування.
      </p>

      {rows.length > 0 ? (
        <ul className="mt-3 space-y-3" aria-labelledby="new-wo-custom-ex-heading">
          {rows.map((row, i) => (
            <li
              key={row.clientKey}
              className="rounded-xl border border-white/[0.06] bg-black/15 p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className={uiButtonIconClass}
                    aria-label="Вправу вгору"
                    disabled={i === 0}
                    onClick={() => moveRow(i, -1)}
                  >
                    <IconArrowUp />
                  </button>
                  <button
                    type="button"
                    className={uiButtonIconClass}
                    aria-label="Вправу вниз"
                    disabled={i >= rows.length - 1}
                    onClick={() => moveRow(i, 1)}
                  >
                    <IconArrowDown />
                  </button>
                </div>
                <button
                  type="button"
                  className={uiButtonDangerIconClass}
                  aria-label="Видалити вправу"
                  onClick={() => removeRow(i)}
                >
                  <IconClose />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className={`${uiLabelClass} mb-1 block`} htmlFor={`draft-ex-name-${row.clientKey}`}>
                    Назва
                  </label>
                  <input
                    id={`draft-ex-name-${row.clientKey}`}
                    className={`${uiInputClass} w-full`}
                    value={row.name}
                    placeholder="Наприклад, Жим лежачи"
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                  />
                </div>
                <div className="min-w-0">
                  <label className={`${uiLabelClass} mb-1 block`} htmlFor={`draft-ex-base-${row.clientKey}`}>
                    Базова
                  </label>
                  <select
                    id={`draft-ex-base-${row.clientKey}`}
                    className={`${uiSelectClass} w-full`}
                    value={row.baseLift}
                    onChange={(e) => updateRow(i, { baseLift: e.target.value as BaseLift })}
                  >
                    {BASE_LIFT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
