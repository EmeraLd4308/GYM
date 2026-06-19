import { uiInputClass, uiInputNumClass } from "@/shared/ui/styles";

export const profileFieldClass = `${uiInputClass} mt-1.5 w-full max-w-md`;

export const profileNumFieldClass = `${uiInputNumClass} mt-1.5`;

export const profileSegBtnClass =
  "sbd-profile-seg__btn min-h-[44px] flex-1 touch-manipulation rounded-lg px-3 text-xs font-semibold uppercase tracking-wide transition sm:text-sm";

export const profileLbTabClass =
  "sbd-lb-tab inline-flex min-h-[40px] touch-manipulation items-center justify-center rounded-lg border px-3 text-center text-xs font-semibold uppercase leading-none tracking-wide transition sm:text-sm";

export function profileAvatarPickBtnClass(active: boolean): string {
  return `relative flex touch-manipulation flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
    active
      ? "border-[color-mix(in_oklab,var(--sbd-red),transparent_45%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_88%)] shadow-[0_0_24px_-8px_color-mix(in_oklab,var(--sbd-red),transparent_65%)] ring-1 ring-[color-mix(in_oklab,var(--sbd-red),transparent_75%)]"
      : "border-[var(--sbd-border)] bg-[var(--sbd-card)] hover:border-[color-mix(in_oklab,var(--sbd-red),transparent_70%)] hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_94%)]"
  }`;
}

export function profilePinBtnClass(unlocked: boolean, pinned: boolean): string {
  if (!unlocked) {
    return "cursor-not-allowed border-[var(--sbd-border)] bg-[var(--sbd-elevated)] opacity-45";
  }
  if (pinned) {
    return "border-[color-mix(in_oklab,var(--sbd-red),transparent_45%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_88%)] ring-1 ring-[color-mix(in_oklab,var(--sbd-red),transparent_75%)]";
  }
  return "border-[var(--sbd-border)] bg-[var(--sbd-card)] hover:border-[color-mix(in_oklab,var(--sbd-red),transparent_65%)]";
}
