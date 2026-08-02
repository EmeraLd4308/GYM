"use client";

import Link from "next/link";
import type { ProfileMaxHistoryPoint } from "@/features/stats/lib/profile-max-history";
import { ChartAxisTick, thinAxisTicks } from "@/features/stats/lib/chart-month-axis";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const card = "sbd-card sbd-card-interactive rounded-xl p-5";

export function SbdTotalChart({ data }: { data: ProfileMaxHistoryPoint[] }) {
  const chartData = data.map((r) => ({
    recordedAtIso: r.recordedAtIso,
    pointLabel: r.pointLabel,
    totalKg: r.totalKg,
  }));

  const hasAny = chartData.some((d) => d.totalKg > 0);
  const ticks = thinAxisTicks(
    chartData.map((d) => d.recordedAtIso),
    3,
  );

  if (!hasAny) {
    return (
      <div className={card}>
        <h3 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-white">
          Сума максимумів SBD (кг)
        </h3>
        <p className="text-sm text-zinc-500">Заповни максимуми SBD у профілі.</p>
        <Link
          href="/profile"
          className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline"
        >
          Відкрити профіль
        </Link>
      </div>
    );
  }

  return (
    <div className={card}>
      <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-white">
        Сума максимумів SBD (кг)
      </h3>
      <div className="h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height={224} minWidth={0}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="recordedAtIso"
              ticks={ticks}
              tick={<ChartAxisTick format="date" />}
              interval={0}
              minTickGap={36}
              padding={{ left: 4, right: 4 }}
              height={28}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#71717a" }}
              width={44}
              tickFormatter={(v) => (typeof v === "number" ? `${v}` : String(v))}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#111",
                fontSize: 12,
                color: "#e4e4e7",
              }}
              labelFormatter={(_label, payload) => {
                const full = payload?.[0]?.payload?.pointLabel;
                return typeof full === "string" ? full : "";
              }}
              formatter={(value) => {
                const v = typeof value === "number" ? value.toFixed(1) : String(value ?? "");
                return [`${v} кг`, "Сума max"];
              }}
            />
            <Line
              type="monotone"
              dataKey="totalKg"
              name="Сума max"
              stroke="#e31e24"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: "#e31e24" }}
              activeDot={{ r: 5, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
