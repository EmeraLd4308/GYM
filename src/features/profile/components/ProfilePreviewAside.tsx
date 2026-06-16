import { PresetAvatar } from "@/features/profile/components/PresetAvatar";
import { AchievementIcon } from "@/features/profile/components/AchievementIcon";
import type { ProfileController } from "@/features/profile/lib/use-profile";

type Props = Pick<
  ProfileController,
  | "avatarId"
  | "login"
  | "loginEdit"
  | "nickname"
  | "pinnedIds"
  | "achCatalog"
  | "gl"
  | "profileLevel"
  | "glPointsState"
>;

export function ProfilePreviewAside({
  avatarId,
  login,
  loginEdit,
  nickname,
  pinnedIds,
  achCatalog,
  gl,
  profileLevel,
  glPointsState,
}: Props) {
  return (
    <aside
      className="order-1 space-y-4 sm:space-y-5 lg:order-2 lg:col-span-5 lg:space-y-6"
      aria-label="Попередній перегляд GL"
    >
      <div className="sbd-card sbd-surface-shine flex flex-col gap-4 rounded-2xl border border-[var(--sbd-border)] p-4 shadow-md shadow-black/10 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:flex-col lg:items-stretch">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0 rounded-2xl border border-[var(--sbd-border)] bg-[var(--sbd-card)] p-2.5 shadow-sm ring-1 ring-[color-mix(in_oklab,var(--sbd-red),transparent_88%)]">
            <PresetAvatar
              avatarId={avatarId}
              size={104}
              className="ring-2 ring-[color-mix(in_oklab,var(--sbd-red),transparent_80%)]"
            />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-display text-base font-semibold leading-tight text-[var(--sbd-text)] sm:text-lg">
              {loginEdit || login}
            </p>
            {nickname.trim() ? (
              <p className="mt-1.5 truncate text-xs text-[var(--sbd-muted)]">
                Позивний: <span className="text-[var(--sbd-text)]">{nickname.trim()}</span>
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-[var(--sbd-muted)]">Без позивного</p>
            )}
            <div
              className="mt-2.5 flex min-h-[36px] flex-wrap items-center gap-1.5"
              aria-label="Закріплені досягнення"
            >
              {pinnedIds.length > 0 ? (
                pinnedIds.map((pid) => (
                  <span
                    key={pid}
                    className="inline-flex rounded-lg border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] p-1 shadow-sm"
                    title={achCatalog.find((c) => c.id === pid)?.title ?? pid}
                  >
                    <AchievementIcon achievementId={pid} size={28} />
                  </span>
                ))
              ) : (
                <span className="text-[11px] leading-snug text-[var(--sbd-muted)]">
                  До 3 у «Редагувати профіль».
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sbd-gl-preview relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--sbd-red),transparent_70%)] bg-[color-mix(in_oklab,var(--sbd-card)_15%,black)] p-5 shadow-xl shadow-black/50 sm:p-8">
        <div
          className="sbd-gl-preview-deco pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[color-mix(in_oklab,var(--sbd-red),transparent_80%)] blur-3xl"
          aria-hidden
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_oklab,var(--sbd-red),transparent_10%)]">
          Попередній перегляд
        </p>
        {gl.kind === "total" || gl.kind === "bench" ? (
          <>
            <p className="sbd-gl-preview-muted relative mt-2 text-xs text-[var(--sbd-muted)]">
              {gl.kind === "total" ? "IPF GL · сума триборства" : "IPF GL · жим лежачи"}
            </p>
            <p className="sbd-gl-preview__value relative mt-3 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-5xl">
              {gl.points}
            </p>
            <p className="sbd-gl-preview-muted relative mt-4 text-xs text-[var(--sbd-muted)]">
              Офіційний GL для рейтингу.
            </p>
          </>
        ) : (
          <p className="sbd-gl-preview-muted relative mt-4 text-sm leading-relaxed text-[var(--sbd-muted)]">
            {gl.message}
          </p>
        )}
      </div>

      <div className="sbd-card sbd-surface-shine rounded-2xl border border-[var(--sbd-border)] p-4 shadow-md sm:p-5">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sbd-muted)]">
          Рівень профілю
        </p>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[var(--sbd-red)]">
          {profileLevel}
        </p>
        <p className="mt-1 text-xs text-[var(--sbd-muted)]">
          {glPointsState != null && Number.isFinite(glPointsState) ? (
            <>За GL-балом ({glPointsState.toFixed(3)}).</>
          ) : (
            <>Заповни вагу й максимуми.</>
          )}
        </p>
      </div>
    </aside>
  );
}
