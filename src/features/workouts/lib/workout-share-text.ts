import type { BaseLift } from "@prisma/client";
import { baseLiftLabel } from "@/features/workouts/lib/base-lift";

type Set = { weightKg: unknown; reps: number; isWarmup: boolean };
type Ex = {
  id?: string;
  name: string;
  baseLift: BaseLift;
  parentId?: string | null;
  sets: Set[];
};

function formatSets(sets: Set[], indent = "   "): string[] {
  return sets.map((s, j) => {
    const w = typeof s.weightKg === "number" ? s.weightKg : Number(s.weightKg);
    const tag = s.isWarmup ? "розминка" : "робочий";
    return `${indent}${j + 1}) ${Number.isFinite(w) ? w : "?"} кг × ${s.reps} (${tag})`;
  });
}

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

  const byId = new Map(args.exercises.filter((e) => e.id).map((e) => [e.id!, e]));
  const childrenByParent = new Map<string, Ex[]>();
  for (const ex of args.exercises) {
    if (!ex.parentId) continue;
    const list = childrenByParent.get(ex.parentId) ?? [];
    list.push(ex);
    childrenByParent.set(ex.parentId, list);
  }

  let n = 0;
  for (const ex of args.exercises) {
    if (ex.parentId) continue;
    n += 1;
    lines.push(
      `${n}. ${ex.name}${ex.baseLift !== "NONE" ? ` · ${baseLiftLabel(ex.baseLift)}` : ""}`,
    );
    lines.push(...formatSets(ex.sets));

    const kids = (ex.id ? childrenByParent.get(ex.id) : undefined) ?? [];
    for (const child of kids) {
      lines.push(`   ↳ ${child.name} (дочірня)`);
      lines.push(...formatSets(child.sets, "      "));
    }
    lines.push("");
  }

  if (args.notes?.trim()) {
    lines.push("Нотатки:");
    lines.push(args.notes.trim());
  }
  lines.push("");
  lines.push("— SBD Tracker");
  return lines.join("\n");
}
