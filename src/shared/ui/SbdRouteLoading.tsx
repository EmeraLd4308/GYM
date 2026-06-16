"use client";

import { SbdLoadingPortal } from "@/shared/ui/SbdLoadingPortal";

export function SbdRouteLoading() {
  return (
    <SbdLoadingPortal
      open
      message="Завантаження"
      subMessage="Готуємо сторінку…"
    />
  );
}
