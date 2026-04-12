export const WORKOUT_LIST_PAGE_SIZE_DEFAULT = 6;

const FIRST_TIER = [6, 12, 24, 36, 48, 60] as const;

function smallestTierCovering(total: number): number {
  for (const s of FIRST_TIER) {
    if (s >= total) return s;
  }
  let n = 72;
  while (n <= 600) {
    if (n >= total) return n;
    n += 12;
  }
  return 600;
}

function isAllowedWorkoutListPageSize(n: number): boolean {
  if (!Number.isFinite(n) || n < 6 || n > 600) return false;
  if ((FIRST_TIER as readonly number[]).includes(n)) return true;
  return n > 60 && (n - 60) % 12 === 0;
}

export function parseWorkoutListPageSize(raw: string | undefined): number {
  if (raw === undefined || raw === "") return WORKOUT_LIST_PAGE_SIZE_DEFAULT;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return WORKOUT_LIST_PAGE_SIZE_DEFAULT;
  return isAllowedWorkoutListPageSize(n) ? n : WORKOUT_LIST_PAGE_SIZE_DEFAULT;
}

export function workoutListPageSizeOptionsForTotal(total: number): number[] {
  if (total <= 0) return [WORKOUT_LIST_PAGE_SIZE_DEFAULT];
  const ceiling = Math.min(600, smallestTierCovering(total));
  const out: number[] = [];
  for (const s of FIRST_TIER) {
    if (s <= ceiling) out.push(s);
  }
  let n = 72;
  while (n <= ceiling && n <= 600) {
    out.push(n);
    n += 12;
  }
  return out;
}
