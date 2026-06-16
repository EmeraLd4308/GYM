"use client";

import type { ReactNode } from "react";
import { CalendarDaySync } from "@/features/calendar/components/CalendarDaySync";
import { MobileHideNextDevLogo } from "@/shared/shell/MobileHideNextDevLogo";
import { ThemeProvider } from "@/shared/shell/ThemeProvider";
import { ToastProvider } from "@/shared/shell/ToastProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ThemeProvider>
        <CalendarDaySync />
        <MobileHideNextDevLogo />
        {children}
      </ThemeProvider>
    </ToastProvider>
  );
}
