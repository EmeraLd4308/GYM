/**
 * One-time structure migration: src/components + src/lib → features/ + shared/
 * Run: node scripts/refactor-structure.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const moves = [
  // shared/lib — infrastructure
  ["src/lib/prisma.ts", "src/shared/lib/prisma.ts"],
  ["src/lib/db-errors.ts", "src/shared/lib/db-errors.ts"],
  ["src/lib/auth.ts", "src/shared/lib/auth.ts"],
  ["src/lib/session-client.ts", "src/shared/lib/session-client.ts"],
  ["src/lib/login-normalize.ts", "src/shared/lib/login-normalize.ts"],
  ["src/lib/login-utils.ts", "src/shared/lib/login-utils.ts"],
  ["src/lib/rate-limit.ts", "src/shared/lib/rate-limit.ts"],
  ["src/lib/request-origin.ts", "src/shared/lib/request-origin.ts"],
  ["src/lib/date-local.ts", "src/shared/lib/date-local.ts"],
  ["src/lib/theme.ts", "src/shared/lib/theme.ts"],
  ["src/lib/route-meta.ts", "src/shared/lib/route-meta.ts"],
  ["src/lib/body-scroll-lock.ts", "src/shared/lib/body-scroll-lock.ts"],
  ["src/lib/sort-order-update.ts", "src/shared/lib/sort-order-update.ts"],
  ["src/lib/sort-order-update.test.ts", "src/shared/lib/sort-order-update.test.ts"],
  ["src/lib/schedule-metrics-refresh.ts", "src/shared/lib/schedule-metrics-refresh.ts"],
  ["src/lib/array-move.ts", "src/shared/lib/array-move.ts"],

  // shared/ui
  ["src/components/ui/styles.ts", "src/shared/ui/styles.ts"],
  ["src/components/ConfirmDialog.tsx", "src/shared/ui/ConfirmDialog.tsx"],
  ["src/components/EmptyStateCallout.tsx", "src/shared/ui/EmptyStateCallout.tsx"],
  ["src/components/icons.tsx", "src/shared/ui/icons.tsx"],
  ["src/components/ContentFade.tsx", "src/shared/ui/ContentFade.tsx"],
  ["src/components/SbdLoadingScreen.tsx", "src/shared/ui/SbdLoadingScreen.tsx"],
  ["src/components/SbdLoadingPortal.tsx", "src/shared/ui/SbdLoadingPortal.tsx"],
  ["src/components/SbdRouteLoading.tsx", "src/shared/ui/SbdRouteLoading.tsx"],

  // shared/shell
  ["src/components/Nav.tsx", "src/shared/shell/Nav.tsx"],
  ["src/components/MobileBottomNav.tsx", "src/shared/shell/MobileBottomNav.tsx"],
  ["src/components/PageToolbar.tsx", "src/shared/shell/PageToolbar.tsx"],
  ["src/components/Providers.tsx", "src/shared/shell/Providers.tsx"],
  ["src/components/ThemeProvider.tsx", "src/shared/shell/ThemeProvider.tsx"],
  ["src/components/ThemeToggle.tsx", "src/shared/shell/ThemeToggle.tsx"],
  ["src/components/AppCredit.tsx", "src/shared/shell/AppCredit.tsx"],
  ["src/components/ToastProvider.tsx", "src/shared/shell/ToastProvider.tsx"],
  ["src/components/LoginToast.tsx", "src/shared/shell/LoginToast.tsx"],
  ["src/components/MobileHideNextDevLogo.tsx", "src/shared/shell/MobileHideNextDevLogo.tsx"],

  // shared/filters
  ["src/components/DateWeightFilters.tsx", "src/shared/filters/DateWeightFilters.tsx"],

  // features/auth
  ["src/components/AuthForm.tsx", "src/features/auth/components/AuthForm.tsx"],

  // features/workouts
  ["src/components/WorkoutSession.tsx", "src/features/workouts/components/WorkoutSession.tsx"],
  ["src/components/WorkoutSessionSkeleton.tsx", "src/features/workouts/components/WorkoutSessionSkeleton.tsx"],
  ["src/components/SortableExerciseSection.tsx", "src/features/workouts/components/SortableExerciseSection.tsx"],
  ["src/components/NewWorkoutForm.tsx", "src/features/workouts/components/NewWorkoutForm.tsx"],
  ["src/components/WorkoutListFilters.tsx", "src/features/workouts/components/WorkoutListFilters.tsx"],
  ["src/components/WorkoutListPagination.tsx", "src/features/workouts/components/WorkoutListPagination.tsx"],
  ["src/lib/workout-tags.ts", "src/features/workouts/lib/workout-tags.ts"],
  ["src/lib/workout-list-where.ts", "src/features/workouts/lib/workout-list-where.ts"],
  ["src/lib/workout-list-where.test.ts", "src/features/workouts/lib/workout-list-where.test.ts"],
  ["src/lib/workout-list-page-size.ts", "src/features/workouts/lib/workout-list-page-size.ts"],
  ["src/lib/workout-list-page-size.test.ts", "src/features/workouts/lib/workout-list-page-size.test.ts"],
  ["src/lib/workout-share-text.ts", "src/features/workouts/lib/workout-share-text.ts"],
  ["src/lib/derive-set-rpe.ts", "src/features/workouts/lib/derive-set-rpe.ts"],
  ["src/lib/base-lift.ts", "src/features/workouts/lib/base-lift.ts"],
  ["src/lib/rpe-estimate.ts", "src/features/workouts/lib/rpe-estimate.ts"],
  ["src/lib/lift-records.ts", "src/features/workouts/lib/lift-records.ts"],
  ["src/lib/use-workout-set-done.ts", "src/features/workouts/lib/use-workout-set-done.ts"],

  // features/templates
  ["src/components/TemplateEditor.tsx", "src/features/templates/components/TemplateEditor.tsx"],
  ["src/components/TemplateListRow.tsx", "src/features/templates/components/TemplateListRow.tsx"],
  ["src/components/TemplateAuthorByline.tsx", "src/features/templates/components/TemplateAuthorByline.tsx"],
  ["src/components/TemplatesListPagination.tsx", "src/features/templates/components/TemplatesListPagination.tsx"],
  ["src/lib/template-author-label.ts", "src/features/templates/lib/template-author-label.ts"],
  ["src/lib/template-author-label.test.ts", "src/features/templates/lib/template-author-label.test.ts"],

  // features/stats
  ["src/components/WeeklyCharts.tsx", "src/features/stats/components/WeeklyCharts.tsx"],
  ["src/components/AttendanceChart.tsx", "src/features/stats/components/AttendanceChart.tsx"],
  ["src/components/SbdTotalChart.tsx", "src/features/stats/components/SbdTotalChart.tsx"],
  ["src/components/StreakCard.tsx", "src/features/stats/components/StreakCard.tsx"],
  ["src/components/WeekVolumeCompare.tsx", "src/features/stats/components/WeekVolumeCompare.tsx"],
  ["src/components/StatsFilterForm.tsx", "src/features/stats/components/StatsFilterForm.tsx"],
  ["src/components/StatsOnboardingMark.tsx", "src/features/stats/components/StatsOnboardingMark.tsx"],
  ["src/components/StatsLazyCharts.tsx", "src/features/stats/components/StatsLazyCharts.tsx"],
  ["src/lib/weekly-volume.ts", "src/features/stats/lib/weekly-volume.ts"],
  ["src/lib/weekly-rpe.ts", "src/features/stats/lib/weekly-rpe.ts"],
  ["src/lib/weekly-attendance.ts", "src/features/stats/lib/weekly-attendance.ts"],
  ["src/lib/week-compare.ts", "src/features/stats/lib/week-compare.ts"],
  ["src/lib/week-compare.test.ts", "src/features/stats/lib/week-compare.test.ts"],
  ["src/lib/period-compare.ts", "src/features/stats/lib/period-compare.ts"],
  ["src/lib/streak.ts", "src/features/stats/lib/streak.ts"],
  ["src/lib/streak.test.ts", "src/features/stats/lib/streak.test.ts"],
  ["src/lib/stats-filters.ts", "src/features/stats/lib/stats-filters.ts"],
  ["src/lib/stats-filters.test.ts", "src/features/stats/lib/stats-filters.test.ts"],
  ["src/lib/profile-max-history.ts", "src/features/stats/lib/profile-max-history.ts"],

  // features/calendar
  ["src/components/TrainingCalendar.tsx", "src/features/calendar/components/TrainingCalendar.tsx"],
  ["src/components/CalendarDaySync.tsx", "src/features/calendar/components/CalendarDaySync.tsx"],
  ["src/lib/calendar-day-cookie.ts", "src/features/calendar/lib/calendar-day-cookie.ts"],
  ["src/lib/gym-cal-day-cookie-name.ts", "src/features/calendar/lib/gym-cal-day-cookie-name.ts"],

  // features/profile
  ["src/components/ProfileClient.tsx", "src/features/profile/components/ProfileClient.tsx"],
  ["src/components/PresetAvatar.tsx", "src/features/profile/components/PresetAvatar.tsx"],
  ["src/components/AchievementAnnounceClient.tsx", "src/features/profile/components/AchievementAnnounceClient.tsx"],
  ["src/components/AchievementIcon.tsx", "src/features/profile/components/AchievementIcon.tsx"],
  ["src/lib/profile-response.ts", "src/features/profile/lib/profile-response.ts"],
  ["src/lib/avatars.ts", "src/features/profile/lib/avatars.ts"],
  ["src/lib/ipf-gl.ts", "src/features/profile/lib/ipf-gl.ts"],
  ["src/lib/ipf-gl.test.ts", "src/features/profile/lib/ipf-gl.test.ts"],
  ["src/lib/achievements.ts", "src/features/profile/lib/achievements.ts"],

  // features/dashboard
  ["src/components/DashboardWelcome.tsx", "src/features/dashboard/components/DashboardWelcome.tsx"],
  ["src/components/DashboardQuickGuide.tsx", "src/features/dashboard/components/DashboardQuickGuide.tsx"],
  ["src/components/DashboardDuplicateActions.tsx", "src/features/dashboard/components/DashboardDuplicateActions.tsx"],
  ["src/components/OnboardingChecklist.tsx", "src/features/dashboard/components/OnboardingChecklist.tsx"],
];

/** @type {Record<string, string>} */
const importMap = {};

