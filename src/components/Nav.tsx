"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearSessionCookieClient } from "@/lib/session-client";

const base =
  "relative text-sm font-medium uppercase tracking-wide text-zinc-400 transition-colors duration-200 hover:text-white";

export function Nav({ login }: { login: string }) {
  const pathname = usePathname();

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      clearSessionCookieClient();
      window.location.assign("/");
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/templates") return pathname.startsWith("/templates");
    if (href === "/workouts/new")
      return pathname === "/workouts/new" || /^\/workouts\/[^/]+$/.test(pathname);
    if (href === "/stats") return pathname === "/stats";
    return pathname === href;
  }

  const links = [
    { href: "/dashboard", label: "Головна" },
    { href: "/templates", label: "Шаблони" },
    { href: "/workouts/new", label: "Тренування" },
    { href: "/stats", label: "Статистика" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050505]/90 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 transition-transform duration-200 active:scale-95"
        >
          <span className="font-display text-lg font-bold tracking-tighter text-white transition-colors group-hover:text-[#e31e24]">
            SBD<span className="text-[#e31e24]">.</span>
          </span>
          <span className="hidden text-sm text-zinc-500 sm:inline">
            <span className="text-zinc-700">·</span> {login}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${base} ${isActive(href) ? "nav-link-active text-[#e31e24]" : ""}`}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            className="text-sm font-medium uppercase tracking-wide text-zinc-600 transition-colors hover:text-zinc-300"
            onClick={logout}
          >
            Вийти
          </button>
        </nav>
      </div>
    </header>
  );
}
