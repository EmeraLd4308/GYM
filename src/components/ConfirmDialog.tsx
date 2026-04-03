"use client";

import type { ReactNode } from "react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Так",
  cancelLabel = "Скасувати",
  danger,
  children,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  children?: ReactNode;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] overflow-y-auto overflow-x-hidden overscroll-contain bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onClose}
    >
      <div
        className="flex min-h-[100dvh] w-full flex-col items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={onClose}
      >
        <div
          className="sbd-card my-4 max-h-[min(85dvh,calc(100dvh-2rem))] w-full max-w-md shrink-0 overflow-y-auto rounded-xl p-5 shadow-2xl sm:my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="confirm-dialog-title" className="font-display text-lg font-bold text-white">
            {title}
          </h2>
          {description ? (
            <div className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</div>
          ) : null}
          {children}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              className="min-h-[44px] touch-manipulation rounded-md border border-white/15 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`min-h-[44px] touch-manipulation rounded-md px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition ${
                danger
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-[#e31e24] shadow-lg shadow-red-950/40 hover:bg-[#c41a21]"
              }`}
              onClick={async () => {
                await Promise.resolve(onConfirm());
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
