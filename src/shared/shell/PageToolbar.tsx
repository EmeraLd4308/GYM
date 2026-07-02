"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getBackInfo, getPageContext } from "@/shared/lib/route-meta";
import { IconChevronLeft } from "@/shared/ui/icons";

function templateDetailId(pathname: string): string | null {
  if (!pathname.startsWith("/templates/") || pathname === "/templates/new") return null;
  const id = pathname.slice("/templates/".length).split("/")[0];
  return id || null;
}

export function PageToolbar() {
  const pathname = usePathname();
  const back = getBackInfo(pathname);
  const staticContext = getPageContext(pathname);
  const [context, setContext] = useState(staticContext);

  useEffect(() => {
    const templateId = templateDetailId(pathname);
    if (!templateId) {
      setContext(staticContext);
      return;
    }

    let cancelled = false;
    setContext("");

    void fetch(`/api/templates/${templateId}`, { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) return "";
        const data = (await res.json()) as { isOwner?: boolean };
        return data.isOwner ? "Редагування шаблону" : "";
      })
      .then((title) => {
        if (!cancelled) setContext(title);
      })
      .catch(() => {
        if (!cancelled) setContext("");
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, staticContext]);

  if (!back && !context) return null;

  return (
    <div className={context ? "mb-5 space-y-2.5" : back ? "mb-4" : "mb-1.5"}>
      {back ? (
        <Link
          href={back.href}
          aria-label={`Назад: ${back.label}`}
          className="sbd-back-link group inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md active:scale-[0.98]"
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
