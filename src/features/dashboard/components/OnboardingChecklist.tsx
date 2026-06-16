"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ONBOARDING_STATS_EVENT,
  ONBOARDING_STATS_STORAGE_KEY,
} from "@/features/stats/components/StatsOnboardingMark";

const DISMISS_KEY = "gym_onboarding_checklist_dismissed";

const row =
  "flex items-start gap-3 rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_65%,transparent)] px-4 py-3 text-sm text-[var(--sbd-text)]";
const doneBadge =
  "mt-0.5 shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300";
const todoBadge =
  "mt-0.5 shrink-0 rounded-full border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_55%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--sbd-muted)]";

export function OnboardingChecklist({
  profileDone,
  hasWorkout,
  embedded = false,
}: {
  profileDone: boolean;
  hasWorkout: boolean;
  embedded?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [statsDone, setStatsDone] = useState(false);

  const readStats = useCallback(() => {
    try {
      setStatsDone(localStorage.getItem(ONBOARDING_STATS_STORAGE_KEY) === "1");
    } catch {
      setStatsDone(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    readStats();
  }, [readStats]);

  useEffect(() => {
    const onStats = () => readStats();
    window.addEventListener(ONBOARDING_STATS_EVENT, onStats);
    window.addEventListener("focus", onStats);
    return () => {
      window.removeEventListener(ONBOARDING_STATS_EVENT, onStats);
      window.removeEventListener("focus", onStats);
    };
  }, [readStats]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  if (!mounted) return null;
  if (dismissed) return null;
  if (profileDone && hasWorkout && statsDone) return null;

  return (
    <section
      className={
        embedded
          ? "border-0 bg-[color-mix(in_oklab,var(--sbd-red)_7%,transparent)] p-5 sm:p-6"
          : "overflow-hidden rounded-2xl border border-[#e31e24]/25 bg-zinc-950/90 p-5 shadow-xl shadow-black/40 sm:p-6"
      }
      aria-label="Перші кроки"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)] sm:text-lg">
            Перші кроки
          </h2>
          <p className="mt-1 max-w-xl text-xs text-[var(--sbd-muted)] sm:text-sm">
            Профіль → максимуми → тренування → статистика.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 touch-manipulation rounded-lg border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_50%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--sbd-text)] transition hover:bg-[color-mix(in_oklab,var(--sbd-card)_70%,transparent)] active:scale-[0.98]"
        >
          Закрити
        </button>
      </div>

      <ol className="mt-5 space-y-3">
        <li className={row}>
          <span className={profileDone ? doneBadge : todoBadge}>
            {profileDone ? "Готово" : "Крок 1"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--sbd-text)]">Профіль</p>
            <p className="mt-0.5 text-xs text-[var(--sbd-muted)]">Вага або максимуми SBD.</p>
            {!profileDone ? (
              <Link
                href="/profile"
                className="mt-2 inline-flex text-xs font-semibold text-[#e31e24] underline-offset-2 hover:underline"
              >
                Відкрити профіль
              </Link>
            ) : null}
          </div>
        </li>
        <li className={row}>
          <span className={hasWorkout ? doneBadge : todoBadge}>
            {hasWorkout ? "Готово" : "Крок 2"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--sbd-text)]">Перше тренування</p>
            <p className="mt-0.5 text-xs text-[var(--sbd-muted)]">Хоча б одна вправа з підходами.</p>
            {!hasWorkout ? (
              <Link
                href="/workouts/new"
                className="mt-2 inline-flex text-xs font-semibold text-[#e31e24] underline-offset-2 hover:underline"
              >
                Нове тренування
              </Link>
            ) : null}
          </div>
        </li>
        <li className={row}>
          <span className={statsDone ? doneBadge : todoBadge}>
            {statsDone ? "Готово" : "Крок 3"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--sbd-text)]">Статистика</p>
            <p className="mt-0.5 text-xs text-[var(--sbd-muted)]">Графіки RPE та відвідуваність.</p>
            {!statsDone ? (
              <Link
                href="/stats"
                className="mt-2 inline-flex text-xs font-semibold text-[#e31e24] underline-offset-2 hover:underline"
              >
                Відкрити статистику
              </Link>
            ) : null}
          </div>
        </li>
      </ol>
    </section>
  );
}
