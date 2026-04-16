"use client";

import Link from "next/link";
import type { WeeklySbdRpeRow } from "@/lib/weekly-rpe";
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

export type WeeklyRpeLiftHint = {
  noTraining: boolean;
  noProfileMax: boolean;
};

export type WeeklyRpeChartHints = Record<"bench" | "squat" | "deadlift", WeeklyRpeLiftHint>;

function emptyRpeMessage(hint: WeeklyRpeLiftHint): string {
  if (hint.noTraining) {
    return "За обрані дати немає тренувань з цим базовим рухом. Додай запис або зміни фільтр дат зверху на сторінці статистики.";
  }
  if (hint.noProfileMax) {
    return "Щоб оцінити RPE з ваги, у профілі має бути максимум для цього руху. Інакше вводь RPE вручну в підходах.";
  }
  return "Немає робочих підходів з вагою та повторами для цієї кривої — перевір журнал.";
}

function ChartBlock({
  title,
  color,
  dataKey,
  data,
  hint,
}: {
  title: string;
  color: string;
  dataKey: keyof Pick<WeeklySbdRpeRow, "bench" | "squat" | "deadlift">;
  data: WeeklySbdRpeRow[];
  hint: WeeklyRpeLiftHint;
}) {
  const chartData = data.map((row) => ({
    weekLabel: row.weekLabel,
    value: row[dataKey],
  }));

  const hasAny = chartData.some((d) => d.value != null);

  if (!hasAny) {
    return (
      <div className={card}>
        <h3 className="font-display mb-2 text-sm font-bold uppercase tracking-wide text-[var(--sbd-text)]">
          {title}
        </h3>
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
    );
  }

  return (
    <div className={card}>
      <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-[var(--sbd-text)]">
        {title}
      </h3>
      <p className="mb-4 text-xs leading-relaxed text-zinc-500">
        Середнє RPE за тиждень: значення з журналу або оцінка з ваги та максимуму цього руху з
        профілю (якщо RPE в журналі порожнє).
      </p>
      <div className="h-56 w-full min-w-0">
        <ResponsiveContainer width="100%" height={224} minWidth={0}>
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
            <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: "#71717a" }} width={36} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "#111",
                fontSize: 12,
                color: "#e4e4e7",
              }}
              formatter={(value) => {
                if (value == null) return ["—", "RPE"];
                const v = typeof value === "number" ? value.toFixed(2) : String(value ?? "");
                return [v, "RPE"];
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#grad-${dataKey})`}
              strokeWidth={2}
              connectNulls
              dot={{ r: 3, strokeWidth: 1, fill: color }}
              activeDot={{ r: 5, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
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
  return (
    <div className="space-y-6">
      <ChartBlock title="Жим" color="#a1a1aa" dataKey="bench" data={series} hint={h.bench} />
      <ChartBlock title="Присяд" color="#e31e24" dataKey="squat" data={series} hint={h.squat} />
      <ChartBlock title="Тяга" color="#a1a1aa" dataKey="deadlift" data={series} hint={h.deadlift} />
    </div>
  );
}
