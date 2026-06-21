export function workingSetNumber(
  sets: ReadonlyArray<{ isWarmup: boolean }>,
  setIndex: number,
): number | null {
  const set = sets[setIndex];
  if (!set || set.isWarmup) return null;

  let n = 0;
  for (let i = 0; i <= setIndex; i++) {
    if (!sets[i]?.isWarmup) n++;
  }
  return n;
}

export function countWorkingSets(sets: ReadonlyArray<{ isWarmup: boolean }>): number {
  return sets.filter((s) => !s.isWarmup).length;
}
