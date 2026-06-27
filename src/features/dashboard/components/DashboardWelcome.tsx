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
      className="sbd-gl-preview relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--sbd-red),transparent_70%)] bg-[color-mix(in_oklab,var(--sbd-card)_15%,black)] px-4 py-4 shadow-xl shadow-black/50 sm:px-6 sm:py-5"
    >
      <div
        className="sbd-gl-preview-deco pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color-mix(in_oklab,var(--sbd-red),transparent_80%)] blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <h1
            id="dashboard-greeting"
            className="font-display text-2xl font-bold tracking-tight text-[var(--sbd-text)] sm:text-[1.7rem]"
          >
            Привіт, {login}
          </h1>
          <p className="text-sm leading-snug text-[var(--sbd-muted)]">{todayLabel}</p>
        </div>

        <div className="flex min-h-[44px] shrink-0 items-center justify-between gap-3 rounded-lg border border-[color-mix(in_oklab,var(--sbd-border),var(--sbd-red)_18%)] bg-[color-mix(in_oklab,var(--sbd-elevated)_90%,transparent)] px-3 py-2 text-sm backdrop-blur-sm sm:min-w-[10.5rem] sm:justify-center sm:gap-2">
          <span className="text-[var(--sbd-muted)]">Усього записів</span>
          <span className="font-semibold tabular-nums text-[var(--sbd-text)]">{workoutTotal}</span>
        </div>
      </div>
    </section>
  );
}
