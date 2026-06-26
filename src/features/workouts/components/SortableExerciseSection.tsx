"use client";

import type { ReactNode } from "react";
import { uiButtonDangerTextClass, uiButtonIconClass, uiLabelClass } from "@/shared/ui/styles";

export function SortableExerciseSection({
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDelete,
}: {
  id?: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onDelete?: () => void;
}) {
  const showStepButtons = onMoveUp != null && onMoveDown != null;
  const showToolbar = showStepButtons || onDelete != null;

  return (
    <section className="sbd-card sbd-card-interactive sbd-exercise-section rounded-xl p-4 sm:p-5">
      {showToolbar ? (
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--sbd-border)] pb-3">
          {showStepButtons ? (
            <div className="flex items-center gap-2">
              <p className={`${uiLabelClass} text-[10px]`}>Порядок</p>
              <div className="flex flex-row gap-1">
                <button
                  type="button"
                  className={uiButtonIconClass}
                  aria-label="Вправу вгору"
                  disabled={!canMoveUp}
                  onClick={() => onMoveUp()}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={uiButtonIconClass}
                  aria-label="Вправу вниз"
                  disabled={!canMoveDown}
                  onClick={() => onMoveDown()}
                >
                  ↓
                </button>
              </div>
            </div>
          ) : (
            <span />
          )}
          {onDelete ? (
            <button type="button" className={uiButtonDangerTextClass} onClick={onDelete}>
              Видалити
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="min-w-0 w-full">{children}</div>
    </section>
  );
}
