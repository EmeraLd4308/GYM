"use client";

import { DateWeightFilters } from "@/shared/filters/DateWeightFilters";

export function StatsFilterForm() {
  return (
    <DateWeightFilters
      idPrefix="sf"
      actionBasePath="/stats"
      clearPath="/stats"
      title="Фільтри"
      description="Дати — для відвідуваності та RPE. Вага — лише для RPE."
    />
  );
}
