"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Головна", Icon: IconHome },
  { href: "/workouts", label: "Тренування", Icon: IconList },
  { href: "/calendar", label: "Календар", Icon: IconCalendar },
  { href: "/stats", label: "Статистика", Icon: IconChart },
  { href: "/profile", label: "Профіль", Icon: IconProfile },
] as const;

function IconHome({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-[#e31e24]" : "text-zinc-500"}
      aria-hidden
    >
      <path
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-[#e31e24]" : "text-zinc-500"}
      aria-hidden
    >
      <path
        d="M8 6h13M8 12h13M8 18h13M4 6h.02M4 12h.02M4 18h.02"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-[#e31e24]" : "text-zinc-500"}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-[#e31e24]" : "text-zinc-500"}
      aria-hidden
    >
      <path
        d="M4 19V5M4 19h16M8 15v-3M12 19V9M16 13v-2M20 17v-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className={active ? "text-[#e31e24]" : "text-zinc-500"}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6.5 19.5c.8-3 3.4-5 5.5-5s4.7 2 5.5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/workouts")
    return (
      pathname === "/workouts" ||
      pathname === "/workouts/new" ||
      /^\/workouts\/[^/]+$/.test(pathname)
    );
  if (href === "/calendar") return pathname === "/calendar";
  if (href === "/stats") return pathname === "/stats";
  if (href === "/profile") return pathname === "/profile";
  return false;
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sbd-app-dock fixed bottom-0 left-0 right-0 z-50 flex border-t border-[color:var(--sbd-nav-border)] px-0.5 pb-[env(safe-area-inset-bottom,0px)] pt-1 backdrop-blur-lg md:hidden"
      aria-label="Основна навігація"
    >
      {items.map(({ href, label, Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 touch-manipulation transition-[color,background-color,box-shadow] duration-200 ${
              active
                ? "bg-[color-mix(in_oklab,var(--sbd-red)_16%,transparent)] text-[#e31e24] shadow-[inset_0_0_0_1px_rgba(227,30,36,0.22)]"
                : "text-zinc-500 active:bg-white/[0.04]"
            }`}
          >
            <Icon active={active} />
            <span
              className={`max-w-full text-center text-[10px] leading-tight tracking-tight sm:text-[11px] ${
                active ? "font-semibold text-[#e31e24]" : "font-medium text-zinc-500"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
