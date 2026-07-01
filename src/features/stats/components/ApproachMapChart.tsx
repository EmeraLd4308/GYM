"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  approachMapLiftLabelUk,
  type ApproachMapHints,
  type ApproachMapLift,
  type ApproachMapPoint,
} from "@/features/stats/lib/approach-map";
import type { ProfileSbdMaxKg } from "@/features/stats/lib/weekly-rpe";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

const card = "sbd-card sbd-card-interactive rounded-xl p-5";

const LIFT_COLORS: Record<ApproachMapLift, string> = {
  squat: "#e31e24",
  bench: "#60a5fa",
  deadlift: "#a3e635",
};

const LIFT_ORDER: ApproachMapLift[] = ["squat", "bench", "deadlift"];

type PlotPoint = ApproachMapPoint & { repsPlot: number };

function emptyMessage(hints: ApproachMapHints): string {
  if (hints.noTraining) return "Немає робочих підходів SBD за обраний період.";
  return "Немає даних для карти підходів.";
}

function jitterReps(reps: number, id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 997;
  }
  const spread = ((hash % 100) / 100 - 0.5) * 0.45;
  return reps + spread;
}

function toPlotPoints(points: ApproachMapPoint[]): PlotPoint[] {
  return points.map((p) => ({ ...p, repsPlot: jitterReps(p.reps, p.id) }));
}

function formatKg(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function chartDomains(points: PlotPoint[]): {
  repsDomain: [number, number];
  weightDomain: [number, number];
} {
  if (points.length === 0) {
    return { repsDomain: [1, 5], weightDomain: [0, 100] };
  }
  const maxReps = Math.max(1, ...points.map((p) => p.reps));
  const weights = points.map((p) => p.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const span = Math.max(maxW - minW, 10);
  const pad = Math.max(2.5, span * 0.1);
  const yMin = Math.max(0, Math.floor((minW - pad) / 5) * 5);
  const yMax = Math.ceil((maxW + pad) / 5) * 5;
  return {
    repsDomain: [1, Math.max(maxReps, 3)],
    weightDomain: [yMin, Math.max(yMin + 5, yMax)],
  };
}

function zoneBandsKg(
  yMin: number,
  yMax: number,
  profileMaxKg: number,
): Array<{ y1: number; y2: number; fill: string; fillOpacity: number }> {
  const p70 = profileMaxKg * 0.7;
  const p80 = profileMaxKg * 0.8;
  const p90 = profileMaxKg * 0.9;
  const bands = [
    { y1: yMin, y2: p70, fill: "#3f3f46", fillOpacity: 0.12 },
    { y1: p70, y2: p80, fill: "#60a5fa", fillOpacity: 0.07 },
    { y1: p80, y2: p90, fill: "#fbbf24", fillOpacity: 0.07 },
    { y1: p90, y2: yMax, fill: "#e31e24", fillOpacity: 0.08 },
  ];
  return bands
    .map((b) => ({ ...b, y1: Math.max(yMin, b.y1), y2: Math.min(yMax, b.y2) }))
    .filter((b) => b.y2 > b.y1);
}

function ApproachMapTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PlotPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-lg border border-white/10 px-3 py-2 text-xs shadow-xl"
      style={{ background: "#111", color: "#e4e4e7" }}
    >
      <div className="font-medium text-zinc-300">{approachMapLiftLabelUk(p.lift)}</div>
      <div className="mt-1">
        {formatKg(p.weightKg)} кг × {p.reps}
        {p.percentMax != null ? ` · ${p.percentMax}% від максу` : ""}
      </div>
      <div className="text-zinc-500">{p.dateLabel}</div>
    </div>
  );
}

