"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LS_KEY = "gym-dashboard-quickguide-dismissed";

export function DashboardQuickGuide({ embedded = false }: { embedded?: boolean }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(LS_KEY) === "1";
    setOpen(!dismissed);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className={`sbd-quick-guide-skeleton h-32 animate-pulse bg-[color-mix(in_oklab,var(--sbd-card)_55%,transparent)] ring-1 ring-[var(--sbd-border)] sm:h-28 ${
          embedded ? "rounded-none" : "rounded-2xl"
        }`}
        aria-hidden
      />
    );
  }

  return (
    <details
      className={
        embedded
          ? "group border-0 bg-transparent shadow-none open:bg-transparent"
          : "sbd-quick-guide-card group sbd-card rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-lg shadow-black/30 open:shadow-xl open:shadow-black/40"
      }
      open={open}
      onToggle={(e) => {
        const el = e.currentTarget;
        setOpen(el.open);
        if (!el.open) {
          try {
            localStorage.setItem(LS_KEY, "1");
          } catch {}
        }
      }}
    >
      <summary className="cursor-pointer list-none px-4 py-3.5 marker:content-none sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[var(--sbd-red)]">
            Куди натиснути
          </span>
          <span
            className="shrink-0 text-[var(--sbd-muted)] transition group-open:rotate-180"
            aria-hidden
          >
            ▼
          </span>
        </span>
      </summary>
      <div className="border-t border-[var(--sbd-border)] px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <p className="mt-2 text-sm leading-relaxed text-[var(--sbd-muted)]">
          <span className="font-medium text-[var(--sbd-text)]">Швидкий старт:</span> знизу список із
          кроку 1 — далі за потреби. На телефоні основні розділи —{" "}
          <span className="text-[var(--sbd-text)]">внизу екрана</span>; шаблони та вихід —{" "}
          <span className="text-[var(--sbd-text)]">вгорі справа</span>. Позивний і аватар — у{" "}
          <Link
            href="/profile"
            className="font-medium text-[var(--sbd-red)] underline-offset-2 hover:underline"
          >
            профілі
          </Link>
          .
        </p>
        <ol className="mt-4 grid list-none gap-2.5 text-sm text-[var(--sbd-muted)] sm:grid-cols-2">
          <li className="sbd-inset-li flex gap-2 rounded-lg bg-[color-mix(in_oklab,var(--sbd-card)_70%,transparent)] px-3 py-2 ring-1 ring-[var(--sbd-border)]">
            <span className="font-display text-[var(--sbd-red)]">1</span>
            <span>
              <Link
                href="/workouts/new"
                className="font-medium text-[var(--sbd-text)] underline-offset-2 hover:underline"
              >
                Нове тренування
              </Link>{" "}
              — запис вправ і підходів.
            </span>
          </li>
          <li className="sbd-inset-li flex gap-2 rounded-lg bg-[color-mix(in_oklab,var(--sbd-card)_70%,transparent)] px-3 py-2 ring-1 ring-[var(--sbd-border)]">
            <span className="font-display text-[var(--sbd-red)]">2</span>
            <span>
              <Link
                href="/calendar"
                className="font-medium text-[var(--sbd-text)] underline-offset-2 hover:underline"
              >
                Календар
              </Link>{" "}
              — дні з тренуваннями.
            </span>
          </li>
          <li className="sbd-inset-li flex gap-2 rounded-lg bg-[color-mix(in_oklab,var(--sbd-card)_70%,transparent)] px-3 py-2 ring-1 ring-[var(--sbd-border)]">
            <span className="font-display text-[var(--sbd-red)]">3</span>
            <span>
              <Link
                href="/stats"
                className="font-medium text-[var(--sbd-text)] underline-offset-2 hover:underline"
              >
                Статистика
              </Link>{" "}
              — RPE та тренованість.
            </span>
          </li>
          <li className="sbd-inset-li flex gap-2 rounded-lg bg-[color-mix(in_oklab,var(--sbd-card)_70%,transparent)] px-3 py-2 ring-1 ring-[var(--sbd-border)]">
            <span className="font-display text-[var(--sbd-red)]">4</span>
            <span>
              <Link
                href="/templates"
                className="font-medium text-[var(--sbd-text)] underline-offset-2 hover:underline"
              >
                Шаблони
              </Link>{" "}
              — збережені плани залу.
            </span>
          </li>
        </ol>
      </div>
    </details>
  );
}
