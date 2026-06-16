import { cookies } from "next/headers";
import { GYM_CAL_DAY_COOKIE } from "@/features/calendar/lib/gym-cal-day-cookie-name";
import { todayDateInput } from "@/shared/lib/date-local";

export async function effectiveCalendarDayFromRequest(): Promise<string> {
  const store = await cookies();
  const v = store.get(GYM_CAL_DAY_COOKIE)?.value;
  if (v && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return todayDateInput();
}
