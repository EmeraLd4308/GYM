"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

const moveBtn =
  "flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded border border-white/15 bg-black/40 text-lg leading-none text-zinc-200 transition enabled:active:scale-95 enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
      className={`sbd-card sbd-card-interactive rounded-xl p-5 ${
        isDragging ? "ring-2 ring-[#e31e24]/45 shadow-[0_0_24px_-4px_rgba(227,30,36,0.35)]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 items-stretch gap-1.5">
          <button
            type="button"
            className="touch-none mt-0.5 min-h-[44px] min-w-[40px] cursor-grab touch-manipulation rounded border border-white/10 bg-black/30 px-2 py-2 text-zinc-500 hover:text-zinc-300 active:cursor-grabbing"
            style={{ touchAction: "none" }}
            {...attributes}
            {...listeners}
            aria-label="Перетягнути вправу"
          >
            ⋮⋮
          </button>
          {showStepButtons ? (
            <div className="flex flex-col gap-1 md:hidden">
              <button
                type="button"
                className={moveBtn}
                aria-label="Перемістити вправу вгору"
                disabled={!canMoveUp}
                onClick={() => onMoveUp()}
              >
                ↑
              </button>
              <button
                type="button"
                className={moveBtn}
                aria-label="Перемістити вправу вниз"
                disabled={!canMoveDown}
                onClick={() => onMoveDown()}
              >
                ↓
              </button>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
