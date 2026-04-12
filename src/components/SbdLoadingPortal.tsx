"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { bodyScrollLockPop, bodyScrollLockPush } from "@/lib/body-scroll-lock";
import { SbdLoadingScreen } from "@/components/SbdLoadingScreen";

const overlayClass =
  "sbd-portal-overlay fixed inset-0 z-[10000] flex items-center justify-center p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-md";

export function SbdLoadingPortal({
  open,
  message,
  subMessage,
}: {
  open: boolean;
  message?: string;
  subMessage?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    bodyScrollLockPush();
    return () => {
      bodyScrollLockPop();
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className={overlayClass} aria-busy="true" aria-label={message ?? "Завантаження"}>
      <SbdLoadingScreen message={message} subMessage={subMessage} />
    </div>,
    document.body,
  );
}
