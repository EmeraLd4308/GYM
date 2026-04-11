"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ONBOARDING_STATS_EVENT,
  ONBOARDING_STATS_STORAGE_KEY,
} from "@/components/StatsOnboardingMark";

const DISMISS_KEY = "gym_onboarding_checklist_dismissed";

const row =
  "flex items-start gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-zinc-200";
const doneBadge =
  "mt-0.5 shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300";
const todoBadge =
  "mt-0.5 shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500";

export function OnboardingChecklist({
  profileDone,
  hasWorkout,
}: {
  profileDone: boolean;
  hasWorkout: boolean;
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
      className="overflow-hidden rounded-2xl border border-[#e31e24]/25 bg-gradient-to-br from-[#e31e24]/[0.12] via-zinc-950/90 to-black/90 p-5 shadow-xl shadow-black/40 sm:p-6"
      aria-label="Перші кроки"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold uppercase tracking-wide text-white sm:text-lg">
            Перші кроки
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Після реєстрації варто заповнити профіль, додати тренування й зазирнути в статистику —
            так швидше зʼявляться графіки та порівняння тижнів.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 touch-manipulation rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.98]"
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
            <p className="font-medium text-white">Профіль</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Вага тіла або максимуми SBD — для GL і точніших підказок.
            </p>
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
            <p className="font-medium text-white">Перше тренування</p>
            <p className="mt-0.5 text-xs text-zinc-500">Запиши підходи й вагу — журнал оживе.</p>
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
            <p className="font-medium text-white">Статистика</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Тижневі графіки RPE, відвідуваність і серії.
            </p>
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
