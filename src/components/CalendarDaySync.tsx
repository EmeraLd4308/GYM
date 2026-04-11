"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { todayDateInput } from "@/lib/date-local";
import { GYM_CAL_DAY_COOKIE } from "@/lib/gym-cal-day-cookie-name";

function readCalDayCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${GYM_CAL_DAY_COOKIE}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) {
      const v = part.slice(prefix.length);
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    }
  }
  return undefined;
}

export function CalendarDaySync() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const browserToday = todayDateInput();
    const cookieToday = readCalDayCookie();
    const stale = cookieToday !== browserToday;
    document.cookie = `${GYM_CAL_DAY_COOKIE}=${browserToday};path=/;max-age=604800;SameSite=Lax`;

    const onDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    if (onDashboard && stale) router.refresh();
  }, [router, pathname]);

  return null;
}
