export type WeekProgramWorkout = {
  date: Date;
  title?: string | null;
  exercises: Array<{ name: string }>;
};

export function formatWeekRangeLabel(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(`${weekEnd}T12:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startPart = start.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: sameMonth ? undefined : "long",
  });
  const endPart = end.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${startPart} – ${endPart}`;
}

export function formatWeekProgramText(
  weekStart: string,
  weekEnd: string,
  workouts: WeekProgramWorkout[],
): string {
  const lines: string[] = [];
  lines.push("SBD · План тижня");
  lines.push(formatWeekRangeLabel(weekStart, weekEnd));
  lines.push("");

  if (workouts.length === 0) {
    lines.push("На цьому тижні тренувань немає.");
    lines.push("");
    lines.push("— SBD Tracker");
    return lines.join("\n");
  }

  for (const workout of workouts) {
    const title = workout.title?.trim() || "Тренування";
    lines.push(title);
    lines.push(
      workout.date.toLocaleDateString("uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
    workout.exercises.forEach((ex, index) => {
      const name = ex.name.trim();
      if (name) lines.push(`${index + 1}. ${name}`);
    });
    lines.push("");
  }

  lines.push("— SBD Tracker");
  return lines.join("\n");
}
