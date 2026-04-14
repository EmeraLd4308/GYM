"use client";

import type { GlEquipment, GlSex } from "@prisma/client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { normalizeLogin } from "@/lib/login-normalize";
import { PresetAvatar } from "@/components/PresetAvatar";
import { AVATAR_IDS, AVATAR_LABELS, type AvatarId, normalizeAvatarId } from "@/lib/avatars";
import { ipfGlProfilePreview } from "@/lib/ipf-gl";
import { AchievementIcon } from "@/components/AchievementIcon";

type ProfilePayload = {
  login: string;
  avatarId: string;
  nickname: string | null;
  glBodyweightKg: unknown;
  glMaxSquatKg: unknown;
  glMaxBenchKg: unknown;
  glMaxDeadliftKg: unknown;
  glSex: GlSex | null;
  glEquipment: GlEquipment | null;
  profileLevel?: number;
  glPoints?: number | null;
  achievementsCatalog?: { id: string; title: string; unlocked: boolean }[];
  pinnedAchievementIds?: string[];
};

type LbRow = {
  place: number;
  login: string;
  avatarId: string;
  nickname: string | null;
  score: number;
  profileLevel: number;
  pinnedAchievementIds?: string[];
};

function num(v: unknown): string {
  if (v == null) return "";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";
  return String(n);
}

