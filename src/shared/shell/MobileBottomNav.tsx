"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconNavCalendar,
  IconNavChart,
  IconNavHome,
  IconNavProfile,
  IconNavWorkouts,
} from "@/shared/ui/icons";

const items = [
  { href: "/dashboard", label: "Головна", Icon: IconNavHome },
  { href: "/workouts", label: "Тренування", Icon: IconNavWorkouts },
  { href: "/calendar", label: "Календар", Icon: IconNavCalendar },
  { href: "/stats", label: "Статистика", Icon: IconNavChart },
  { href: "/profile", label: "Профіль", Icon: IconNavProfile },
] as const;

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
        const iconClass = active ? "text-[var(--sbd-red)]" : "text-[var(--sbd-muted)]";
        return (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1 touch-manipulation transition-[color,background-color,box-shadow] duration-200 ${
              active
                ? "bg-[color-mix(in_oklab,var(--sbd-red)_16%,transparent)] text-[var(--sbd-red)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--sbd-red)_22%,transparent)]"
                : "text-[var(--sbd-muted)] active:bg-white/[0.04]"
            }`}
          >
            <Icon className={`h-[22px] w-[22px] ${iconClass}`} />
            <span
              className={`max-w-full text-center text-xs leading-tight tracking-tight sm:text-[13px] ${
                active ? "font-semibold text-[var(--sbd-red)]" : "font-medium text-[var(--sbd-muted)]"
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
