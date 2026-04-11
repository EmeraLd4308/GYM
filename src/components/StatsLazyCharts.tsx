"use client";

import dynamic from "next/dynamic";
import type { WeeklyAttendanceRow } from "@/lib/weekly-attendance";
import type { WeeklySbdRpeRow } from "@/lib/weekly-rpe";
import type { ProfileMaxHistoryPoint } from "@/lib/profile-max-history";
import type { WeeklyRpeChartHints } from "@/components/WeeklyCharts";

const chartsBlockLoading = (
  <div className="h-[26rem] animate-pulse rounded-2xl bg-zinc-900/45 ring-1 ring-white/[0.06] sm:h-[28rem]" />
);

const AttendanceChart = dynamic(
  () => import("@/components/AttendanceChart").then((m) => ({ default: m.AttendanceChart })),
  {
    loading: () => (
      <div className="mb-6 h-64 animate-pulse rounded-2xl bg-zinc-900/50 ring-1 ring-white/[0.05]" />
    ),
    ssr: false,
  },
);

const WeeklyCharts = dynamic(
  () => import("@/components/WeeklyCharts").then((m) => ({ default: m.WeeklyCharts })),
  { loading: () => chartsBlockLoading, ssr: false },
);

const SbdTotalChart = dynamic(
  () => import("@/components/SbdTotalChart").then((m) => ({ default: m.SbdTotalChart })),
  {
    loading: () => (
      <div className="mb-6 h-64 animate-pulse rounded-2xl bg-zinc-900/50 ring-1 ring-white/[0.05]" />
    ),
    ssr: false,
  },
);

export function StatsLazyCharts({
  attendanceSeries,
  profileMaxHistory,
  rpeSeries,
  rpeHints,
}: {
  attendanceSeries: WeeklyAttendanceRow[];
  profileMaxHistory: ProfileMaxHistoryPoint[];
  rpeSeries: WeeklySbdRpeRow[];
  rpeHints?: WeeklyRpeChartHints;
}) {
  return (
    <>
      <div className="mb-8 grid gap-6 xl:grid-cols-2 xl:gap-8">
        <AttendanceChart series={attendanceSeries} />
        <SbdTotalChart data={profileMaxHistory} />
      </div>
      <WeeklyCharts series={rpeSeries} rpeHints={rpeHints} />
    </>
  );
}
