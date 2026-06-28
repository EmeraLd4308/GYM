export function DashboardWelcome({
  login,
  workoutTotal,
  todayLabel,
}: {
  login: string;
  workoutTotal: number;
  todayLabel: string;
}) {
  return (
    <section
      aria-labelledby="dashboard-greeting"
      className="sbd-gl-preview relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--sbd-red),transparent_70%)] bg-[color-mix(in_oklab,var(--sbd-card)_15%,black)] px-4 py-5 shadow-xl shadow-black/50 sm:px-6 sm:py-5"
    >
      <div
        className="sbd-gl-preview-deco pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[color-mix(in_oklab,var(--sbd-red),transparent_80%)] blur-3xl sm:-right-12 sm:-top-12 sm:h-40 sm:w-40"
        aria-hidden
      />
      <div
        className="sbd-gl-preview-deco pointer-events-none absolute -bottom-16 -left-10 h-28 w-28 rounded-full bg-[color-mix(in_oklab,var(--sbd-red),transparent_88%)] blur-3xl sm:h-32 sm:w-32"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3 sm:items-center sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color-mix(in_oklab,var(--sbd-red),transparent_10%)]">
            Powerlifting tracker
          </p>
          <h1
            id="dashboard-greeting"
            className="mt-1 font-display text-[1.625rem] font-bold leading-[1.15] tracking-tight text-[var(--sbd-text)] sm:text-[1.75rem]"
          >
            Привіт, {login}
          </h1>
          <p className="mt-1.5 text-sm leading-snug text-[var(--sbd-muted)]">{todayLabel}</p>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--sbd-border),var(--sbd-red)_22%)] bg-[color-mix(in_oklab,var(--sbd-elevated)_88%,transparent)] px-3 py-2.5 text-center backdrop-blur-sm sm:min-w-[6.5rem] sm:px-4">
          <span className="font-display text-2xl font-bold leading-none tabular-nums text-[var(--sbd-text)] sm:text-[1.65rem]">
            {workoutTotal}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--sbd-muted)]">
            записів
          </span>
        </div>
      </div>
    </section>
  );
}
