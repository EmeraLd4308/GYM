"use client";

import type { ReactNode } from "react";
import { CalendarDaySync } from "@/components/CalendarDaySync";
import { MobileHideNextDevLogo } from "@/components/MobileHideNextDevLogo";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";

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
