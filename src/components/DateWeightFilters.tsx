"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const field =
  "mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-[#e31e24]/35";

export type DateWeightFiltersProps = {
  /** Префікс id для полів (унікальність на сторінці). */
  idPrefix: string;
  /** Базовий шлях для застосування фільтрів (наприклад `/stats` або `/workouts`). */
  actionBasePath: string;
  /** Куди переходити при «Скинути». */
  clearPath: string;
  title: string;
  description: ReactNode;
  /** Додаткові query-параметри при застосуванні (наприклад `pageSize` для списку тренувань). */
  applyExtraParams?: Record<string, string>;
};

export function DateWeightFilters({
  idPrefix,
  actionBasePath,
  clearPath,
  title,
  description,
  applyExtraParams,
}: DateWeightFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [from, setFrom] = useState(() => sp.get("from") ?? "");
  const [to, setTo] = useState(() => sp.get("to") ?? "");
  const [wMin, setWMin] = useState(() => sp.get("wMin") ?? "");
  const [wMax, setWMax] = useState(() => sp.get("wMax") ?? "");

  useEffect(() => {
    setFrom(sp.get("from") ?? "");
    setTo(sp.get("to") ?? "");
    setWMin(sp.get("wMin") ?? "");
    setWMax(sp.get("wMax") ?? "");
  }, [sp]);

  const apply = useCallback(() => {
    const q = new URLSearchParams();
    if (from.trim()) q.set("from", from.trim());
    if (to.trim()) q.set("to", to.trim());
    if (wMin.trim()) q.set("wMin", wMin.trim());
    if (wMax.trim()) q.set("wMax", wMax.trim());
    if (applyExtraParams) {
      for (const [k, v] of Object.entries(applyExtraParams)) {
        q.set(k, v);
      }
    }
    const qs = q.toString();
    router.push(qs ? `${actionBasePath}?${qs}` : actionBasePath);
  }, [from, to, wMin, wMax, router, actionBasePath, applyExtraParams]);

  const clear = useCallback(() => {
    setFrom("");
    setTo("");
    setWMin("");
    setWMax("");
    router.push(clearPath);
  }, [router, clearPath]);

  const pf = `${idPrefix}-`;

  return (
    <div className="sbd-card rounded-xl p-5">
      <h3 className="font-display mb-3 text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
      <div className="mb-4 text-xs text-zinc-500">{description}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor={`${pf}from`}>
            Від (дата)
          </label>
          <input
            id={`${pf}from`}
            type="date"
            className={field}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor={`${pf}to`}>
            До (дата)
          </label>
          <input id={`${pf}to`} type="date" className={field} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor={`${pf}wmin`}>
            Вага від (кг)
          </label>
          <input
            id={`${pf}wmin`}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.5"
            placeholder="необов'язково"
            className={field}
            value={wMin}
            onChange={(e) => setWMin(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor={`${pf}wmax`}>
            Вага до (кг)
          </label>
          <input
            id={`${pf}wmax`}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.5"
            placeholder="необов'язково"
            className={field}
            value={wMax}
            onChange={(e) => setWMax(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="min-h-[44px] rounded-md bg-[#e31e24] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 hover:bg-[#c41a21]"
          onClick={apply}
        >
          Застосувати
        </button>
        <button
          type="button"
          className="min-h-[44px] rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/10"
          onClick={clear}
        >
          Скинути
        </button>
      </div>
    </div>
  );
}
