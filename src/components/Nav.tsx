"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PresetAvatar } from "@/components/PresetAvatar";
import { SbdLoadingPortal } from "@/components/SbdLoadingPortal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconLogout, IconTemplates } from "@/components/icons";

const base =
  "relative inline-flex min-h-[40px] items-center rounded-md px-2 py-2 text-sm font-medium uppercase tracking-wide text-zinc-400 transition-colors duration-200 hover:text-[var(--sbd-text)]";

const iconBtn =
  "sbd-header-icon-btn flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-xl border transition active:scale-[0.96] hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:text-[var(--sbd-text)]";

const logoutTextBtn =
  "inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-lg px-3 text-sm font-medium uppercase tracking-wide text-zinc-500 transition-colors hover:text-[var(--sbd-text)] md:px-4";

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
  const [loggingOut, setLoggingOut] = useState(false);

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
    <>
      <header className="sbd-app-header sticky top-0 z-40 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl backdrop-saturate-150 md:z-50">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:max-w-6xl md:gap-4 md:px-6 xl:px-8">
        <Link
          href="/dashboard"
          className="group flex min-h-[44px] min-w-0 shrink-0 touch-manipulation items-center gap-2 overflow-hidden sm:gap-2.5 md:max-w-[min(100%,14rem)] lg:max-w-[min(100%,16rem)]"
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
            <span className="font-display block truncate text-base font-bold tracking-tighter text-[var(--sbd-text)] transition-colors group-hover:text-[#e31e24] sm:text-lg">
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

        <nav className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 md:flex lg:gap-x-4 xl:gap-x-5">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${base} ${isActive(href) ? "nav-link-active text-[#e31e24]" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle variant="nav" />
          <Link
            href="/templates"
            className={`${iconBtn} md:hidden`}
            data-active={isActive("/templates") ? "true" : "false"}
            aria-current={isActive("/templates") ? "page" : undefined}
            aria-label="Шаблони тренувань"
            title="Шаблони"
          >
            <IconTemplates className="h-[22px] w-[22px]" />
          </Link>
          <form
            action="/api/auth/logout"
            method="post"
            className="inline md:hidden"
            onSubmit={() => setLoggingOut(true)}
          >
            <button
              type="submit"
              className={`${iconBtn} ${loggingOut ? "pointer-events-none border-[#e31e24]/45 bg-[#e31e24]/12 text-[#e31e24] opacity-80" : ""}`}
              aria-label="Вийти з облікового запису"
              title="Вийти"
              disabled={loggingOut}
            >
              <IconLogout className="h-[22px] w-[22px]" />
            </button>
          </form>
          <form
            action="/api/auth/logout"
            method="post"
            className="hidden md:inline"
            onSubmit={() => setLoggingOut(true)}
          >
            <button type="submit" className={logoutTextBtn} disabled={loggingOut}>
              {loggingOut ? "Вихід…" : "Вийти"}
            </button>
          </form>
        </div>
        </div>
      </header>
      <SbdLoadingPortal
        open={loggingOut}
        message="Вихід з профілю"
        subMessage="Завершуємо сесію…"
      />
    </>
  );
}
