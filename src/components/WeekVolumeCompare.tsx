import type { WeekVolumeCompare as WeekComparePayload } from "@/lib/week-compare";

function cell(kg: number, prev: number) {
  const diff = kg - prev;
  if (Math.abs(diff) < 0.01) return <span className="text-zinc-500">—</span>;
  const up = diff > 0;
  return (
    <span className={up ? "text-emerald-400" : "text-red-400"}>
      {up ? "+" : ""}
      {diff.toFixed(1)}
    </span>
  );
}

export function WeekVolumeCompare({ data }: { data: WeekComparePayload | null }) {
  if (!data) {
    return (
      <div className="sbd-card rounded-xl p-5">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">Тиждень до тижня</h3>
        <p className="mt-2 text-sm text-zinc-500">Потрібно щонайменше два тижні з даними після фільтрів.</p>
      </div>
    );
  }

  const { prev, curr } = data;

  return (
    <div className="sbd-card rounded-xl p-5">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">Об&apos;єм: поточний vs попередній тиждень</h3>
      <p className="mt-1 text-xs text-zinc-500">
        {curr.weekLabel} порівняно з {prev.weekLabel} (кг·повт, робочі підходи базових вправ).
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
              <td className="py-2 pr-4 tabular-nums">{prev.bench.toFixed(1)}</td>
              <td className="py-2 pr-4 tabular-nums">{curr.bench.toFixed(1)}</td>
              <td className="py-2 tabular-nums">{cell(curr.bench, prev.bench)}</td>
            </tr>
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4">Присяд</td>
              <td className="py-2 pr-4 tabular-nums">{prev.squat.toFixed(1)}</td>
              <td className="py-2 pr-4 tabular-nums">{curr.squat.toFixed(1)}</td>
              <td className="py-2 tabular-nums">{cell(curr.squat, prev.squat)}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Тяга</td>
              <td className="py-2 pr-4 tabular-nums">{prev.deadlift.toFixed(1)}</td>
              <td className="py-2 pr-4 tabular-nums">{curr.deadlift.toFixed(1)}</td>
              <td className="py-2 tabular-nums">{cell(curr.deadlift, prev.deadlift)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