function LiftScatterPanel({
  lift,
  points,
  profileMaxKg,
}: {
  lift: ApproachMapLift;
  points: PlotPoint[];
  profileMaxKg: number | null;
}) {
  const color = LIFT_COLORS[lift];
  const { repsDomain, weightDomain } = chartDomains(points);
  const [yMin, yMax] = weightDomain;
  const zones =
    profileMaxKg != null && profileMaxKg > 0 ? zoneBandsKg(yMin, yMax, profileMaxKg) : [];
  const refLines =
    profileMaxKg != null && profileMaxKg > 0
      ? [0.7, 0.8, 0.9]
          .map((r) => Math.round(profileMaxKg * r * 10) / 10)
          .filter((kg) => kg > yMin && kg < yMax)
      : [];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 p-3 sm:p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h4 className="font-display text-xs font-bold uppercase tracking-wide" style={{ color }}>
          {approachMapLiftLabelUk(lift)}
        </h4>
        <span className="text-[11px] tabular-nums text-zinc-500">
          {points.length}{" "}
          {points.length === 1 ? "підхід" : points.length < 5 ? "підходи" : "підходів"}
        </span>
      </div>
      {profileMaxKg != null && profileMaxKg > 0 ? (
        <p className="mb-3 text-[11px] text-zinc-500">Макс. у профілі: {formatKg(profileMaxKg)} кг</p>
      ) : (
        <p className="mb-3 text-[11px] text-zinc-500">Макс. у профілі не вказано</p>
      )}
      <div className="h-52 w-full min-w-0 sm:h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ScatterChart margin={{ top: 4, right: 8, left: 2, bottom: 4 }}>
            {zones.map((z, i) => (
              <ReferenceArea
                key={i}
                y1={z.y1}
                y2={z.y2}
                fill={z.fill}
                fillOpacity={z.fillOpacity}
              />
            ))}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              type="number"
              dataKey="repsPlot"
              domain={repsDomain}
              ticks={Array.from(
                { length: repsDomain[1] - repsDomain[0] + 1 },
                (_, i) => repsDomain[0] + i,
              )}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />
            <YAxis
              type="number"
              dataKey="weightKg"
              domain={weightDomain}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              width={40}
              tickFormatter={(v: number) => formatKg(v)}
            />
            <ZAxis range={[52, 52]} />
            {refLines.map((kg) => (
              <ReferenceLine
                key={kg}
                y={kg}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="3 5"
              />
            ))}
            <Tooltip content={<ApproachMapTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter
              data={points}
              fill={color}
              fillOpacity={0.82}
              stroke={color}
              strokeOpacity={0.35}
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ApproachMapChart({
  points,
  hints,
  profileMaxKg,
}: {
  points: ApproachMapPoint[];
  hints: ApproachMapHints;
  profileMaxKg: ProfileSbdMaxKg;
}) {
  const plotByLift = useMemo(() => {
    const plotted = toPlotPoints(points);
    return Object.fromEntries(
      LIFT_ORDER.map((lift) => [lift, plotted.filter((p) => p.lift === lift)]),
    ) as Record<ApproachMapLift, PlotPoint[]>;
  }, [points]);

  const activeLifts = LIFT_ORDER.filter((lift) => plotByLift[lift].length > 0);

  if (points.length === 0) {
    return (
      <div className={card}>
        <h3 className="font-display mb-1 text-sm font-bold uppercase tracking-wide text-white">
          Карта підходів
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Вага штанги та повторення кожного робочого підходу SBD.
        </p>
        <p className="mt-3 text-sm text-zinc-500">{emptyMessage(hints)}</p>
        {hints.noTraining ? (
          <Link
            href="/workouts/new"
            className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 transition hover:underline"
          >
            Додати тренування
          </Link>
        ) : null}
        {hints.missingMaxLifts.length > 0 ? (
          <Link
            href="/profile"
            className="mt-4 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#e31e24] underline-offset-2 transition hover:underline"
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
        Карта підходів
      </h3>
      <p className="text-xs leading-relaxed text-zinc-500">
        Окремо по кожному руху: повторення (горизонтально) і вага штанги в кілограмах
        (вертикально). Кожна крапка — один робочий підхід.
      </p>

      {profileMaxKg.squat || profileMaxKg.bench || profileMaxKg.deadlift ? (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
          <span>Зони від максу в профілі:</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-zinc-600/40" aria-hidden /> &lt;70%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-sky-500/30" aria-hidden /> 70–80%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-amber-400/30" aria-hidden /> 80–90%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm bg-[#e31e24]/30" aria-hidden /> 90%+
          </span>
        </div>
      ) : null}

      <div
        className={`mt-4 grid gap-4 ${
          activeLifts.length === 1
            ? "max-w-md"
            : activeLifts.length === 2
              ? "sm:grid-cols-2"
              : "lg:grid-cols-3"
        }`}
      >
        {activeLifts.map((lift) => (
          <LiftScatterPanel
            key={lift}
            lift={lift}
            points={plotByLift[lift]}
            profileMaxKg={profileMaxKg[lift]}
          />
        ))}
      </div>
    </div>
  );
}
