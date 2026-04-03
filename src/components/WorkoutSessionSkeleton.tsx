/** Плейсхолдер під час завантаження тренування. */
export function WorkoutSessionSkeleton() {
  return (
    <div className="space-y-8">
      <div className="sbd-card animate-pulse rounded-xl p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="h-8 w-full max-w-md rounded-md bg-zinc-800" />
          <div className="h-10 w-24 rounded-md bg-zinc-800/90" />
        </div>
        <div className="mt-6 h-4 w-40 rounded bg-zinc-800/70" />
        <div className="mt-3 h-10 max-w-[200px] rounded-md bg-zinc-800/80" />
        <div className="mt-4 h-4 w-56 rounded bg-zinc-800/50" />
        <div className="mt-4 h-20 w-full rounded-md bg-zinc-800/40" />
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="h-10 w-36 rounded-md bg-zinc-800/60" />
          <div className="h-10 w-32 rounded-md bg-zinc-800/50" />
        </div>
      </div>

      <div className="space-y-8">
        {[0, 1].map((i) => (
          <div key={i} className="sbd-card animate-pulse rounded-xl p-5">
            <div className="mb-4 h-6 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-24 rounded bg-zinc-800/60" />
            <div className="mt-6 space-y-2">
              <div className="h-10 w-full rounded-md bg-zinc-800/35" />
              <div className="h-10 w-full rounded-md bg-zinc-800/30" />
              <div className="h-10 w-full rounded-md bg-zinc-800/25" />
            </div>
            <div className="mt-4 h-8 w-28 rounded bg-zinc-800/50" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-5">
        <div className="mb-3 h-5 w-40 rounded bg-zinc-800/70" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-11 flex-1 rounded-md bg-zinc-800/40" />
          <div className="h-11 w-full rounded-md bg-zinc-800/40 sm:w-48" />
          <div className="h-11 w-28 rounded-md bg-zinc-800/50" />
        </div>
      </div>
    </div>
  );
}
