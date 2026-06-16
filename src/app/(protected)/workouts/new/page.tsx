import Link from "next/link";
import { getSessionUser } from "@/shared/lib/auth";
import { NewWorkoutForm } from "@/features/workouts/components/NewWorkoutForm";
import { getNewWorkoutFormTemplates } from "@/server/queries/templates";

const btnGhost =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-semibold text-zinc-200 transition hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10";

export default async function NewWorkoutPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const templates = await getNewWorkoutFormTemplates();

  return (
    <div className="sbd-card overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-[#e31e24]/[0.08] px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Нове тренування</p>
        <Link href="/templates/new" className={`${btnGhost} shrink-0`}>
          Новий шаблон
        </Link>
      </div>
      <div className="p-5 sm:p-6 md:p-8">
        <NewWorkoutForm templates={templates} currentUserId={user.id} />
      </div>
    </div>
  );
}
