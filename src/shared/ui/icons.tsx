import type { ReactNode } from "react";

type IconProps = { className?: string };

function IconBase({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconChevronLeft({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M14.5 6.5L9 12l5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function IconTemplates({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect
        x="4"
        y="5"
        width="7"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="13"
        y="5"
        width="7"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="4"
        y="13"
        width="16"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </IconBase>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 17H6a2 2 0 01-2-2V9a2 2 0 012-2h4M14 15l4-3-4-3M18 12H8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconNavHome({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M4.5 11.5L12 5l7.5 6.5V19a1.5 1.5 0 01-1.5 1.5H15v-5.5h-6V20.5H6A1.5 1.5 0 014.5 19v-7.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function IconNavWorkouts({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="4" y="7.5" width="4" height="9" rx="1.25" stroke="currentColor" strokeWidth="1.75" />
      <rect x="16" y="7.5" width="4" height="9" rx="1.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 12h8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M7.25 10v4M16.75 10v4"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function IconNavCalendar({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.5 3.5v2M15.5 3.5v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

export function IconNavChart({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M5 19V9.5M10 19V5M15 19v-7M20 19v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </IconBase>
  );
}

export function IconNavProfile({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="8.5" r="2.15" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.75 13.75h12.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M8.25 17.25h7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </IconBase>
  );
}

export function IconArrowUp({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M12 16.5V7.5M8 11.5l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function IconArrowDown({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M12 7.5v9M8 12.5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </IconBase>
  );
}