function parseOptFloat(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (t === "") return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

const field =
  "mt-1.5 w-full rounded-lg border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-3 py-2.5 text-sm text-[var(--sbd-text)] shadow-[inset_0_1px_0_rgba(128,128,128,0.06)] outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/45 focus:ring-2 focus:ring-[#e31e24]/12";

const segBtn =
  "sbd-profile-seg__btn min-h-[44px] flex-1 touch-manipulation rounded-lg px-3 text-xs font-semibold uppercase tracking-wide transition sm:text-sm";

const lbTab =
  "sbd-lb-tab inline-flex min-h-[40px] touch-manipulation items-center justify-center rounded-lg border px-3 text-center text-xs font-semibold uppercase leading-none tracking-wide transition sm:text-sm";

const avatarPickBtn = (active: boolean) =>
  `relative flex touch-manipulation flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
    active
      ? "border-[#e31e24]/55 bg-[#e31e24]/12 shadow-[0_0_24px_-8px_rgba(227,30,36,0.35)] ring-1 ring-[#e31e24]/25"
      : "border-[var(--sbd-border)] bg-[var(--sbd-card)] hover:border-[#e31e24]/30 hover:bg-[#e31e24]/[0.06]"
  }`;

function ProfileSection({
  sectionId,
  title,
  description,
  children,
  withDivider = false,
}: {
  sectionId: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  withDivider?: boolean;
}) {
  const hid = `${sectionId}-heading`;
  return (
    <section
      className={withDivider ? "border-t border-[color:var(--sbd-border)] pt-8 md:pt-10" : ""}
      aria-labelledby={hid}
    >
      <h2
        id={hid}
        className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sbd-muted)]"
      >
        {title}
      </h2>
      {description != null ? (
        <div className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--sbd-muted)]">
          {description}
        </div>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProfileClient() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarId, setAvatarId] = useState<AvatarId>(normalizeAvatarId(null));
  const [nickname, setNickname] = useState("");
  const [bw, setBw] = useState("");
  const [sq, setSq] = useState("");
  const [bp, setBp] = useState("");
  const [dl, setDl] = useState("");
  const [sex, setSex] = useState<GlSex>("MALE");
  const [equipment, setEquipment] = useState<GlEquipment>("CLASSIC");
  const [login, setLogin] = useState("");
  const [loginEdit, setLoginEdit] = useState("");

  const [lbBy, setLbBy] = useState<"total" | "bench">("total");
  const [lbRows, setLbRows] = useState<LbRow[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const profileEditDetailsRef = useRef<HTMLDetailsElement>(null);

  const [profileLevel, setProfileLevel] = useState(1);
  const [glPointsState, setGlPointsState] = useState<number | null>(null);
  const [achCatalog, setAchCatalog] = useState<{ id: string; title: string; unlocked: boolean }[]>(
    [],
  );
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [pinSaving, setPinSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = (await res.json()) as { error?: string; profile?: ProfilePayload };
      if (!res.ok) {
        toastError(data.error ?? "Не вдалося завантажити профіль.");
        return;
      }
      const p = data.profile!;
      setLogin(p.login);
      setLoginEdit(p.login);
      setAvatarId(normalizeAvatarId(p.avatarId));
      setNickname(p.nickname ?? "");
      setBw(num(p.glBodyweightKg));
      setSq(num(p.glMaxSquatKg));
      setBp(num(p.glMaxBenchKg));
      setDl(num(p.glMaxDeadliftKg));
      if (p.glSex) setSex(p.glSex);
      if (p.glEquipment) setEquipment(p.glEquipment);
      setProfileLevel(typeof p.profileLevel === "number" ? p.profileLevel : 1);
      setGlPointsState(typeof p.glPoints === "number" ? p.glPoints : null);
      setAchCatalog(Array.isArray(p.achievementsCatalog) ? p.achievementsCatalog : []);
      setPinnedIds(Array.isArray(p.pinnedAchievementIds) ? p.pinnedAchievementIds : []);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const loadLb = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?by=${encodeURIComponent(lbBy)}`);
      const data = (await res.json()) as { error?: string; rows?: LbRow[] };
      if (!res.ok) {
        toastError(data.error ?? "Не вдалося завантажити рейтинг.");
        setLbRows([]);
        return;
      }
      setLbRows(data.rows ?? []);
    } finally {
      setLbLoading(false);
    }
  }, [lbBy, toastError]);

  useEffect(() => {
    void loadLb();
  }, [loadLb]);

  const gl = useMemo(() => {
    return ipfGlProfilePreview({
      bodyweightKg: parseOptFloat(bw),
      squatKg: parseOptFloat(sq),
      benchKg: parseOptFloat(bp),
      deadliftKg: parseOptFloat(dl),
      sex,
      equipment,
    });
  }, [bw, sq, bp, dl, sex, equipment]);

  const achTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of achCatalog) m.set(a.id, a.title);
    return m;
  }, [achCatalog]);

  async function save() {
    setSaving(true);
    try {
      const nick = nickname.trim();
      const body: Record<string, unknown> = {
        avatarId,
        nickname: nick === "" ? null : nick,
        glBodyweightKg: parseOptFloat(bw),
        glMaxSquatKg: parseOptFloat(sq),
        glMaxBenchKg: parseOptFloat(bp),
        glMaxDeadliftKg: parseOptFloat(dl),
        glSex: sex,
        glEquipment: equipment,
      };
      if (normalizeLogin(loginEdit) !== normalizeLogin(login)) {
        body.login = loginEdit;
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося зберегти.");
        return;
      }
      const prof = (data as { profile?: ProfilePayload }).profile;
      if (prof?.login) {
        setLogin(prof.login);
        setLoginEdit(prof.login);
        router.refresh();
      }
      if (prof) {
        setProfileLevel(typeof prof.profileLevel === "number" ? prof.profileLevel : 1);
        setGlPointsState(typeof prof.glPoints === "number" ? prof.glPoints : null);
        setAchCatalog(Array.isArray(prof.achievementsCatalog) ? prof.achievementsCatalog : []);
        setPinnedIds(Array.isArray(prof.pinnedAchievementIds) ? prof.pinnedAchievementIds : []);
      }
      toastSuccess("Профіль збережено.");
      const det = profileEditDetailsRef.current;
      if (det) det.open = false;
      await loadLb();
    } finally {
      setSaving(false);
    }
  }

  async function togglePinAchievement(id: string) {
    const row = achCatalog.find((a) => a.id === id);
    if (!row?.unlocked) return;
    setPinSaving(true);
    try {
      let next = [...pinnedIds];
      if (next.includes(id)) next = next.filter((x) => x !== id);
      else {
        if (next.length >= 3) {
          toastError("Можна закріпити не більше трьох досягнень.");
          return;
        }
        next.push(id);
      }
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinnedAchievementIds: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося зберегти закріплення.");
        return;
      }
      const prof = (data as { profile?: ProfilePayload }).profile;
      if (prof && Array.isArray(prof.pinnedAchievementIds)) setPinnedIds(prof.pinnedAchievementIds);
      toastSuccess("Закріплення оновлено.");
      await loadLb();
    } finally {
      setPinSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Завантаження профілю">
        <div className="h-10 w-2/3 max-w-md rounded-lg bg-zinc-800/60" />
        <div className="sbd-card h-32 rounded-2xl p-6" />
        <div className="sbd-card h-80 rounded-2xl p-6" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-6 md:space-y-12 md:pb-8">
      <header className="max-w-3xl space-y-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--sbd-text)] sm:text-3xl">
          Силові максимуми та GL
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
        <aside
          className="order-1 space-y-4 sm:space-y-5 lg:order-2 lg:col-span-5 lg:space-y-6"
          aria-label="Попередній перегляд GL"
        >
          <div className="sbd-card flex flex-col gap-4 rounded-2xl border border-[var(--sbd-border)] p-4 shadow-md shadow-black/10 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:flex-col lg:items-stretch">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative shrink-0 rounded-2xl border border-[var(--sbd-border)] bg-[var(--sbd-card)] p-2.5 shadow-sm ring-1 ring-[#e31e24]/12">
                <PresetAvatar avatarId={avatarId} size={104} className="ring-2 ring-[#e31e24]/20" />
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
                      Закріплення — у «Редагувати профіль» (до 3).
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[var(--sbd-muted)] lg:hidden">
              GL оновлюється після змін у відкритому блоці редагування.
            </p>
          </div>
          <div className="sbd-gl-preview relative overflow-hidden rounded-2xl border border-[#e31e24]/30 bg-gradient-to-b from-[#e31e24]/[0.14] via-zinc-950/80 to-black p-5 shadow-xl shadow-black/50 sm:p-8">
            <div
              className="sbd-gl-preview-deco pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#e31e24]/20 blur-3xl"
              aria-hidden
            />
            <div
              className="sbd-gl-preview-deco pointer-events-none absolute bottom-0 left-1/2 h-24 w-[120%] -translate-x-1/2 bg-gradient-to-t from-black/80 to-transparent"
              aria-hidden
            />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[#e31e24]/90">
              Попередній перегляд
            </p>
            {gl.kind === "total" || gl.kind === "bench" ? (
              <>
                <p className="sbd-gl-preview-muted relative mt-2 text-xs text-zinc-400">
                  {gl.kind === "total" ? "IPF GL · сума триборства" : "IPF GL · жим лежачи"}
                </p>
                <p className="sbd-gl-preview__value relative mt-3 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-5xl">
                  {gl.points}
                </p>
                <p className="sbd-gl-preview-muted relative mt-4 text-xs leading-relaxed text-zinc-500">
                  У рейтингу нижче — порівняння по офіційному GL: сума SBD або жим лежачи.
                </p>
              </>
            ) : (
              <p className="sbd-gl-preview-muted relative mt-4 text-sm leading-relaxed text-zinc-400">
                {gl.message}
              </p>
            )}
          </div>

          <div className="sbd-card rounded-2xl border border-[var(--sbd-border)] p-4 shadow-md sm:p-5">
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sbd-muted)]">
              Рівень профілю
            </p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[#e31e24]">
              {profileLevel}
            </p>
            <p className="mt-1 text-xs text-[var(--sbd-muted)]">
              {glPointsState != null && Number.isFinite(glPointsState) ? (
                <>
                  За GL-балом ({glPointsState.toFixed(3)} pts). Більший GL — вищий рівень.
                </>
              ) : (
                <>Заповни вагу й максимуми в профілі — з&apos;явиться GL і рівень зростатиме разом із балом.</>
              )}
            </p>
          </div>
        </aside>

        <div className="order-2 flex flex-col gap-6 sm:gap-8 lg:order-1 lg:col-span-7 lg:gap-8">
        <details
          ref={profileEditDetailsRef}
          id="profile-edit"
          className="profile-edit-details group sbd-card overflow-hidden rounded-2xl shadow-lg shadow-black/15 open:shadow-xl"
        >
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none sm:min-h-[56px] sm:px-6 sm:py-4 [&::-webkit-details-marker]:hidden">
            <span className="min-w-0 flex-1 text-left">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-[#e31e24]/90 sm:text-xs">
                Редагувати профіль
              </span>
            </span>
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center self-center text-[var(--sbd-muted)] transition group-open:rotate-180 sm:h-9 sm:w-9"
              aria-hidden
            >
              ▼
            </span>
          </summary>
          <div className="space-y-0 border-t border-[color:var(--sbd-border)] px-4 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
            <ProfileSection
              sectionId="profile-avatar"
              title="Аватар"
            >
              <div
                className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3"
                role="group"
                aria-label="Оберіть аватар"
              >
                {AVATAR_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={avatarPickBtn(avatarId === id)}
                    onClick={() => setAvatarId(id)}
                    aria-pressed={avatarId === id}
                    aria-label={AVATAR_LABELS[id]}
                  >
                    <PresetAvatar decorative avatarId={id} size={40} className="ring-0" />
                    <span className="line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-[var(--sbd-muted)]">
                      {AVATAR_LABELS[id]}
                    </span>
                  </button>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection
              sectionId="profile-nickname"
              title="Позивний"
              description={
                <>
                  Необов&apos;язково. У рейтингу поруч із логіном з&apos;явиться мітка{" "}
                  <span className="rounded border border-[#e31e24]/25 bg-[#e31e24]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#e31e24]">
                    позивний
                  </span>
                  , щоб не плутати з частиною нікнейму.
                </>
              }
              withDivider
            >
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
                htmlFor="nick"
              >
                Текст позивного
              </label>
              <input
                id="nick"
                className={field}
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 40))}
                placeholder="наприклад Залізний"
                autoComplete="nickname"
                maxLength={40}
                aria-describedby="nick-hint"
              />
              <p id="nick-hint" className="mt-2 text-xs text-[var(--sbd-muted)]">
                До 40 символів.
              </p>
            </ProfileSection>

            <ProfileSection
              sectionId="profile-athlete"
              title="Дані атлета"
              description="Вага для розрахунку GL та логін для входу й відображення в рейтингу."
              withDivider
            >
              <div className="grid gap-6">
                <div>
                  <label
                    className="mb-0 block text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
                    htmlFor="gl-bw"
                  >
                    Вага тіла (кг)
                  </label>
                  <input
                    id="gl-bw"
                    className={field}
                    inputMode="decimal"
                    value={bw}
                    onChange={(e) => setBw(e.target.value)}
                    placeholder="наприклад 82.5"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label
                    className="mb-0 block text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
                    htmlFor="profile-login"
                  >
                    Логін
                  </label>
                  <input
                    id="profile-login"
                    className={`${field} max-w-full sm:max-w-md`}
                    value={loginEdit}
                    onChange={(e) => setLoginEdit(e.target.value.slice(0, 40))}
                    autoComplete="username"
                    spellCheck={false}
                    aria-describedby="login-hint"
                  />
                  <p id="login-hint" className="mt-2 text-xs leading-relaxed text-[var(--sbd-muted)]">
                    Унікальний у сервісі (літери, цифри, _). Зайнятий логін не дасть зберегти
                    профіль.
                  </p>
                </div>
              </div>
            </ProfileSection>

            <ProfileSection
              sectionId="profile-maxes"
              title="Максимуми (кг)"
              description="SBD для GL триборства."
              withDivider
            >
              <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
                    htmlFor="gl-sq"
                  >
                    Присяд
                  </label>
                  <input
                    id="gl-sq"
                    className={field}
                    inputMode="decimal"
                    value={sq}
                    onChange={(e) => setSq(e.target.value)}
                    placeholder="—"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
                    htmlFor="gl-bp"
                  >
                    Жим
                  </label>
                  <input
                    id="gl-bp"
                    className={field}
                    inputMode="decimal"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="—"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
                    htmlFor="gl-dl"
                  >
                    Тяга
                  </label>
                  <input
                    id="gl-dl"
                    className={field}
                    inputMode="decimal"
                    value={dl}
                    onChange={(e) => setDl(e.target.value)}
                    placeholder="—"
                    autoComplete="off"
                  />
                </div>
              </div>
            </ProfileSection>

            <ProfileSection
              sectionId="profile-ipf"
              title="Критерії IPF GL"
              description="Підставляються у формулу Goodlift (2020) для попереднього перегляду та рейтингу."
              withDivider
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--sbd-text)]">Стать</p>
                  <div className="sbd-profile-seg inline-flex w-full rounded-xl p-1" role="group" aria-label="Стать">
                    <button
                      type="button"
                      className={segBtn}
                      data-active={sex === "MALE" ? "true" : "false"}
                      onClick={() => setSex("MALE")}
                    >
                      Чоловіки
                    </button>
                    <button
                      type="button"
                      className={segBtn}
                      data-active={sex === "FEMALE" ? "true" : "false"}
                      onClick={() => setSex("FEMALE")}
                    >
                      Жінки
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--sbd-text)]">Екіпіровка</p>
                  <div
                    className="sbd-profile-seg inline-flex w-full rounded-xl p-1"
                    role="group"
                    aria-label="Екіпіровка"
                  >
                    <button
                      type="button"
                      className={segBtn}
                      data-active={equipment === "CLASSIC" ? "true" : "false"}
                      onClick={() => setEquipment("CLASSIC")}
                    >
                      Класичний
                    </button>
                    <button
                      type="button"
                      className={segBtn}
                      data-active={equipment === "EQUIPPED" ? "true" : "false"}
                      onClick={() => setEquipment("EQUIPPED")}
                    >
                      Екіпірувальний
                    </button>
                  </div>
                </div>
              </div>
            </ProfileSection>

            <ProfileSection
              sectionId="profile-pins"
              title="Закріплені досягнення"
              description="До трьох розблокованих нагород — іконки в картці профілю зліва та в колонці «Досягнення» в рейтингу перед рівнем. Закріплення зберігаються одразу після натискання; аватар, максимуми й інше — кнопкою «Зберегти зміни» нижче."
              withDivider
            >
              <p className="mb-3 text-xs text-[var(--sbd-muted)]">
                Натисни нагороду, щоб закріпити або зняти (максимум 3).
              </p>
              <div className="grid max-h-[min(50vh,22rem)] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {achCatalog.map((a) => {
                  const pinned = pinnedIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      disabled={!a.unlocked || pinSaving}
                      onClick={() => void togglePinAchievement(a.id)}
                      className={`flex min-h-[52px] items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition ${
                        !a.unlocked
                          ? "cursor-not-allowed border-[var(--sbd-border)] bg-[var(--sbd-elevated)] opacity-45"
                          : pinned
                            ? "border-[#e31e24]/55 bg-[#e31e24]/12 ring-1 ring-[#e31e24]/25"
                            : "border-[var(--sbd-border)] bg-[var(--sbd-card)] hover:border-[#e31e24]/35"
                      }`}
                    >
                      <AchievementIcon achievementId={a.id} size={28} />
                      <span className="min-w-0 flex-1 leading-snug text-[var(--sbd-text)]">
                        {a.title}
                        {pinned ? (
                          <span className="mt-0.5 block text-[10px] font-bold uppercase text-[#e31e24]">
                            закріплено
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ProfileSection>

          <div className="mt-10 border-t border-[color:var(--sbd-border)] pt-8">
            <button
              type="button"
              disabled={saving}
              className="w-full min-h-[52px] rounded-xl bg-[#e31e24] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:min-h-[48px] sm:px-10"
              onClick={() => void save()}
            >
              {saving ? "Збереження…" : "Зберегти зміни"}
            </button>
            <p className="mt-3 text-xs text-[var(--sbd-muted)]">
              Після збереження блок редагування згорнеться й оновиться рейтинг.
            </p>
          </div>
        </div>
        </details>

      <section
        className="sbd-card overflow-hidden rounded-2xl shadow-lg shadow-black/15"
        aria-labelledby="profile-lb-heading"
      >
        <div className="sbd-lb-toolbar px-5 py-5 sm:px-7">
          <h2
            id="profile-lb-heading"
            className="font-display text-lg font-bold uppercase tracking-wide text-[var(--sbd-text)]"
          >
            Рейтинг
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--sbd-muted)]">
            Лише користувачі з достатніми даними для обраної метрики. За замовчуванням — офіційний
            GL за сумою SBD.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {(
              [
                ["total", "Сума SBD"],
                ["bench", "Жим"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${lbTab} w-full sm:w-auto`}
                data-active={lbBy === key ? "true" : "false"}
                onClick={() => setLbBy(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {lbLoading ? (
            <p className="text-sm text-[var(--sbd-muted)]">Завантаження…</p>
          ) : lbRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-4 py-10 text-center">
              <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--sbd-muted)]">
                Поки нікого з повними даними для цього режиму. Розкрий «Редагувати профіль», збережи
                дані — ти з&apos;явишся тут, коли їх буде достатньо.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-white/[0.06]">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="sbd-lb-thead">
                  <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 align-top font-semibold">#</th>
                    <th className="px-4 py-3 align-top font-semibold">Атлет</th>
                    <th
                      className="px-3 py-3 align-middle text-center font-semibold"
                      title="Закріплені досягнення"
                    >
                      Досягнення
                    </th>
                    <th
                      className="px-4 py-3 align-middle text-right font-semibold"
                      title="Рівень за GL-профілем"
                    >
                      Рівень
                    </th>
                    <th className="px-4 py-3 align-middle text-right font-semibold">GL</th>
                  </tr>
                </thead>
                <tbody className="sbd-lb-tbody divide-y divide-white/[0.05] text-zinc-200">
                  {lbRows.map((r) => (
                    <tr
                      key={`${r.place}-${r.login}`}
                      className={
                        r.login === login
                          ? "bg-[#e31e24]/[0.08]"
                          : "transition-colors hover:bg-white/[0.02]"
                      }
                    >
                      <td className="px-4 py-3 align-middle tabular-nums leading-snug text-[var(--sbd-muted)]">
                        {r.place}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          <span className="shrink-0 translate-y-px">
                            <PresetAvatar decorative avatarId={r.avatarId} size={40} />
                          </span>
                          <div className="min-w-0 flex-1 pt-px">
                            <div
                              className={`truncate text-[15px] font-medium leading-snug ${r.login === login ? "text-[#e31e24]" : "text-[var(--sbd-text)]"}`}
                            >
                              {r.login}
                            </div>
                            {r.nickname?.trim() ? (
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <span className="shrink-0 rounded border border-[#e31e24]/25 bg-[#e31e24]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e31e24]/90">
                                  позивний
                                </span>
                                <span className="truncate text-sm leading-snug text-zinc-300">
                                  {r.nickname.trim()}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle text-center">
                        {(r.pinnedAchievementIds ?? []).length > 0 ? (
                          <div
                            className="flex flex-wrap items-center justify-center gap-1"
                            aria-label="Закріплені досягнення"
                          >
                            {(r.pinnedAchievementIds ?? []).map((pid) => (
                              <span
                                key={pid}
                                className="inline-flex rounded-md border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] p-0.5"
                                title={achTitleById.get(pid) ?? pid}
                              >
                                <AchievementIcon achievementId={pid} size={20} />
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-middle text-right tabular-nums leading-snug text-[var(--sbd-text)]">
                        <span className="inline-flex min-h-[28px] items-center justify-end font-display font-semibold">
                          {r.profileLevel ?? 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right tabular-nums leading-snug text-[var(--sbd-text)]">
                        <span className="inline-flex min-h-[28px] items-center justify-end">
                          {r.score.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
