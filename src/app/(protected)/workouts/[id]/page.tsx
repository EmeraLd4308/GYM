import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { WorkoutSession } from "@/components/WorkoutSession";

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;
  const w = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!w) notFound();

  return (
    <div className="space-y-6">
      <p className="text-zinc-500">
        Дату можна змінити в будь-який момент — статистика йде за обраним днем. Вага довільна;
        розминка не входить у базові графіки.
      </p>
      <WorkoutSession workoutId={id} />
    </div>
  );
}
