"use client";

import { DateWeightFilters } from "@/components/DateWeightFilters";

export function StatsFilterForm() {
  return (
    <DateWeightFilters
      idPrefix="sf"
      actionBasePath="/stats"
      clearPath="/stats"
      title="Фільтри статистики"
      description={
        <>
          Проміжок дат обмежує тренування. Вага (кг) застосовується лише до{" "}
          <span className="text-zinc-400">робочих підходів</span> жиму / присяду / тяги (без розминки). Можна вказати
          лише дати, лише вагу або все разом.
        </>
      }
    />
  );
}
