export function AppCredit({ className = "" }: { className?: string }) {
  return (
    <p
      aria-hidden
      className={`pointer-events-none select-none text-center text-[0.625rem] font-medium tracking-[0.12em] text-zinc-600/40 ${className}`}
    >
      by Vadym Berduk
    </p>
  );
}
