"use client";

import type { ReactNode } from "react";
import { uiButtonIconClass, uiLabelClass } from "@/shared/ui/styles";

export function SortableExerciseSection({
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  id?: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const showStepButtons = onMoveUp != null && onMoveDown != null;

  return (
    <section className="sbd-card sbd-card-interactive rounded-xl p-4 sm:p-5">
      <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-start md:gap-3">
        {showStepButtons ? (
          <div className="sbd-divider flex shrink-0 flex-row items-center gap-2 border-b pb-3 md:flex-col md:border-b-0 md:pb-0 md:items-stretch">
            <p className={`${uiLabelClass} text-[10px] md:hidden`}>Порядок</p>
            <div className="flex flex-row gap-1 md:flex-col">
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
        ) : null}
        <div className="min-w-0 w-full flex-1">{children}</div>
      </div>
    </section>
  );
}
