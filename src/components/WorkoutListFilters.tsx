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
      description="Пошук, діапазон дат і вага штанги. Після «Застосувати» оновлюється URL і список; сторінка пагінації скидається на першу."
      titleSearch={{
        param: "q",
        label: "Пошук",
        placeholder: "Назва тренування або вправа…",
      }}
      weightRangeHint={
        <>
          Залиш у списку лише ті тренування, де є хоча б один робочий підхід присяду, жиму або тяги
          з вагою штанги в цьому діапазоні (без розминки).
        </>
      }
    />
  );
}
