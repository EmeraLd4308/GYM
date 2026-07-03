import { STREAK_MIN_WORKOUTS } from "@/features/stats/lib/streak";

function StreakFlameIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className ?? "h-14 w-14 sm:h-16 sm:w-16"} ${active ? "sbd-streak-flame--active" : "sbd-streak-flame--idle"}`}
      aria-hidden
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.395 2.597a.749.749 0 0 0-.79 0C9.443 3.997 8.25 6.136 8.25 8.438V9c0 2.207-.83 4.216-2.206 5.737A6.96 6.96 0 0 0 5.25 15.5a6.96 6.96 0 0 0 11.99 0 6.967 6.967 0 0 0-.794-4.763A7.97 7.97 0 0 1 18.75 9v-.562c0-2.302-1.193-4.441-3.355-5.841a.749.749 0 0 0-.79 0C12.443 3.997 11.25 6.136 11.25 8.438V9c0 2.207-.83 4.216-2.206 5.737A6.96 6.96 0 0 0 5.25 15.5a6.96 6.96 0 0 0 11.99 0Z"
      />
    </svg>
  );
}

function weekLabel(weeks: number): string {
  if (weeks === 1) return "тиждень";
  if (weeks > 1 && weeks < 5) return "тижні";
  return "тижнів";
}

export function StreakCard({ weeks }: { weeks: number }) {
  const active = weeks > 0;

  return (
    <section
      className="sbd-streak-card sbd-card sbd-surface-shine flex h-full flex-col rounded-xl p-5"
      aria-labelledby="streak-card-title"
    >
      <h3
        id="streak-card-title"
        className="shrink-0 font-display text-sm font-bold uppercase tracking-wide text-white"
      >
        Streak тренувань
      </h3>

      <div
        className={`sbd-streak-hero relative mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl ${active ? "sbd-streak-hero--active" : ""}`}
        aria-label={`${weeks} ${weekLabel(weeks)} підряд з щонайменше ${STREAK_MIN_WORKOUTS} тренуваннями на тиждень`}
      >
        <div className="sbd-streak-hero__glow pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative flex h-full w-full flex-1 items-center justify-center px-4 py-6 sm:px-6">
          <div
            className={`sbd-streak-metric flex items-end gap-4 sm:gap-5 ${active ? "sbd-streak-metric--active" : ""}`}
          >
            <div
              className={`sbd-streak-icon-wrap shrink-0 ${active ? "sbd-streak-icon-wrap--active" : ""}`}
            >
              <StreakFlameIcon active={active} />
            </div>

            <p className="flex items-end gap-2.5 whitespace-nowrap sm:gap-3">
              <span className="font-display text-[4.5rem] font-bold leading-none tabular-nums tracking-tight text-white sm:text-[5.25rem]">
                {weeks}
              </span>
              <span className="pb-1 text-xs font-semibold uppercase leading-none tracking-[0.1em] text-zinc-400 sm:pb-1.5 sm:text-sm">
                {weekLabel(weeks)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
