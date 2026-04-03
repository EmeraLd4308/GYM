"use client";

import type { ReactNode } from "react";
import { CalendarDaySync } from "@/components/CalendarDaySync";
import { ToastProvider } from "@/components/ToastProvider";
import { MobileHideNextDevLogo } from "@/components/MobileHideNextDevLogo";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CalendarDaySync />
      <MobileHideNextDevLogo />
      {children}
    </ToastProvider>
  );
}
