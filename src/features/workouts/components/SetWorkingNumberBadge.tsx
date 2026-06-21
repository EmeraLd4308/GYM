export function SetWorkingNumberBadge({
  number,
  isWarmup,
  size = "md",
}: {
  number: number | null;
  isWarmup: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  if (isWarmup) {
    return (
      <span
        className={`${dim} flex shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_88%,transparent)] font-display font-bold uppercase tracking-wide text-[var(--sbd-muted)]`}
        aria-hidden
      >
        Р
      </span>
    );
  }

  return (
    <span
      className={`${dim} flex shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_oklab,var(--sbd-red),transparent_55%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_88%)] font-display font-bold tabular-nums text-[color-mix(in_oklab,var(--sbd-red),white_25%)]`}
      aria-hidden
    >
      {number ?? "—"}
    </span>
  );
}
