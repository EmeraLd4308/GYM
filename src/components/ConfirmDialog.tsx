"use client";

import type { ReactNode } from "react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uiButtonPrimaryClass, uiButtonSecondaryClass } from "@/components/ui/styles";

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
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    const root = dialogRef.current;
    if (!root) return;

    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(root.querySelectorAll<HTMLElement>(selector));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      if (!active || active === last || !root.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const ui = (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto overflow-x-hidden overscroll-contain bg-black/75 p-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="sbd-card my-auto max-h-[min(85dvh,calc(100dvh-2rem))] w-full max-w-md shrink-0 overflow-y-auto rounded-xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-lg font-bold text-white">
          {title}
        </h2>
        {description ? (
          <div id={descriptionId} className="mt-2 text-sm leading-relaxed text-zinc-400">
            {description}
          </div>
        ) : null}
        {children}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            className={uiButtonSecondaryClass}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${uiButtonPrimaryClass} ${
              danger
                ? "border border-red-500/50 bg-red-600 hover:bg-red-500"
                : "shadow-lg shadow-red-950/40"
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
  );

  if (typeof document === "undefined" || !mounted) return null;

  return createPortal(ui, document.body);
}
