"use client";

import { DateWeightFilters } from "@/components/DateWeightFilters";

const PAGE_SIZE = "20";

export function WorkoutListFilters() {
  return (
    <DateWeightFilters
      idPrefix="wl"
      actionBasePath="/workouts"
      clearPath="/workouts"
      title="Фільтри"
      applyExtraParams={{ pageSize: PAGE_SIZE }}
      description="Проміжок дат і вага (кг) за робочими підходами жиму / присяду / тяги — як у статистиці. Після застосування сторінка скидається на першу."
    />
  );
}
