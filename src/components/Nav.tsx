"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const base =
  "relative text-sm font-medium uppercase tracking-wide text-zinc-400 transition-colors duration-200 hover:text-white";

export function Nav({ login }: { login: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/templates") return pathname.startsWith("/templates");
    if (href === "/workouts")
      return (
        pathname === "/workouts" || pathname === "/workouts/new" || /^\/workouts\/[^/]+$/.test(pathname)
      );
    if (href === "/stats") return pathname === "/stats";
    if (href === "/calendar") return pathname === "/calendar";
    return pathname === href;
  }

  const links = [
    { href: "/dashboard", label: "Головна" },
    { href: "/calendar", label: "Календар" },
    { href: "/templates", label: "Шаблони" },
    { href: "/workouts", label: "Тренування" },
    { href: "/stats", label: "Статистика" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/90 pt-[env(safe-area-inset-top,0px)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] backdrop-blur-xl md:z-50">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="group flex min-h-[44px] min-w-0 shrink items-center gap-2 touch-manipulation transition-transform duration-200 active:scale-95"
        >
          <span className="font-display text-lg font-bold tracking-tighter text-white transition-colors group-hover:text-[#e31e24]">
            SBD<span className="text-[#e31e24]">.</span>
          </span>
          <span className="hidden truncate text-sm text-zinc-500 sm:inline">
            <span className="text-zinc-700">·</span> {login}
          </span>
        </Link>

        {/* Мобільний ряд: шаблони + вихід (решта — у нижній панелі) */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/templates"
            className={`flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg px-2 text-center text-xs font-bold uppercase tracking-wide ${
              isActive("/templates") ? "text-[#e31e24]" : "text-zinc-400"
            }`}
          >
            Шаблони
          </Link>
          <form action="/api/auth/logout" method="post" className="inline">
            <button
              type="submit"
              className="min-h-[44px] min-w-[44px] touch-manipulation rounded-lg px-2 text-xs font-bold uppercase tracking-wide text-zinc-500"
            >
              Вийти
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
