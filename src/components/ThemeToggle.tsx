"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { ThemePreference } from "@/lib/theme";

const segBase =
  "relative flex touch-manipulation items-center justify-center rounded-lg font-bold uppercase tracking-wider transition";

const segNormal = `${segBase} min-h-11 flex-1 px-2 text-[10px] sm:px-2.5 sm:text-[11px]`;

const segCompact = `${segBase} min-h-10 flex-1 px-1.5 text-[9px] sm:min-h-11 sm:px-2 sm:text-[10px]`;

const segNav = `${segBase} h-full min-h-0 min-w-0 flex-1 rounded-md px-0.5 text-[9px] max-md:py-0 md:h-auto md:min-h-9 md:flex-initial md:px-2 md:text-[10px]`;

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0111.5 3a6.7 6.7 0 0010.5 11.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 20h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const modes: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: "dark", label: "Темна", Icon: MoonIcon },
  { value: "light", label: "Світла", Icon: SunIcon },
  { value: "system", label: "Системна", Icon: SystemIcon },
];

export type ThemeToggleVariant = "default" | "nav";

export function ThemeToggle({
  className = "",
  compact = false,
  variant = "default",
}: {
  className?: string;
  compact?: boolean;
  variant?: ThemeToggleVariant;
}) {
  const { preference, setPreference } = useTheme();
  const nav = variant === "nav";
  const labelClass = nav || compact ? "sr-only" : "ml-1 hidden min-[420px]:inline";
  const seg = nav ? segNav : compact ? segCompact : segNormal;
  const iconClass =
    nav ? "h-[19px] w-[19px] shrink-0 opacity-90 md:h-4 md:w-4" : compact ? "h-[14px] w-[14px] shrink-0 opacity-90 sm:h-4 sm:w-4" : "shrink-0 opacity-90";

  return (
    <div
      className={`sbd-theme-toggle flex rounded-xl border border-[var(--sbd-toggle-border)] bg-[var(--sbd-toggle-bg)] p-0.5 ${
        nav
          ? "h-11 min-h-[44px] max-h-[44px] shrink-0 items-stretch self-center p-[3px] md:h-auto md:min-h-0 md:max-h-none md:max-w-[11.5rem] md:items-center md:p-0.5"
          : compact
            ? "max-w-[11.5rem]"
            : ""
      } ${className}`}
      role="group"
      aria-label="Тема оформлення"
    >
      {modes.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-pressed={active}
            aria-label={label}
            onClick={() => setPreference(value)}
            className={`${seg} ${
              active
                ? "text-[#e31e24] shadow-sm ring-1 ring-[#e31e24]/30 bg-[var(--sbd-toggle-active)]"
                : "text-[var(--sbd-toggle-fg)] hover:text-[var(--sbd-text)]"
            }`}
          >
            <Icon className={iconClass} />
            <span className={labelClass}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
