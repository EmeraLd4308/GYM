"use client";

import { DateWeightFilters } from "@/shared/filters/DateWeightFilters";
import { WORKOUT_TAG_OPTIONS } from "@/features/workouts/lib/workout-tags";

const PAGE_SIZE = "20";

export function WorkoutListFilters() {
  return (
    <DateWeightFilters
      idPrefix="wl"
      actionBasePath="/workouts"
      clearPath="/workouts"
      applyExtraParams={{ pageSize: PAGE_SIZE }}
      titleSearch={{
        param: "q",
        label: "Пошук",
        placeholder: "Назва тренування або вправа…",
      }}
      tagFilter={{
        param: "tag",
        label: "Авто-тег",
        options: WORKOUT_TAG_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
      }}
    />
  );
}
