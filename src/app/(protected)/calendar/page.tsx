import Link from "next/link";
import { getSessionUser } from "@/shared/lib/auth";
import { EmptyStateCallout } from "@/shared/ui/EmptyStateCallout";
import { TrainingCalendar } from "@/features/calendar/components/TrainingCalendar";
import { getCalendarPageData } from "@/server/queries/calendar";

const btnPrimary =
  "inline-flex min-h-[48px] touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/25 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#c41a21] hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.98]";

export default async function CalendarPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const { workoutDayKeys, dayTagByKey } = await getCalendarPageData(user.id);

  return (
    <div className="sbd-stagger-children space-y-6">
      {workoutDayKeys.length === 0 ? (
        <div className="sbd-card rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-6 sm:p-8">
          <EmptyStateCallout
            title="Календар порожній"
            description="Додай тренування з датою — день підсвітиться."
          >
            <Link href="/workouts/new" className={btnPrimary}>
              Додати тренування
            </Link>
            <Link
              href="/profile"
              className="text-center text-sm font-medium text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
            >
              Профіль
            </Link>
          </EmptyStateCallout>
        </div>
      ) : null}

      <TrainingCalendar workoutDayKeys={workoutDayKeys} dayTagByKey={dayTagByKey} />
    </div>
  );
}
