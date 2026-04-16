"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const input =
  "mt-1.5 w-full rounded-xl border border-white/[0.1] bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/45 focus:ring-2 focus:ring-[#e31e24]/12";

const presetBtn =
  "touch-manipulation rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-[#e31e24]/30 hover:bg-[#e31e24]/10 hover:text-zinc-100 active:scale-[0.98]";

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type DateWeightFiltersProps = {
  idPrefix: string;
  actionBasePath: string;
  clearPath: string;
  title: string;
  description: ReactNode;

  weightRangeHint?: ReactNode;
  applyExtraParams?: Record<string, string>;
  titleSearch?: { param: string; label: string; placeholder: string };
  tagFilter?: { param: string; label: string; options: Array<{ value: string; label: string }> };
};

export function DateWeightFilters({
  idPrefix,
  actionBasePath,
  clearPath,
  title,
  description,
  weightRangeHint,
  applyExtraParams,
  titleSearch,
  tagFilter,
}: DateWeightFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const searchParam = titleSearch?.param ?? "q";
  const [from, setFrom] = useState(() => sp.get("from") ?? "");
  const [to, setTo] = useState(() => sp.get("to") ?? "");
  const [wMin, setWMin] = useState(() => sp.get("wMin") ?? "");
  const [wMax, setWMax] = useState(() => sp.get("wMax") ?? "");
  const [titleQ, setTitleQ] = useState(() =>
    titleSearch ? (sp.get(titleSearch.param) ?? "") : "",
  );
  const [tag, setTag] = useState(() => (tagFilter ? (sp.get(tagFilter.param) ?? "") : ""));

  useEffect(() => {
    setFrom(sp.get("from") ?? "");
    setTo(sp.get("to") ?? "");
    setWMin(sp.get("wMin") ?? "");
    setWMax(sp.get("wMax") ?? "");
    if (titleSearch?.param) setTitleQ(sp.get(titleSearch.param) ?? "");
    if (tagFilter?.param) setTag(sp.get(tagFilter.param) ?? "");
  }, [sp, titleSearch?.param, tagFilter?.param]);

  const apply = useCallback(() => {
    const q = new URLSearchParams();
    if (from.trim()) q.set("from", from.trim());
    if (to.trim()) q.set("to", to.trim());
    if (wMin.trim()) q.set("wMin", wMin.trim());
    if (wMax.trim()) q.set("wMax", wMax.trim());
    if (titleSearch && titleQ.trim()) q.set(searchParam, titleQ.trim().slice(0, 200));
    if (tagFilter && tag.trim()) q.set(tagFilter.param, tag.trim());
    if (applyExtraParams) {
      for (const [k, v] of Object.entries(applyExtraParams)) {
        q.set(k, v);
      }
    }
    const qs = q.toString();
    router.push(qs ? `${actionBasePath}?${qs}` : actionBasePath);
  }, [
    from,
    to,
    wMin,
    wMax,
    titleQ,
    titleSearch,
    searchParam,
    tag,
    tagFilter,
    router,
    actionBasePath,
    applyExtraParams,
  ]);

  const clear = useCallback(() => {
    setFrom("");
    setTo("");
    setWMin("");
    setWMax("");
    if (titleSearch) setTitleQ("");
    if (tagFilter) setTag("");
    router.push(clearPath);
  }, [router, clearPath, titleSearch, tagFilter]);

  const setPresetDays = useCallback((days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setFrom(toIsoDate(start));
    setTo(toIsoDate(end));
  }, []);

  const setYearToDate = useCallback(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    setFrom(toIsoDate(start));
    setTo(toIsoDate(end));
  }, []);

  const clearDatesOnly = useCallback(() => {
    setFrom("");
    setTo("");
  }, []);

  const pf = `${idPrefix}-`;

  return (
    <div className="sbd-filter-panel space-y-5">
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
          {title}
        </h3>
        <div className="mt-2 text-xs leading-relaxed text-zinc-500">{description}</div>
      </div>

      <div className="space-y-6">
        {titleSearch ? (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {titleSearch.label}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
              За назвою тренування або назвою вправи. Натисни «Застосувати», щоб оновити список.
            </p>
            <input
              id={`${pf}search`}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder={titleSearch.placeholder}
              className={`${input} mt-3`}
              value={titleQ}
              onChange={(e) => setTitleQ(e.target.value)}
            />
          </div>
        ) : null}

        {tagFilter ? (
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {tagFilter.label}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
              Тег визначається автоматично за середнім RPE у тренуванні.
            </p>
            <select
              id={`${pf}tag`}
              className={`${input} mt-3`}
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            >
              <option value="">Усі теги</option>
              {tagFilter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#e31e24]/85">
            Період
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={presetBtn} onClick={() => setPresetDays(30)}>
              30 днів
            </button>
            <button type="button" className={presetBtn} onClick={() => setPresetDays(90)}>
              90 днів
            </button>
            <button type="button" className={presetBtn} onClick={setYearToDate}>
              Від поч. року
            </button>
            <button type="button" className={presetBtn} onClick={clearDatesOnly}>
              Скинути дати
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                htmlFor={`${pf}from`}
              >
                Від
              </label>
              <input
                id={`${pf}from`}
                type="date"
                className={input}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                htmlFor={`${pf}to`}
              >
                До
              </label>
              <input
                id={`${pf}to`}
                type="date"
                className={input}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Вага штанги (кг)
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
            {weightRangeHint ?? (
              <>
                Робочі підходи базових вправ (без розминки). Якщо не впевнений — залиш поля
                порожніми.
              </>
            )}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                htmlFor={`${pf}wmin`}
              >
                Мінімум
              </label>
              <input
                id={`${pf}wmin`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                placeholder="—"
                className={input}
                value={wMin}
                onChange={(e) => setWMin(e.target.value)}
              />
            </div>
            <div>
              <label
                className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                htmlFor={`${pf}wmax`}
              >
                Максимум
              </label>
              <input
                id={`${pf}wmax`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                placeholder="—"
                className={input}
                value={wMax}
                onChange={(e) => setWMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-[44px] rounded-xl bg-[#e31e24] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21] active:scale-[0.98]"
              onClick={apply}
            >
              Застосувати
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-xl border border-white/[0.12] bg-white/[0.03] px-5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] active:scale-[0.98]"
              onClick={clear}
            >
              Усе скинути
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 sm:max-w-[14rem] sm:text-right">
            Після змін натисни «Застосувати», інакше URL не оновиться.
          </p>
        </div>
      </div>
    </div>
  );
}
