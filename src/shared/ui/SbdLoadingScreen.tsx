export function SbdLoadingScreen({
  message = "Завантаження",
  subMessage,
}: {
  message?: string;
  subMessage?: string;
}) {
  return (
    <div
      className="sbd-loading-screen flex min-h-[min(70dvh,32rem)] flex-col items-center justify-center gap-8 px-6 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="sbd-loading-card-inner relative w-full max-w-[min(100%,20rem)] rounded-2xl border px-8 py-10 shadow-2xl shadow-black/60 backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(227, 30, 36, 0.2), transparent 65%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-6">
          <svg
            className="sbd-loading-svg w-full max-w-[220px] text-[#e31e24]"
            viewBox="0 0 220 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <title>Анімація штанги</title>
            <line
              className="sbd-loading-bar-inner"
              x1="56"
              y1="50"
              x2="164"
              y2="50"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              className="sbd-loading-bar-glow"
              x1="56"
              y1="50"
              x2="164"
              y2="50"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.25"
            />
            <g className="sbd-loading-plate-left">
              <rect x="18" y="32" width="14" height="36" rx="3" fill="currentColor" opacity="0.9" />
              <rect x="32" y="38" width="10" height="24" rx="2" fill="currentColor" opacity="0.65" />
              <rect x="42" y="42" width="8" height="16" rx="2" fill="currentColor" opacity="0.45" />
            </g>
            <g className="sbd-loading-plate-right">
              <rect x="188" y="32" width="14" height="36" rx="3" fill="currentColor" opacity="0.9" />
              <rect x="178" y="38" width="10" height="24" rx="2" fill="currentColor" opacity="0.65" />
              <rect x="170" y="42" width="8" height="16" rx="2" fill="currentColor" opacity="0.45" />
            </g>
          </svg>

          <div className="flex items-center justify-center gap-1.5 font-display text-lg font-bold tracking-[0.35em]">
            <span className="sbd-loading-letter sbd-loading-letter-s">S</span>
            <span className="text-zinc-700" aria-hidden>
              ·
            </span>
            <span className="sbd-loading-letter sbd-loading-letter-b">B</span>
            <span className="text-zinc-700" aria-hidden>
              ·
            </span>
            <span className="sbd-loading-letter sbd-loading-letter-d">D</span>
          </div>

          <div className="space-y-1 text-center">
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-zinc-300">
              {message}
            </p>
            {subMessage ? (
              <p className="text-xs leading-relaxed text-zinc-600">{subMessage}</p>
            ) : (
              <p className="text-xs text-zinc-600">Присід · Жим · Тяга</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
