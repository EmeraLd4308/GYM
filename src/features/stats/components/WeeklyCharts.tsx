"use client";

import Link from "next/link";
import type { WeeklySbdRpeRow } from "@/features/stats/lib/weekly-rpe";
import {
  monthAxisLabel,
  monthKeyFromWeekStart,
  spacedMonthTicks,
} from "@/features/stats/lib/chart-month-axis";
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

const LIFT_ORDER = ["squat", "bench", "deadlift"] as const;
type LiftKey = (typeof LIFT_ORDER)[number];

const LIFT_COLORS: Record<LiftKey, string> = {
  bench: "#34d399",
  squat: "#e31e24",
  deadlift: "#fbbf24",
};

const LIFT_TITLES: Record<LiftKey, string> = {
  squat: "Присяд",
  bench: "Жим",
  deadlift: "Тяга",
};

export type WeeklyRpeLiftHint = {
  noTraining: boolean;
  noProfileMax: boolean;
};

export type WeeklyRpeChartHints = Record<LiftKey, WeeklyRpeLiftHint>;

function emptyRpeMessage(hint: WeeklyRpeLiftHint): string {
  if (hint.noTraining) {
    return "Немає тренувань за обраний період.";
  }
  if (hint.noProfileMax) {
    return "Додай максимум у профілі або вкажи RPE вручну.";
  }
  return "Немає робочих підходів для цього руху.";
}

function LiftRpePanel({
  lift,
  data,
  hint,
}: {
  lift: LiftKey;
  data: WeeklySbdRpeRow[];
  hint: WeeklyRpeLiftHint;
}) {
  const color = LIFT_COLORS[lift];
  const title = LIFT_TITLES[lift];

  const chartData = data
    .filter((row) => row[lift] != null)
    .map((row) => ({
      weekStartIso: row.weekStartIso,
      weekLabel: row.weekLabel,
      monthKey: monthKeyFromWeekStart(row.weekStartIso),
      value: row[lift],
    }));

  const monthTicks = spacedMonthTicks(chartData);
  const hasAny = chartData.length > 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h4 className="font-display text-sm font-bold uppercase tracking-wide" style={{ color }}>
          {title}
        </h4>
        {hasAny ? (
          <span className="text-xs tabular-nums text-zinc-500">
            {chartData.length}{" "}
            {chartData.length === 1 ? "тиждень" : chartData.length < 5 ? "тижні" : "тижнів"}
          </span>
        ) : null}
      </div>

      {!hasAny ? (
        <div>
          <p className="text-sm leading-relaxed text-zinc-500">{emptyRpeMessage(hint)}</p>
          {hint.noTraining ? (
            <Link
              href="/workouts/new"
              className="mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline"
            >
              Додати тренування
            </Link>
          ) : null}
          {hint.noProfileMax ? (
            <Link
              href="/profile"
              className="mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline"
            >
              Відкрити профіль
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="h-48 w-full min-w-0">
          <ResponsiveContainer width="100%" height={192} minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={`rpe-grad-${lift}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="weekStartIso"
                ticks={monthTicks}
                tickFormatter={(iso) =>
                  typeof iso === "string" ? monthAxisLabel(iso) : String(iso ?? "")
                }
                tick={{ fontSize: 10, fill: "#71717a" }}
                interval={0}
                minTickGap={64}
                padding={{ left: 12, right: 12 }}
              />
              <YAxis
                domain={[5, 10]}
                ticks={[5, 6, 7, 8, 9, 10]}
                tick={{ fontSize: 10, fill: "#71717a" }}
                width={36}
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
                  const week = payload?.[0]?.payload?.weekLabel;
                  return typeof week === "string" ? week : "";
                }}
                formatter={(value) => {
                  if (value == null) return ["—", "RPE тижня"];
                  const v = typeof value === "number" ? value.toFixed(3) : String(value ?? "");
                  return [v, "RPE тижня"];
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={`url(#rpe-grad-${lift})`}
                strokeWidth={2}
                connectNulls={false}
                dot={{ r: 3, strokeWidth: 1, fill: color }}
                activeDot={{ r: 5, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const defaultHints: WeeklyRpeChartHints = {
  bench: { noTraining: false, noProfileMax: false },
  squat: { noTraining: false, noProfileMax: false },
  deadlift: { noTraining: false, noProfileMax: false },
};

export function WeeklyCharts({
  series,
  rpeHints = defaultHints,
}: {
  series: WeeklySbdRpeRow[];
  rpeHints?: WeeklyRpeChartHints;
}) {
  const h = rpeHints;
  const activeLifts = LIFT_ORDER.filter((lift) => series.some((row) => row[lift] != null));

  if (activeLifts.length === 0) {
    const hint = h.squat.noTraining || h.bench.noTraining || h.deadlift.noTraining
      ? { noTraining: true, noProfileMax: false }
      : h.squat.noProfileMax && h.bench.noProfileMax && h.deadlift.noProfileMax
        ? { noTraining: false, noProfileMax: true }
        : { noTraining: false, noProfileMax: false };

    return (
      <div className={card}>
        <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-white">
          Тижневе RPE
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Окремо по кожному руху: пік сесії та бонус за додаткові тренування за тиждень.
        </p>
        <p className="mt-3 text-sm text-zinc-500">{emptyRpeMessage(hint)}</p>
        {hint.noTraining ? (
          <Link
            href="/workouts/new"
            className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline"
          >
            Додати тренування
          </Link>
        ) : null}
        {hint.noProfileMax ? (
          <Link
            href="/profile"
            className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline"
          >
            Відкрити профіль
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className={card}>
      <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-white">
        Тижневе RPE
      </h3>
      <p className="text-xs leading-relaxed text-zinc-500">
        Окремо по кожному руху: топ-RPE найважчої сесії тижня; додаткові сесії трохи піднімають
        показник. Пропущені тижні — спад до 5.
      </p>

      <div className="mt-4 grid gap-5">
        {activeLifts.map((lift) => (
          <LiftRpePanel key={lift} lift={lift} data={series} hint={h[lift]} />
        ))}
      </div>
    </div>
  );
}
