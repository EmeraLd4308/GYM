"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LS_KEY = "gym-dashboard-quickguide-dismissed";

export function DashboardQuickGuide() {
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
        className="h-36 animate-pulse rounded-2xl bg-zinc-900/40 ring-1 ring-white/[0.06] sm:h-32"
        aria-hidden
      />
    );
  }

  return (
    <details
      className="group sbd-card rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-950/90 via-black/40 to-black/30 shadow-lg shadow-black/30 open:shadow-xl open:shadow-black/40"
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
          <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[#e31e24]/90">
            Куди натиснути
          </span>
          <span className="shrink-0 text-zinc-500 transition group-open:rotate-180" aria-hidden>
            ▼
          </span>
        </span>
      </summary>
      <div className="border-t border-white/[0.06] px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Навігація: основні розділи — <span className="text-zinc-300">внизу екрана</span> на
          телефоні; шаблони та вихід — <span className="text-zinc-300">вгорі справа</span>. Позивний
          і аватар — у{" "}
          <Link
            href="/profile"
            className="font-medium text-[#e31e24] underline-offset-2 hover:underline"
          >
            профілі
          </Link>
          .
        </p>
        <ol className="mt-4 grid list-none gap-2.5 text-sm text-zinc-400 sm:grid-cols-2">
          <li className="flex gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-white/[0.05]">
            <span className="font-display text-[#e31e24]">1</span>
            <span>
              <Link
                href="/workouts/new"
                className="font-medium text-zinc-200 underline-offset-2 hover:underline"
              >
                Нове тренування
              </Link>{" "}
              — запис вправ і підходів.
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-white/[0.05]">
            <span className="font-display text-[#e31e24]">2</span>
            <span>
              <Link
                href="/calendar"
                className="font-medium text-zinc-200 underline-offset-2 hover:underline"
              >
                Календар
              </Link>{" "}
              — дні з тренуваннями.
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-white/[0.05]">
            <span className="font-display text-[#e31e24]">3</span>
            <span>
              <Link
                href="/stats"
                className="font-medium text-zinc-200 underline-offset-2 hover:underline"
              >
                Статистика
              </Link>{" "}
              — RPE та тренованість.
            </span>
          </li>
          <li className="flex gap-2 rounded-lg bg-black/30 px-3 py-2 ring-1 ring-white/[0.05]">
            <span className="font-display text-[#e31e24]">4</span>
            <span>
              <Link
                href="/templates"
                className="font-medium text-zinc-200 underline-offset-2 hover:underline"
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
