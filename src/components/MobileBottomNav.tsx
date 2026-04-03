"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Головна", Icon: IconHome },
  { href: "/workouts", label: "Тренування", Icon: IconList },
  { href: "/calendar", label: "Календар", Icon: IconCalendar },
  { href: "/stats", label: "Стат.", Icon: IconChart },
] as const;

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={active ? "text-[#e31e24]" : "text-zinc-500"} aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={active ? "text-[#e31e24]" : "text-zinc-500"} aria-hidden>
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={active ? "text-[#e31e24]" : "text-zinc-500"} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={active ? "text-[#e31e24]" : "text-zinc-500"} aria-hidden>
      <path d="M4 19V5M4 19h16M8 15v-3M12 19V9M16 13v-2M20 17v-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/workouts")
    return pathname === "/workouts" || pathname === "/workouts/new" || /^\/workouts\/[^/]+$/.test(pathname);
  if (href === "/calendar") return pathname === "/calendar";
  if (href === "/stats") return pathname === "/stats";
  return false;
}

/** Фіксована панель: основні розділи одним рядком, без горизонтального хаосу в шапці. */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/[0.08] bg-[#050505]/95 pb-[env(safe-area-inset-bottom,0px)] pt-1 backdrop-blur-lg md:hidden"
      aria-label="Основна навігація"
    >
      {items.map(({ href, label, Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            title={href === "/stats" ? "Статистика" : label}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 touch-manipulation ${
              active ? "text-[#e31e24]" : "text-zinc-500"
            }`}
          >
            <Icon active={active} />
            <span className={`max-w-full truncate text-[10px] font-semibold leading-tight ${active ? "text-[#e31e24]" : "text-zinc-500"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
