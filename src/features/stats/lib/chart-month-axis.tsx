export function monthKeyFromWeekStart(iso: string): string {
  return iso.slice(0, 7);
}

export function monthAxisLabel(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y!, (m ?? 1) - 1, 1);
  const month = d.toLocaleDateString("uk-UA", { month: "short" }).replace(/\./g, "");
  const capped = month.charAt(0).toLocaleUpperCase("uk-UA") + month.slice(1);
  return `${capped} ${String(d.getFullYear()).slice(2)}`;
}

export function dateAxisLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d
    .toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "2-digit" })
    .replace(/\./g, "");
}

export function spacedMonthTicks(
  chartData: { weekStartIso: string; monthKey: string }[],
): string[] {
  const starts: string[] = [];
  for (let i = 0; i < chartData.length; i++) {
    const row = chartData[i]!;
    if (i === 0 || row.monthKey !== chartData[i - 1]!.monthKey) {
      starts.push(row.weekStartIso);
    }
  }
  return thinAxisTicks(starts, 3);
}

export function thinAxisTicks<T>(values: T[], maxTicks = 3): T[] {
  if (values.length <= maxTicks) return values;
  if (maxTicks <= 1) return values.slice(0, 1);
  if (maxTicks === 2) return [values[0]!, values[values.length - 1]!];

  const out: T[] = [];
  const lastIndex = values.length - 1;
  for (let i = 0; i < maxTicks; i++) {
    const idx = Math.round((i * lastIndex) / (maxTicks - 1));
    const v = values[idx]!;
    if (out[out.length - 1] !== v) out.push(v);
  }
  return out;
}

type AxisTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
  index?: number;
  visibleTicksCount?: number;
  format?: "month" | "date" | "raw";
};

export function ChartAxisTick({
  x = 0,
  y = 0,
  payload,
  index = 0,
  visibleTicksCount = 1,
  format = "month",
}: AxisTickProps) {
  const raw = typeof payload?.value === "string" ? payload.value : "";
  let label = raw;
  if (format === "month" && raw) label = monthAxisLabel(raw);
  if (format === "date" && raw) label = dateAxisLabel(raw);

  const isFirst = index === 0;
  const isLast = index === visibleTicksCount - 1;
  const textAnchor = isFirst ? "start" : isLast ? "end" : "middle";

  return (
    <text x={x} y={y + 14} textAnchor={textAnchor} fill="#71717a" fontSize={10}>
      {label}
    </text>
  );
}
