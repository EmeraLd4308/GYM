"use client";

import type { WeeklyAttendanceRow } from "@/lib/weekly-attendance";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const card = "sbd-card sbd-card-interactive rounded-xl p-5";

export function AttendanceChart({ series }: { series: WeeklyAttendanceRow[] }) {
  if (series.length === 0) {
    return (
      <div className={card}>
        <h3 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-white">
          Відвідуваність
        </h3>
        <p className="text-sm text-zinc-500">
          Ще немає тренувань — графік з&apos;явиться після першого запису.
        </p>
      </div>
    );
  }

  const data = series.map((r) => ({
    weekLabel: r.weekLabel,
    cumulative: r.cumulative,
    workoutCount: r.workoutCount,
    weekDelta: r.weekDelta,
  }));

  return (
    <div className={card}>
      <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-white">
        Відвідуваність (тижневий ритм)
      </h3>
      <p className="mb-4 text-xs leading-relaxed text-zinc-500">
        Ціль — не менше ніж <span className="text-zinc-400">3 тренування на тиждень</span>. Якщо за
        тиждень їх менше, крива опускається сильніше, чим більше «нестачі» до трьох. Якщо три або
        більше — крок вгору.
      </p>
      <div className="h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height={224} minWidth={0}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 9, fill: "#71717a" }}
              interval="preserveStartEnd"
              height={36}
            />
            <YAxis tick={{ fontSize: 10, fill: "#71717a" }} width={40} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as {
                  cumulative: number;
                  workoutCount: number;
                  weekDelta: number;
                  weekLabel: string;
                };
                return (
                  <div
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs shadow-xl"
                    style={{ background: "#111", color: "#e4e4e7" }}
                  >
                    <div className="font-medium text-zinc-300">{p.weekLabel}</div>
                    <div className="mt-1">
                      Накопичення: <span className="text-white">{p.cumulative}</span>
                    </div>
                    <div>
                      Тренувань: {p.workoutCount} · зміна за тиждень:{" "}
                      <span className={p.weekDelta >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {p.weekDelta >= 0 ? "+" : ""}
                        {p.weekDelta}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="cumulative"
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
