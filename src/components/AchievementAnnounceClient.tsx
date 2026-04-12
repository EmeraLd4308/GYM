"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Pending = { id: string; title: string };

export function AchievementAnnounceClient() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Pending[]>([]);

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

  async function dismiss() {
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
  }

  if (!open || items.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-labelledby="ach-announce-title"
    >
      <div className="sbd-card max-h-[min(85dvh,32rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e31e24]/35 p-6 shadow-2xl">
        <h2 id="ach-announce-title" className="font-display text-lg font-bold text-[var(--sbd-text)]">
          Нові досягнення!
        </h2>
        <p className="mt-2 text-sm text-[var(--sbd-muted)]">
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
          type="button"
          className="mt-6 w-full min-h-[48px] rounded-xl bg-[#e31e24] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 hover:bg-[#c41a21]"
          onClick={() => void dismiss()}
        >
          Чудово
        </button>
      </div>
    </div>
  );
}
