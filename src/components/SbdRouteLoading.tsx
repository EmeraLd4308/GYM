"use client";

import { SbdLoadingPortal } from "@/components/SbdLoadingPortal";

export function SbdRouteLoading() {
  return (
    <SbdLoadingPortal
      open
      message="Завантаження"
      subMessage="Готуємо сторінку…"
    />
  );
}
