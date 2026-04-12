import type { BaseLift } from "@prisma/client";
import { baseLiftLabel } from "@/lib/base-lift";

type Set = { weightKg: unknown; reps: number; isWarmup: boolean };
type Ex = { name: string; baseLift: BaseLift; sets: Set[] };

export function formatWorkoutShareText(args: {
  title: string | null;
  date: Date;
  notes: string | null;
  exercises: Ex[];
}): string {
  const lines: string[] = [];
  const title = args.title?.trim() || "Тренування";
  lines.push(`SBD · ${title}`);
  lines.push(
    args.date.toLocaleDateString("uk-UA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
  lines.push("");
  args.exercises.forEach((ex, i) => {
    lines.push(`${i + 1}. ${ex.name}${ex.baseLift !== "NONE" ? ` · ${baseLiftLabel(ex.baseLift)}` : ""}`);
    ex.sets.forEach((s, j) => {
      const w = typeof s.weightKg === "number" ? s.weightKg : Number(s.weightKg);
      const tag = s.isWarmup ? "розминка" : "робочий";
      lines.push(`   ${j + 1}) ${Number.isFinite(w) ? w : "?"} кг × ${s.reps} (${tag})`);
    });
    lines.push("");
  });
  if (args.notes?.trim()) {
    lines.push("Нотатки:");
    lines.push(args.notes.trim());
  }
  lines.push("");
  lines.push("— SBD Tracker");
  return lines.join("\n");
}
