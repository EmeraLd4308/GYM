"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBackInfo, getPageContext } from "@/shared/lib/route-meta";
import { IconChevronLeft } from "@/shared/ui/icons";

export function PageToolbar() {
  const pathname = usePathname();
  const back = getBackInfo(pathname);
  const context = getPageContext(pathname);

  if (!back && !context) return null;

  return (
    <div className={context ? "mb-5 space-y-2.5" : "mb-1.5"}>
      {back ? (
        <Link
          href={back.href}
          aria-label={`Назад: ${back.label}`}
          className="group inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-300 shadow-sm shadow-black/20 transition-all duration-200 hover:-translate-y-px hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:text-[var(--sbd-text)] hover:shadow-md active:scale-[0.98]"
        >
          <IconChevronLeft className="h-5 w-5 text-[#e31e24] transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>{back.label}</span>
        </Link>
      ) : null}

      {context ? (
        <h1 className="font-display text-lg font-semibold leading-snug tracking-tight text-[var(--sbd-text)] sm:text-xl">
          {context}
        </h1>
      ) : null}
    </div>
  );
}
