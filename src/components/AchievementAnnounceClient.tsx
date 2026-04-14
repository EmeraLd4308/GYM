"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { uiButtonPrimaryClass } from "@/components/ui/styles";

type Pending = { id: string; title: string };

export function AchievementAnnounceClient() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Pending[]>([]);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const primaryActionRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements/pending");
      const data = (await res.json()) as { pending?: Pending[] };
      const p = data.pending ?? [];
      if (p.length > 0) {
        setItems(p);
        setOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (pathname === "/profile") void load();
  }, [pathname, load]);

  const dismiss = useCallback(async () => {
    if (items.length > 0) {
      try {
        await fetch("/api/achievements/ack", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: items.map((i) => i.id) }),
        });
      } catch {}
    }
    setOpen(false);
    setItems([]);
  }, [items]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    primaryActionRef.current?.focus();
    const root = dialogRef.current;
    if (!root) return;

    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        void dismiss();
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
  }, [open, dismiss]);

  if (!open || items.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={() => void dismiss()}
    >
      <div
        ref={dialogRef}
        className="sbd-card max-h-[min(85dvh,32rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e31e24]/35 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-lg font-bold text-[var(--sbd-text)]">
          Нові досягнення!
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-[var(--sbd-muted)]">
          Ти розблокував нагороди за максимуми та GL-профілем. Закріпи до трьох у профілі — вони
          з&apos;являться в рейтингу.
        </p>
        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="rounded-lg border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-3 py-2 text-sm font-medium text-[var(--sbd-text)]"
            >
              {it.title}
            </li>
          ))}
        </ul>
        <button
          ref={primaryActionRef}
          type="button"
          className={`${uiButtonPrimaryClass} mt-6 w-full min-h-[48px] rounded-xl py-3 shadow-lg shadow-red-950/30`}
          onClick={() => void dismiss()}
        >
          Чудово
        </button>
      </div>
    </div>
  );
}
