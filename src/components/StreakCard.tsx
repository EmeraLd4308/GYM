export function StreakCard({ weeks }: { weeks: number }) {
  return (
    <div className="sbd-card rounded-xl p-5">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">
        Streak (≥3 тренувань / тиждень)
      </h3>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[#e31e24]">{weeks}</p>
      <p className="mt-1 text-xs text-zinc-500">
        Підряд тижнів від сьогодні назад, де виконано щонайменше три тренування (з урахуванням
        фільтра дат).
      </p>
    </div>
  );
}
