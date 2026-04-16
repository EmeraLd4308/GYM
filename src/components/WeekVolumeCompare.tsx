import type { WeekVolumeCompare as WeekComparePayload } from "@/lib/week-compare";

function fmt(v: number | null, decimals: number) {
  if (v == null) return "—";
  return v.toFixed(decimals);
}

function cell(curr: number | null, prev: number | null, decimals: number) {
  if (curr == null || prev == null) return <span className="text-zinc-500">—</span>;
  const diff = curr - prev;
  if (Math.abs(diff) < 1 / 10 ** decimals) return <span className="text-zinc-500">—</span>;
  const up = diff > 0;
  return (
    <span className={up ? "text-emerald-400" : "text-red-400"}>
      {up ? "+" : ""}
      {diff.toFixed(decimals)}
    </span>
  );
}

export function WeekVolumeCompare({
  data,
  title,
  subtitle,
  decimals = 2,
}: {
  data: WeekComparePayload | null;
  title: string;
  subtitle: string;
  decimals?: number;
}) {
  if (!data) {
    return (
      <div className="sbd-card sbd-surface-shine rounded-xl p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
          Тиждень до тижня
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Потрібно щонайменше два тижні з даними після фільтрів.
        </p>
      </div>
    );
  }

  const { prev, curr } = data;

  return (
    <div className="sbd-card sbd-surface-shine rounded-xl p-5">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      <p className="mt-2 text-xs text-zinc-500">
        {prev.weekLabel} → {curr.weekLabel}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[280px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="pb-2 pr-4">Рух</th>
              <th className="pb-2 pr-4">Попередній</th>
              <th className="pb-2 pr-4">Поточний</th>
              <th className="pb-2">Δ</th>
            </tr>
          </thead>
          <tbody className="text-zinc-200">
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4">Жим</td>
              <td className="py-2 pr-4 tabular-nums">{fmt(prev.bench, decimals)}</td>
              <td className="py-2 pr-4 tabular-nums">{fmt(curr.bench, decimals)}</td>
              <td className="py-2 tabular-nums">{cell(curr.bench, prev.bench, decimals)}</td>
            </tr>
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4">Присяд</td>
              <td className="py-2 pr-4 tabular-nums">{fmt(prev.squat, decimals)}</td>
              <td className="py-2 pr-4 tabular-nums">{fmt(curr.squat, decimals)}</td>
              <td className="py-2 tabular-nums">{cell(curr.squat, prev.squat, decimals)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Тяга</td>
              <td className="py-2 pr-4 tabular-nums">{fmt(prev.deadlift, decimals)}</td>
              <td className="py-2 pr-4 tabular-nums">{fmt(curr.deadlift, decimals)}</td>
              <td className="py-2 tabular-nums">{cell(curr.deadlift, prev.deadlift, decimals)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
