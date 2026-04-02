import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { NewWorkoutForm } from "@/components/NewWorkoutForm";

export default async function NewWorkoutPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <p className="text-zinc-500">
        Обери дату (у тому числі майбутню), за потреби шаблон — і заповнюй вправи та підходи коли
        зручно.
      </p>
      <div className="sbd-card rounded-xl p-5 sm:p-6">
        <NewWorkoutForm templates={templates} />
      </div>
    </div>
  );
}
