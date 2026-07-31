"use client";

import type { ReactNode } from "react";
import { uiButtonDangerTextClass, uiButtonIconClass, uiLabelClass } from "@/shared/ui/styles";
import { IconArrowDown, IconArrowUp, IconClose } from "@/shared/ui/icons";

export function ExerciseToolbarSection({
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDelete,
  flat = false,
}: {
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onDelete?: () => void;
  flat?: boolean;
}) {
  const showStepButtons = onMoveUp != null && onMoveDown != null;
  const showToolbar = showStepButtons || onDelete != null;
  const sectionClass = flat
    ? "sbd-exercise-section rounded-xl p-4 sm:p-5"
    : "sbd-card sbd-card-interactive sbd-exercise-section rounded-xl p-4 sm:p-5";

  return (
    <section className={sectionClass}>
      {showToolbar ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--sbd-border)] pb-3">
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
                  <IconArrowUp />
                </button>
                <button
                  type="button"
                  className={uiButtonIconClass}
                  aria-label="Вправу вниз"
                  disabled={!canMoveDown}
                  onClick={() => onMoveDown()}
                >
                  <IconArrowDown />
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

export function ExerciseSection({
  children,
  onDelete,
}: {
  children: ReactNode;
  onDelete?: () => void;
}) {
  return (
    <section className="sbd-exercise-section relative rounded-xl p-3 sm:p-4">
      {onDelete ? (
        <button
          type="button"
          className="absolute right-2 top-2 z-10 inline-flex min-h-[2rem] min-w-[2rem] items-center justify-center rounded-md text-[var(--sbd-red)]/80 transition hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_90%)] hover:text-[var(--sbd-red)]"
          aria-label="Видалити дочірню вправу"
          onClick={onDelete}
        >
          <IconClose className="h-4 w-4" />
        </button>
      ) : null}
      <div className="min-w-0 w-full">{children}</div>
    </section>
  );
}
