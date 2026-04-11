"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PresetAvatar } from "@/components/PresetAvatar";
import { IconLogout, IconTemplates } from "@/components/icons";

const base =
  "relative text-sm font-medium uppercase tracking-wide text-zinc-400 transition-colors duration-200 hover:text-white";

const iconBtn =
  "flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition active:scale-[0.96] hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:text-white";

export function Nav({
  login,
  avatarId,
  nickname,
}: {
  login: string;
  avatarId?: string | null;
  nickname?: string | null;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/templates") return pathname.startsWith("/templates");
    if (href === "/workouts")
      return (
        pathname === "/workouts" ||
        pathname === "/workouts/new" ||
        /^\/workouts\/[^/]+$/.test(pathname)
      );
    if (href === "/stats") return pathname === "/stats";
    if (href === "/calendar") return pathname === "/calendar";
    if (href === "/profile") return pathname === "/profile";
    return pathname === href;
  }

  const links = [
    { href: "/dashboard", label: "Головна" },
    { href: "/calendar", label: "Календар" },
    { href: "/templates", label: "Шаблони" },
    { href: "/workouts", label: "Тренування" },
    { href: "/stats", label: "Статистика" },
    { href: "/profile", label: "Профіль" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/90 pt-[env(safe-area-inset-top,0px)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.85)] backdrop-blur-xl backdrop-saturate-150 md:z-50">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:max-w-6xl md:justify-between md:px-6 xl:px-8">
        <Link
          href="/dashboard"
          className="group flex min-h-[44px] min-w-0 flex-1 touch-manipulation items-center gap-2 overflow-hidden sm:gap-2.5 md:flex-initial md:max-w-none"
        >
          <span className="relative shrink-0 transition-[filter] duration-300 group-hover:drop-shadow-[0_0_10px_rgba(227,30,36,0.35)]">
            <PresetAvatar
              decorative
              avatarId={avatarId}
              size={36}
              className="ring-1 ring-white/[0.08]"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-display block truncate text-base font-bold tracking-tighter text-white transition-colors group-hover:text-[#e31e24] sm:text-lg">
              SBD<span className="text-[#e31e24]">.</span>
            </span>
            <span
              className="mt-0.5 block truncate text-[11px] font-medium text-zinc-500 sm:text-xs md:text-sm"
              title={login}
            >
              {login}
            </span>
            {nickname?.trim() ? (
              <span className="mt-1 hidden min-w-0 items-center gap-1.5 md:flex">
                <span className="shrink-0 rounded border border-[#e31e24]/25 bg-[#e31e24]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-[#e31e24]/90">
                  позивний
                </span>
                <span className="truncate text-xs text-zinc-400">{nickname.trim()}</span>
              </span>
            ) : null}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:hidden">
          <Link
            href="/templates"
            className={`${iconBtn} ${isActive("/templates") ? "border-[#e31e24]/40 bg-[#e31e24]/15 text-[#e31e24]" : ""}`}
            aria-label="Шаблони тренувань"
            title="Шаблони"
          >
            <IconTemplates className="h-[22px] w-[22px]" />
          </Link>
          <form action="/api/auth/logout" method="post" className="inline">
            <button
              type="submit"
              className={iconBtn}
              aria-label="Вийти з облікового запису"
              title="Вийти"
            >
              <IconLogout className="h-[22px] w-[22px]" />
            </button>
          </form>
        </div>

        <nav className="hidden flex-wrap items-center gap-x-5 gap-y-2 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${base} ${isActive(href) ? "nav-link-active text-[#e31e24]" : ""}`}
            >
              {label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post" className="inline">
            <button
              type="submit"
              className="text-sm font-medium uppercase tracking-wide text-zinc-600 transition-colors hover:text-zinc-300"
            >
              Вийти
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
