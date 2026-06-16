import Link from "next/link";
import { getSessionUser } from "@/shared/lib/auth";
import { DashboardDuplicateActions } from "@/features/dashboard/components/DashboardDuplicateActions";
import { DashboardQuickGuide } from "@/features/dashboard/components/DashboardQuickGuide";
import { DashboardWelcome } from "@/features/dashboard/components/DashboardWelcome";
import { EmptyStateCallout } from "@/shared/ui/EmptyStateCallout";
import { OnboardingChecklist } from "@/features/dashboard/components/OnboardingChecklist";
import {
  workoutTagBadgeClass,
  workoutTagLabelUk,
} from "@/features/workouts/lib/workout-tags";
import {
  getDashboardPageData,
  type DashboardWorkoutRow,
} from "@/server/queries/dashboard";

const listShell =
  "sbd-workout-rows divide-y divide-[var(--sbd-border)] overflow-hidden rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_45%,transparent)]";

const panelClass =
  "sbd-surface-shine overflow-hidden rounded-2xl border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] shadow-sm";

const primaryCta =
  "bg-[#e31e24] hover:bg-[#c41a21] shadow-lg shadow-red-950/25 transition active:scale-[0.99]";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const {
    todayWorkouts,
    otherRecent,
    profileDone,
    hasWorkout,
    workoutTotal,
    todayLabel,
    hasAnyWorkout,
  } = await getDashboardPageData(user.id);

  function workoutRow(w: DashboardWorkoutRow) {
    const setCount = w.exercises.reduce((acc, e) => acc + e._count.sets, 0);
    const displayTag = w.autoTag;
    return (
      <li key={w.id}>
        <Link
          href={`/workouts/${w.id}`}
          className="sbd-workout-row-link flex flex-col gap-0.5 px-4 py-3.5 transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_97%)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-4 [html[data-theme=light]_&]:hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_94%)]"
        >
          <span className="min-w-0 font-semibold text-[var(--sbd-text)]">
            <span className="inline-flex items-center gap-2">
              <span>{w.title ?? "Тренування"}</span>
              <span
                className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${workoutTagBadgeClass(displayTag)}`}
              >
                {workoutTagLabelUk(displayTag)}
              </span>
            </span>
          </span>
          <span className="shrink-0 text-sm text-[var(--sbd-muted)] sm:text-right">
            {new Date(w.date).toLocaleDateString("uk-UA", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            · підходів: {setCount}
          </span>
        </Link>
      </li>
    );
  }

  return (
    <div className="sbd-stagger-children space-y-5 md:space-y-6">
      <DashboardWelcome
        login={user.login}
        workoutTotal={workoutTotal}
        todayLabel={todayLabel}
      />

      <div className={panelClass}>
        <DashboardQuickGuide embedded />
      </div>

      <div className={`${panelClass} empty:hidden`}>
        <OnboardingChecklist embedded profileDone={profileDone} hasWorkout={hasWorkout} />
      </div>

      {!hasAnyWorkout ? (
        <div className={panelClass}>
          <div className="px-5 py-9 sm:px-8 sm:py-10">
            <EmptyStateCallout
              title="Почнімо з першого тренування"
              description="Додай вправи та підходи — зʼявляться календар і статистика."
            >
              <Link
                href="/workouts/new"
                className={`inline-flex min-h-[52px] w-full max-w-xs touch-manipulation items-center justify-center rounded-xl px-6 text-base font-bold text-white ${primaryCta} sm:w-auto`}
              >
                Додати тренування
              </Link>
            </EmptyStateCallout>
          </div>
        </div>
      ) : null}

      {hasAnyWorkout ? (
        <div className={panelClass}>
          <section className="px-4 py-5 sm:px-5 sm:py-6">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--sbd-muted)]">
              Тренування
            </h2>
            <div className="mt-4">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--sbd-muted)]">
                Сьогодні
              </h3>
              {todayWorkouts.length === 0 ? (
                <div className="rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_40%,transparent)] px-4 py-5 sm:px-5">
                  <EmptyStateCallout
                    align="left"
                    title="Сьогодні ще без запису"
                    description="Додай тренування на сьогодні або скопіюй з іншого дня."
                  >
                    <Link
                      href="/workouts/new"
                      className={`inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 text-sm font-bold uppercase tracking-wide text-white ${primaryCta} sm:w-auto sm:min-w-[14rem]`}
                    >
                      Додати тренування
                    </Link>
                  </EmptyStateCallout>
                </div>
              ) : (
                <ul className={`sbd-card-interactive ${listShell}`}>{todayWorkouts.map(workoutRow)}</ul>
              )}
            </div>

            <div className="mt-3">
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--sbd-muted)]">
                Нещодавні
              </h3>
              {otherRecent.length === 0 ? (
                <div className="rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_35%,transparent)] px-4 py-4 sm:px-5">
                  <EmptyStateCallout align="left" title="Нещодавніх немає">
                    <Link
                      href="/workouts"
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[var(--sbd-border)] bg-[color-mix(in_oklab,var(--sbd-card)_50%,transparent)] px-4 text-sm font-semibold text-[var(--sbd-text)] transition hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 sm:w-auto sm:min-w-[12rem]"
                    >
                      Усі тренування
                    </Link>
                    <Link
                      href="/calendar"
                      className="text-center text-sm font-medium text-[#e31e24] underline-offset-2 hover:underline sm:text-left"
                    >
                      Відкрити календар
                    </Link>
                  </EmptyStateCallout>
                </div>
              ) : (
                <ul className={`sbd-card-interactive ${listShell}`}>{otherRecent.map(workoutRow)}</ul>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {hasAnyWorkout ? (
        <div className={panelClass}>
          <DashboardDuplicateActions embedded />
        </div>
      ) : null}
    </div>
  );
}
