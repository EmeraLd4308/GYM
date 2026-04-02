"use client";

import type { WeeklyVolumeRow } from "@/lib/weekly-volume";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const card = "sbd-card sbd-card-interactive rounded-xl p-5";

function ChartBlock({
  title,
  color,
  dataKey,
  data,
}: {
  title: string;
  color: string;
  dataKey: keyof Pick<WeeklyVolumeRow, "bench" | "squat" | "deadlift">;
  data: WeeklyVolumeRow[];
}) {
  const chartData = data.map((row) => ({
    weekLabel: row.weekLabel,
    value: row[dataKey],
  }));

  if (chartData.length === 0) {
    return (
      <div className={card}>
        <h3 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
        <p className="text-sm text-zinc-500">Немає даних для графіка.</p>
      </div>
    );
  }

  return (
    <div className={card}>
      <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
      <p className="mb-4 text-xs text-zinc-500">
        Об&apos;єм тижня (робочі підходи): сума вага × повтори, кг·повт.
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 10, fill: "#71717a" }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} width={44} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#111",
                fontSize: 12,
                color: "#e4e4e7",
              }}
              formatter={(value) => {
                const v = typeof value === "number" ? value.toFixed(1) : String(value ?? "");
                return [v, "Об'єм"];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#grad-${dataKey})`}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: color }}
              activeDot={{ r: 5, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** SBD: червоний бренд + контрастні лінії для трьох рухів */
export function WeeklyCharts({ series }: { series: WeeklyVolumeRow[] }) {
  return (
    <div className="space-y-6">
      <ChartBlock title="Жим" color="#f4f4f5" dataKey="bench" data={series} />
      <ChartBlock title="Присяд" color="#e31e24" dataKey="squat" data={series} />
      <ChartBlock title="Тяга" color="#a1a1aa" dataKey="deadlift" data={series} />
    </div>
  );
}
