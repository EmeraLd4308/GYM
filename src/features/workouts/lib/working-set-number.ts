type SetLike = { isWarmup: boolean; supersetGroup?: string | null };

export function computeWorkingSetNumbers(sets: ReadonlyArray<SetLike>): Array<number | null> {
  const numbers: Array<number | null> = [];
  const groupNumber = new Map<string, number>();
  let n = 0;
  for (const s of sets) {
    if (s.isWarmup) {
      numbers.push(null);
      continue;
    }
    const g = s.supersetGroup ?? null;
    if (g != null && groupNumber.has(g)) {
      numbers.push(groupNumber.get(g)!);
      continue;
    }
    n++;
    if (g != null) groupNumber.set(g, n);
    numbers.push(n);
  }
  return numbers;
}

export function workingSetNumber(sets: ReadonlyArray<SetLike>, setIndex: number): number | null {
  return computeWorkingSetNumbers(sets)[setIndex] ?? null;
}

export function countWorkingSets(sets: ReadonlyArray<SetLike>): number {
  const seen = new Set<string>();
  let n = 0;
  for (const s of sets) {
    if (s.isWarmup) continue;
    const g = s.supersetGroup ?? null;
    if (g != null) {
      if (seen.has(g)) continue;
      seen.add(g);
    }
    n++;
  }
  return n;
}
