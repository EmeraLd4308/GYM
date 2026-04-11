"use client";

import type { GlEquipment, GlSex } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { normalizeLogin } from "@/lib/login-normalize";
import { PresetAvatar } from "@/components/PresetAvatar";
import { AVATAR_IDS, AVATAR_LABELS, type AvatarId, normalizeAvatarId } from "@/lib/avatars";
import { ipfGlProfilePreview } from "@/lib/ipf-gl";

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
};

type LbRow = {
  place: number;
  login: string;
  avatarId: string;
  nickname: string | null;
  score: number;
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
  "mt-1.5 w-full rounded-lg border border-white/[0.08] bg-black/50 px-3 py-2.5 text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/45 focus:ring-2 focus:ring-[#e31e24]/12";

const segWrap = "inline-flex w-full rounded-xl bg-zinc-950/90 p-1 ring-1 ring-white/[0.07]";
const segBtn =
  "min-h-[44px] flex-1 touch-manipulation rounded-lg px-3 text-xs font-semibold uppercase tracking-wide transition sm:text-sm";
const segActive = "bg-[#e31e24]/25 text-white shadow-md shadow-black/40 ring-1 ring-[#e31e24]/35";
const segIdle = "text-zinc-500 hover:text-zinc-300";

const lbBtn =
  "min-h-[40px] touch-manipulation rounded-lg border px-3 text-xs font-semibold uppercase tracking-wide transition sm:text-sm";

const avatarPickBtn = (active: boolean) =>
  `relative flex touch-manipulation flex-col items-center gap-1.5 rounded-xl border p-2.5 transition ${
    active
      ? "border-[#e31e24]/55 bg-[#e31e24]/12 shadow-[0_0_24px_-8px_rgba(227,30,36,0.35)] ring-1 ring-[#e31e24]/25"
      : "border-white/[0.07] bg-black/30 hover:border-white/15 hover:bg-white/[0.03]"
  }`;

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

  const [lbBy, setLbBy] = useState<"total" | "bench" | "squat" | "deadlift">("total");
  const [lbRows, setLbRows] = useState<LbRow[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

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
      toastSuccess("Профіль збережено.");
      await loadLb();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-2/3 max-w-md rounded-xl bg-zinc-800/80" />
        <div className="h-40 rounded-2xl bg-zinc-900/60 ring-1 ring-white/[0.06]" />
        <div className="h-72 rounded-2xl bg-zinc-900/40 ring-1 ring-white/[0.05]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Силові максимуми та GL
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Обери аватар, за бажанням додай позивний для рейтингу, потім вагу тіла й максимуми SBD —
          для IPF Goodlift (2020). GL триборства з&apos;явиться, коли заповнені всі три рухи; інакше
          — офіційний GL жиму, якщо є жим.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <section className="sbd-card space-y-8 rounded-2xl p-5 shadow-lg shadow-black/20 sm:p-7 lg:col-span-7">
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-zinc-400">
              Аватар
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              15 заготовок у стилі залу — натисни, щоб обрати.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
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
                  <span className="line-clamp-1 w-full text-center text-[10px] font-medium text-zinc-500">
                    {AVATAR_LABELS[id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-zinc-400">
              Позивний
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
              Необов&apos;язково. У рейтингу поруч із логіном з&apos;явиться мітка{" "}
              <span className="rounded border border-[#e31e24]/25 bg-[#e31e24]/10 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#e31e24]/90">
                позивний
              </span>
              , щоб не плутати з частиною нікнейму.
            </p>
            <label
              className="mt-3 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
            />
          </div>

          <div className="border-t border-white/[0.06] pt-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-zinc-400">
              Дані атлета
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
              <div className="sm:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-x-8">
                  <label
                    className="shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500 sm:pt-2.5"
                    htmlFor="profile-login"
                  >
                    Логін
                  </label>
                  <input
                    id="profile-login"
                    className={`${field} min-w-0 flex-1 sm:max-w-md`}
                    value={loginEdit}
                    onChange={(e) => setLoginEdit(e.target.value.slice(0, 40))}
                    autoComplete="username"
                    spellCheck={false}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Унікальний у сервісі (літери, цифри, _). Якщо обрати вже зайнятий логін —
                  збереження не пройде.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-zinc-400">
              Максимуми (кг)
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Порожні поля можна залишити — рейтинг «по жиму» тоді використає лише жим.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
          </div>

          <div className="space-y-5 border-t border-white/[0.06] pt-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-zinc-400">
              Критерії IPF GL
            </h2>
            <div className="space-y-2">
              <p className="text-xs text-zinc-600">Стать</p>
              <div className={segWrap}>
                <button
                  type="button"
                  className={`${segBtn} ${sex === "MALE" ? segActive : segIdle}`}
                  onClick={() => setSex("MALE")}
                >
                  Чоловіки
                </button>
                <button
                  type="button"
                  className={`${segBtn} ${sex === "FEMALE" ? segActive : segIdle}`}
                  onClick={() => setSex("FEMALE")}
                >
                  Жінки
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-zinc-600">Екіпіровка</p>
              <div className={segWrap}>
                <button
                  type="button"
                  className={`${segBtn} ${equipment === "CLASSIC" ? segActive : segIdle}`}
                  onClick={() => setEquipment("CLASSIC")}
                >
                  Класичний
                </button>
                <button
                  type="button"
                  className={`${segBtn} ${equipment === "EQUIPPED" ? segActive : segIdle}`}
                  onClick={() => setEquipment("EQUIPPED")}
                >
                  Екіпірувальний
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            className="w-full min-h-[48px] rounded-xl bg-[#e31e24] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 transition hover:bg-[#c41a21] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:px-8"
            onClick={() => void save()}
          >
            {saving ? "Збереження…" : "Зберегти зміни"}
          </button>
        </section>

        <aside className="space-y-4 lg:col-span-5">
          <div className="flex justify-center lg:justify-start">
            <div className="relative rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-3 ring-1 ring-[#e31e24]/15">
              <PresetAvatar avatarId={avatarId} size={112} className="ring-2 ring-[#e31e24]/20" />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[#e31e24]/30 bg-gradient-to-b from-[#e31e24]/[0.14] via-zinc-950/80 to-black p-6 shadow-xl shadow-black/50 sm:p-8">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#e31e24]/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[120%] -translate-x-1/2 bg-gradient-to-t from-black/80 to-transparent"
              aria-hidden
            />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[#e31e24]/90">
              Попередній перегляд
            </p>
            {gl.kind === "total" || gl.kind === "bench" ? (
              <>
                <p className="relative mt-2 text-xs text-zinc-400">
                  {gl.kind === "total" ? "IPF GL · сума триборства" : "IPF GL · жим лежачи"}
                </p>
                <p className="relative mt-3 font-display text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                  {gl.points}
                </p>
                <p className="relative mt-4 text-xs leading-relaxed text-zinc-500">
                  У рейтингу нижче — порівняння по сумі SBD, жиму, присяду чи тязі. Для присяду та
                  тяги в рейтингу використовується наближена оцінка з коефіцієнтами триборства.
                </p>
              </>
            ) : (
              <p className="relative mt-4 text-sm leading-relaxed text-zinc-400">{gl.message}</p>
            )}
          </div>
        </aside>
      </div>

      <section className="sbd-card overflow-hidden rounded-2xl shadow-lg shadow-black/25">
        <div className="border-b border-white/[0.06] bg-zinc-950/40 px-5 py-5 sm:px-7">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            Рейтинг
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Лише користувачі з достатніми даними для обраної метрики. За замовчуванням — офіційний
            GL за сумою SBD.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["total", "Сума SBD"],
                ["bench", "Жим"],
                ["squat", "Присяд"],
                ["deadlift", "Тяга"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${lbBtn} ${
                  lbBy === key
                    ? "border-[#e31e24]/50 bg-[#e31e24]/20 text-white shadow-md shadow-black/30"
                    : "border-white/[0.08] bg-black/35 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                }`}
                onClick={() => setLbBy(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-5 sm:px-7 sm:py-6">
          {lbLoading ? (
            <p className="text-sm text-zinc-500">Завантаження…</p>
          ) : lbRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-black/25 px-4 py-8 text-center">
              <p className="text-sm text-zinc-500">
                Поки нікого з повними даними для цього режиму. Збережи профіль вище — ти
                з&apos;явишся тут, коли даних буде достатньо.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-white/[0.06]">
              <table className="w-full min-w-[300px] text-sm">
                <thead>
                  <tr className="bg-zinc-950/70 text-left text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Атлет</th>
                    <th className="px-4 py-3 text-right font-semibold">GL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-zinc-200">
                  {lbRows.map((r) => (
                    <tr
                      key={`${r.place}-${r.login}`}
                      className={
                        r.login === login
                          ? "bg-[#e31e24]/[0.08]"
                          : "transition-colors hover:bg-white/[0.02]"
                      }
                    >
                      <td className="px-4 py-3 align-middle tabular-nums text-zinc-500">
                        {r.place}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-start gap-3">
                          <PresetAvatar decorative avatarId={r.avatarId} size={40} />
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate font-medium ${r.login === login ? "text-[#e31e24]" : "text-zinc-100"}`}
                            >
                              {r.login}
                            </div>
                            {r.nickname?.trim() ? (
                              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <span className="shrink-0 rounded border border-[#e31e24]/25 bg-[#e31e24]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#e31e24]/90">
                                  позивний
                                </span>
                                <span className="truncate text-sm text-zinc-300">
                                  {r.nickname.trim()}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-right tabular-nums text-zinc-100">
                        {r.score.toFixed(3)}
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
  );
}
