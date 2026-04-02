"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBackInfo, getPageContext } from "@/lib/route-meta";
import { IconChevronLeft, IconSpark } from "@/components/icons";

export function PageToolbar() {
  const pathname = usePathname();
  const back = getBackInfo(pathname);
  const context = getPageContext(pathname);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {back ? (
          <Link
            href={back.href}
            className="group inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-300 shadow-sm shadow-black/20 transition-all duration-200 hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:text-white active:scale-[0.98]"
          >
            <IconChevronLeft className="h-5 w-5 text-[#e31e24] transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>{back.label}</span>
          </Link>
        ) : (
          <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dashed border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e31e24] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e31e24]" />
            </span>
            Обери розділ у меню зверху
          </div>
        )}
      </div>
      {context ? (
        <h1 className="font-display text-lg font-semibold tracking-tight text-white/95 sm:text-xl">
          <IconSpark className="mr-2 inline-block h-4 w-4 -translate-y-0.5 text-[#e31e24]" aria-hidden />
          {context}
        </h1>
      ) : null}
    </div>
  );
}
