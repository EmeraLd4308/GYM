export default function ProtectedLoading() {
  return (
    <div className="space-y-6 py-2">
      <div className="h-10 w-48 max-w-full animate-pulse rounded-lg bg-zinc-800/80" />
      <div className="h-36 animate-pulse rounded-2xl bg-zinc-900/50 ring-1 ring-white/[0.06]" />
      <div className="h-48 animate-pulse rounded-2xl bg-zinc-900/40 ring-1 ring-white/[0.05]" />
    </div>
  );
}
