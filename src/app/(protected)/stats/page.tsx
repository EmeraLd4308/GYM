import { Suspense } from "react";
import { getSessionUser } from "@/shared/lib/auth";
import { StatsLazyCharts } from "@/features/stats/components/StatsLazyCharts";
import { StatsOnboardingMark } from "@/features/stats/components/StatsOnboardingMark";
import { StatsFilterForm } from "@/features/stats/components/StatsFilterForm";
import { StreakCard } from "@/features/stats/components/StreakCard";
import { WeekVolumeCompare } from "@/features/stats/components/WeekVolumeCompare";
import { getStatsPageData } from "@/server/queries/stats";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const sp = await searchParams;
  const {
    attendanceSeries,
    streak,
    profileMaxHistory,
    rpeSeries,
    monthCmp,
    rpeHints,
  } = await getStatsPageData(user.id, sp);

  return (
    <div className="sbd-stagger-children space-y-8 md:space-y-10">
      <StatsOnboardingMark />
      <div className="grid gap-4">
        <details className="group sbd-card overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-lg shadow-black/30 transition-[box-shadow,transform] duration-300 open:scale-[1.002] open:shadow-xl open:shadow-black/40 motion-reduce:open:scale-100">
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

        <details className="group sbd-card overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/90 shadow-lg shadow-black/30 transition-[box-shadow,transform] duration-300 open:scale-[1.002] open:shadow-xl open:shadow-black/40 motion-reduce:open:scale-100">
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
                <span className="font-semibold text-zinc-200">RPE</span> — оцінка важкості підходу
                від 1 (легко) до 10 (максимум). На графіках — середнє за тиждень по робочих
                підходах SBD.
              </p>
              <p>
                Якщо RPE не вказано, сервіс може оцінити його з ваги та максимуму з профілю. Графік
                суми максимумів будується зі збережених значень у профілі.
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
          subtitle="Середнє RPE за календарний місяць."
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
