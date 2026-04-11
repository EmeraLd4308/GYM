"use client";

import { DateWeightFilters } from "@/components/DateWeightFilters";

export function StatsFilterForm() {
  return (
    <DateWeightFilters
      idPrefix="sf"
      actionBasePath="/stats"
      clearPath="/stats"
      title="Фільтри"
      description={
        <>
          Дати обмежують тренування для <span className="text-zinc-300">відвідуваності</span> та{" "}
          <span className="text-zinc-300">середнього RPE</span>. Графік суми максимумів з профілю
          завжди показує усю історію збережень у профілі. Діапазон ваги — лише для RPE.
        </>
      }
      weightRangeHint={
        <>
          Лише для середнього RPE: у розрахунок потрапляють робочі підходи SBD у цьому діапазоні. На
          графік суми максимумів з профілю та відвідуваність не впливає.
        </>
      }
    />
  );
}
