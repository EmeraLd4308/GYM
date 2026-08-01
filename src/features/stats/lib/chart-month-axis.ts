export function monthKeyFromWeekStart(iso: string): string {
  return iso.slice(0, 7);
}

export function monthAxisLabel(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y!, (m ?? 1) - 1, 1);
  const month = d.toLocaleDateString("uk-UA", { month: "long" });
  const capped = month.charAt(0).toLocaleUpperCase("uk-UA") + month.slice(1);
  return `${capped} ${d.getFullYear()}`;
}

export function spacedMonthTicks(
  chartData: { weekStartIso: string; monthKey: string }[],
): string[] {
  const starts: string[] = [];
  for (let i = 0; i < chartData.length; i++) {
    const row = chartData[i]!;
    if (i === 0 || row.monthKey !== chartData[i - 1]!.monthKey) {
      starts.push(row.weekStartIso);
    }
  }
  return starts.filter((_, i) => i % 2 === 0);
}
