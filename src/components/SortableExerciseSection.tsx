"use client";

import type { ReactNode } from "react";

const moveBtn =
  "flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg border border-white/15 bg-black/40 text-lg leading-none text-zinc-200 transition enabled:active:scale-95 enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

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
          <div className="flex shrink-0 flex-row items-center gap-2 border-b border-white/[0.08] pb-3 md:flex-col md:border-b-0 md:pb-0 md:items-stretch">
            <div className="flex flex-row gap-1 md:flex-col">
              <button
                type="button"
                className={moveBtn}
                aria-label="Вправу вгору"
                disabled={!canMoveUp}
                onClick={() => onMoveUp()}
              >
                ↑
              </button>
              <button
                type="button"
                className={moveBtn}
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
