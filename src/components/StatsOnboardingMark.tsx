"use client";

import { useEffect } from "react";

export const ONBOARDING_STATS_STORAGE_KEY = "gym_onboarding_stats_done";
export const ONBOARDING_STATS_EVENT = "gym-onboarding-stats";

export function StatsOnboardingMark() {
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STATS_STORAGE_KEY, "1");
    } catch {}
    window.dispatchEvent(new Event(ONBOARDING_STATS_EVENT));
  }, []);
  return null;
}
