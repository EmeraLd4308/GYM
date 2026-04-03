"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import { MobileHideNextDevLogo } from "@/components/MobileHideNextDevLogo";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <MobileHideNextDevLogo />
      {children}
    </ToastProvider>
  );
}
