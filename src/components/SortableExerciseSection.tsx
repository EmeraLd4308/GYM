"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

const moveBtn =
  "flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg border border-white/15 bg-black/40 text-lg leading-none text-zinc-200 transition enabled:active:scale-95 enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

export function SortableExerciseSection({
  id,
  children,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  id: string;
  children: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  const showStepButtons = onMoveUp != null && onMoveDown != null;

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={`sbd-card sbd-card-interactive rounded-xl p-4 sm:p-5 ${
        isDragging ? "ring-2 ring-[#e31e24]/45 shadow-[0_0_24px_-4px_rgba(227,30,36,0.35)]" : ""
      }`}
    >
      <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-start md:gap-3">
        <div className="flex shrink-0 flex-row items-center gap-2 border-b border-white/[0.08] pb-3 md:flex-col md:border-b-0 md:pb-0 md:items-stretch">
          <button
            type="button"
            className="touch-none min-h-[44px] min-w-[44px] cursor-grab touch-manipulation rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
            style={{ touchAction: "none" }}
            {...attributes}
            {...listeners}
            aria-label="Перетягнути вправу"
          >
            ⋮⋮
          </button>
          {showStepButtons ? (
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
          ) : null}
        </div>
        <div className="min-w-0 w-full flex-1">{children}</div>
      </div>
    </section>
  );
}
