import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { buildWeeklySbdRpeSeries, type ProfileSbdMaxKg } from "@/lib/weekly-rpe";
import { buildWeeklyAttendanceSeries } from "@/lib/weekly-attendance";
import { getProfileMaxHistoryPoints } from "@/lib/profile-max-history";
import {
  parseStatsFiltersFromSearchParams,
  workoutWhereDateRange,
  applyWeightFilterForVolume,
} from "@/lib/stats-filters";
import { streakWeeksWithThreePlus } from "@/lib/streak";
import { compareMonthVsPrevious } from "@/lib/period-compare";
import { StatsLazyCharts } from "@/components/StatsLazyCharts";
import { StatsOnboardingMark } from "@/components/StatsOnboardingMark";
import { StatsFilterForm } from "@/components/StatsFilterForm";
import { StreakCard } from "@/components/StreakCard";
import { WeekVolumeCompare } from "@/components/WeekVolumeCompare";
import type { WeeklyRpeChartHints } from "@/components/WeeklyCharts";

function positiveKg(v: unknown): boolean {
  if (v == null) return false;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0;
}

function profileMaxFromUser(u: {
  glMaxBenchKg: unknown;
  glMaxSquatKg: unknown;
  glMaxDeadliftKg: unknown;
}): ProfileSbdMaxKg {
  return {
    bench: positiveKg(u.glMaxBenchKg) ? Number(u.glMaxBenchKg) : null,
    squat: positiveKg(u.glMaxSquatKg) ? Number(u.glMaxSquatKg) : null,
    deadlift: positiveKg(u.glMaxDeadliftKg) ? Number(u.glMaxDeadliftKg) : null,
  };
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const sp = await searchParams;
  const filters = parseStatsFiltersFromSearchParams(sp);
  const dateFilter = workoutWhereDateRange(filters);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });

  const attendanceSeries = buildWeeklyAttendanceSeries(workouts);
  const streak = streakWeeksWithThreePlus(attendanceSeries);
  const profileMaxHistory = await getProfileMaxHistoryPoints(user.id);

  const rpeWorkouts = applyWeightFilterForVolume(workouts, filters.weightMin, filters.weightMax);
  const profileMaxKg = profileMaxFromUser(user);
  const rpeSeries = buildWeeklySbdRpeSeries(rpeWorkouts, profileMaxKg);
  const monthCmp = compareMonthVsPrevious(rpeSeries);

  const rpeHints: WeeklyRpeChartHints = {
    bench: {
      noTraining: !rpeWorkouts.some((w) =>
        w.exercises.some((ex) => ex.baseLift === "BENCH" && ex.sets.some((s) => !s.isWarmup)),
      ),
      noProfileMax: !positiveKg(user.glMaxBenchKg),
    },
    squat: {
      noTraining: !rpeWorkouts.some((w) =>
        w.exercises.some((ex) => ex.baseLift === "SQUAT" && ex.sets.some((s) => !s.isWarmup)),
      ),
      noProfileMax: !positiveKg(user.glMaxSquatKg),
    },
    deadlift: {
      noTraining: !rpeWorkouts.some((w) =>
        w.exercises.some((ex) => ex.baseLift === "DEADLIFT" && ex.sets.some((s) => !s.isWarmup)),
      ),
      noProfileMax: !positiveKg(user.glMaxDeadliftKg),
    },
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <StatsOnboardingMark />
      <div className="grid gap-4">
        <details className="group sbd-card overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-950/90 via-black/40 to-black/30 shadow-lg shadow-black/30 open:shadow-xl open:shadow-black/40">
          <summary className="cursor-pointer list-none px-4 py-3.5 marker:content-none sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[#e31e24]/90">
                Фільтри статистики
              </span>
              <span className="shrink-0 text-zinc-500 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </span>
          </summary>
          <div className="border-t border-white/[0.06] p-2 sm:p-3">
            <Suspense
              fallback={
                <div className="h-72 animate-pulse rounded-2xl bg-zinc-900/50 ring-1 ring-white/[0.06]" />
              }
            >
              <StatsFilterForm />
            </Suspense>
          </div>
        </details>

        <details className="group sbd-card overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-950/90 via-black/40 to-black/30 shadow-lg shadow-black/30 open:shadow-xl open:shadow-black/40">
          <summary className="cursor-pointer list-none px-4 py-3.5 marker:content-none sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-[#e31e24]/90">
                Що таке RPE і як читати графіки
              </span>
              <span className="shrink-0 text-zinc-500 transition group-open:rotate-180" aria-hidden>
                ▼
              </span>
            </span>
          </summary>
          <aside className="border-t border-white/[0.06] p-5 sm:p-6">
            <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
              <p>
                <span className="font-semibold text-zinc-200">RPE</span> (Rate of Perceived Exertion,
                «шкала зусиль») — це суб&apos;єктивна оцінка важкості підходу за шкалою приблизно{" "}
                <span className="text-zinc-200">від 1 до 10</span>: 1 — дуже легко, 10 — максимум на
                межі відмови (немає запасу повторів). Проміжні значення описують, скільки «запасу»
                залишилось би після підходу (на кшталт «RPE 8 ≈ міг би зробити ще ~2 повтори» —
                орієнтир, не точна наука).
              </p>
              <p>
                На графіках RPE по тижнях показано <span className="text-zinc-200">середнє</span> по
                робочих підходах базових вправ (розминка не враховується). Якщо в журналі RPE не
                вказано — за наявності <span className="text-zinc-200">максимумів у профілі</span>{" "}
                (присяд / жим / тяга) і ваги підходу будується{" "}
                <span className="text-zinc-200">груба оцінка</span>; дата береться з дня тренування.
              </p>
              <p>
                Графік <span className="text-zinc-200">суми максимумів SBD (кг)</span> будується з
                профілю: кожна точка — момент, коли ти зберіг нові значення присяд / жим / тяга. Лінія
                рухається вгору або вниз разом із зміною суми цих трьох полів. На широкому екрані він
                поруч із відвідуваністю, як і раніше.
              </p>
            </div>
          </aside>
        </details>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <StreakCard weeks={streak} />
        <WeekVolumeCompare
          data={
            monthCmp
              ? {
                  prev: { ...monthCmp.prev, weekLabel: monthCmp.prev.label },
                  curr: { ...monthCmp.curr, weekLabel: monthCmp.curr.label },
                }
              : null
          }
          title="RPE: цей місяць vs попередній"
          subtitle="Порівняння середнього RPE за календарні місяці."
          decimals={2}
        />
      </div>

      <StatsLazyCharts
        attendanceSeries={attendanceSeries}
        profileMaxHistory={profileMaxHistory}
        rpeSeries={rpeSeries}
        rpeHints={rpeHints}
      />
    </div>
  );
}
