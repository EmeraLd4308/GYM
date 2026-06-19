"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  uiBtnRowClass,
  uiButtonGhostClass,
  uiButtonPrimaryClass,
  uiChipClass,
  uiDateClass,
  uiFieldClass,
  uiFieldFitClass,
  uiFilterFieldsClass,
  uiInputNumClass,
  uiLabelClass,
  uiMutedTextClass,
  uiSearchClass,
  uiSectionTitleClass,
  uiSelectMdClass,
} from "@/shared/ui/styles";

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type DateWeightFiltersProps = {
  idPrefix: string;
  actionBasePath: string;
  clearPath: string;
  title: string;
  description?: ReactNode;

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
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--sbd-text)]">
          {title}
        </h3>
        {description ? (
          <div className={`mt-2 text-xs leading-relaxed ${uiMutedTextClass}`}>{description}</div>
        ) : null}
      </div>

      <div className="space-y-6">
        {titleSearch ? (
          <div className={uiFieldClass}>
            <label htmlFor={`${pf}search`} className={uiLabelClass}>
              {titleSearch.label}
            </label>
            <input
              id={`${pf}search`}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder={titleSearch.placeholder}
              className={uiSearchClass}
              value={titleQ}
              onChange={(e) => setTitleQ(e.target.value)}
            />
          </div>
        ) : null}

        {tagFilter ? (
          <div className={uiFieldClass}>
            <label htmlFor={`${pf}tag`} className={uiLabelClass}>
              {tagFilter.label}
            </label>
            <select
              id={`${pf}tag`}
              className={uiSelectMdClass}
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
          <p className={uiSectionTitleClass}>Період</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={uiChipClass} onClick={() => setPresetDays(30)}>
              30 днів
            </button>
            <button type="button" className={uiChipClass} onClick={() => setPresetDays(90)}>
              90 днів
            </button>
            <button type="button" className={uiChipClass} onClick={setYearToDate}>
              Від поч. року
            </button>
            <button type="button" className={uiChipClass} onClick={clearDatesOnly}>
              Скинути дати
            </button>
          </div>
          <div className={`mt-4 ${uiFilterFieldsClass}`}>
            <div className={uiFieldFitClass}>
              <label className={uiLabelClass} htmlFor={`${pf}from`}>
                Від
              </label>
              <input
                id={`${pf}from`}
                type="date"
                className={uiDateClass}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className={uiFieldFitClass}>
              <label className={uiLabelClass} htmlFor={`${pf}to`}>
                До
              </label>
              <input
                id={`${pf}to`}
                type="date"
                className={uiDateClass}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="sbd-divider-soft border-t pt-6">
          <p className={uiLabelClass}>Вага штанги (кг)</p>
          {weightRangeHint ? (
            <p className={`mt-1 text-xs leading-relaxed ${uiMutedTextClass}`}>{weightRangeHint}</p>
          ) : null}
          <div className={`mt-4 ${uiFilterFieldsClass}`}>
            <div className={uiFieldFitClass}>
              <label className={uiLabelClass} htmlFor={`${pf}wmin`}>
                Мінімум
              </label>
              <input
                id={`${pf}wmin`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                placeholder="—"
                className={uiInputNumClass}
                value={wMin}
                onChange={(e) => setWMin(e.target.value)}
              />
            </div>
            <div className={uiFieldFitClass}>
              <label className={uiLabelClass} htmlFor={`${pf}wmax`}>
                Максимум
              </label>
              <input
                id={`${pf}wmax`}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                placeholder="—"
                className={uiInputNumClass}
                value={wMax}
                onChange={(e) => setWMax(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={`sbd-divider-soft border-t pt-5 ${uiBtnRowClass}`}>
          <button type="button" className={uiButtonPrimaryClass} onClick={apply}>
            Застосувати
          </button>
          <button type="button" className={uiButtonGhostClass} onClick={clear}>
            Усе скинути
          </button>
        </div>
      </div>
    </div>
  );
}
