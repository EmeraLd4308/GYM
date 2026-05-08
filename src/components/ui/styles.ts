export const uiLabelClass =
  "text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]";

export const uiInputClass =
  "w-full rounded-[var(--sbd-radius-md)] border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-3 py-2 text-[var(--sbd-text)] outline-none transition focus:border-[var(--sbd-red)]/40 focus:ring-1 focus:ring-[var(--sbd-red)]/15";

export const uiInputLgClass = `${uiInputClass} min-h-[52px] rounded-[var(--sbd-radius-lg)] px-4 py-3 text-base`;

export const uiButtonPrimaryClass =
  "min-h-[44px] touch-manipulation rounded-[var(--sbd-radius-md)] bg-[var(--sbd-red)] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm shadow-red-950/25 transition hover:brightness-110 active:opacity-[0.92] disabled:opacity-50";

export const uiButtonSecondaryClass =
  "min-h-[44px] touch-manipulation rounded-[var(--sbd-radius-md)] border border-white/15 bg-transparent px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 disabled:opacity-50";

export const uiButtonDangerClass =
  "min-h-[44px] touch-manipulation rounded-[var(--sbd-radius-md)] border border-[var(--sbd-red)]/45 bg-transparent px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--sbd-red)] transition hover:bg-[var(--sbd-red)]/10 disabled:opacity-50";

export const uiFieldErrorClass = "mt-1 text-sm text-[color-mix(in_oklab,var(--sbd-red),white_22%)]";