for (const [from, to] of moves) {
  const fromNorm = from.replace(/\\/g, "/");
  const toNorm = to.replace(/\\/g, "/");
  if (fromNorm.startsWith("src/components/")) {
    const name = path.basename(fromNorm, path.extname(fromNorm));
    if (fromNorm === "src/components/ui/styles.ts") {
      importMap["@/components/ui/styles"] = "@/shared/ui/styles";
    } else {
      importMap[`@/components/${name}`] = `@/${toNorm.replace(/^src\//, "").replace(/\.tsx$/, "")}`;
    }
  } else if (fromNorm.startsWith("src/lib/")) {
    const name = path.basename(fromNorm, path.extname(fromNorm));
    importMap[`@/lib/${name}`] = `@/${toNorm.replace(/^src\//, "").replace(/\.ts$/, "")}`;
  }
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function moveFiles() {
  for (const [from, to] of moves) {
    const absFrom = path.join(root, from);
    const absTo = path.join(root, to);
    if (!fs.existsSync(absFrom)) {
      console.warn(`skip missing: ${from}`);
      continue;
    }
    ensureDir(absTo);
    fs.renameSync(absFrom, absTo);
    console.log(`moved ${from} → ${to}`);
  }
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      walk(p, acc);
    } else if (/\.(ts|tsx|mts)$/.test(ent.name)) {
      acc.push(p);
    }
  }
  return acc;
}

function rewriteImports() {
  const keys = Object.keys(importMap).sort((a, b) => b.length - a.length);
  const files = walk(path.join(root, "src")).concat(walk(path.join(root, "e2e")));
  let changed = 0;
  for (const file of files) {
    let text = fs.readFileSync(file, "utf8");
    let next = text;
    for (const oldPath of keys) {
      const newPath = importMap[oldPath];
      next = next.split(oldPath).join(newPath);
    }
    if (next !== text) {
      fs.writeFileSync(file, next);
      changed++;
    }
  }
  console.log(`updated imports in ${changed} files`);
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) removeEmptyDirs(path.join(dir, ent.name));
  }
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
    console.log(`removed empty ${path.relative(root, dir)}`);
  }
}

moveFiles();
rewriteImports();
removeEmptyDirs(path.join(root, "src/components"));
removeEmptyDirs(path.join(root, "src/lib"));

console.log("done");
