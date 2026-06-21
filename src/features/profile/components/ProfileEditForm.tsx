import { AVATAR_IDS, AVATAR_LABELS } from "@/features/profile/lib/avatars";
import { PresetAvatar } from "@/features/profile/components/PresetAvatar";
import { AchievementIcon } from "@/features/profile/components/AchievementIcon";
import { ProfileSection } from "@/features/profile/components/ProfileSection";
import type { ProfileController } from "@/features/profile/lib/use-profile";
import {
  profileAvatarPickBtnClass,
  profileFieldClass,
  profileNumFieldClass,
  profilePinBtnClass,
  profileSegBtnClass,
} from "@/features/profile/lib/profile-styles";
import { uiBtnRowMobileStackClass, uiButtonPrimaryLgClass } from "@/shared/ui/styles";

type Props = ProfileController;

export function ProfileEditForm({
  profileEditDetailsRef,
  avatarId,
  setAvatarId,
  nickname,
  setNickname,
  bw,
  setBw,
  loginEdit,
  setLoginEdit,
  sq,
  setSq,
  bp,
  setBp,
  dl,
  setDl,
  sex,
  setSex,
  equipment,
  setEquipment,
  achCatalog,
  pinnedIds,
  pinSaving,
  togglePinAchievement,
  saving,
  save,
}: Props) {
  return (
    <details
      ref={profileEditDetailsRef}
      id="profile-edit"
      className="profile-edit-details group sbd-card overflow-hidden rounded-2xl shadow-lg shadow-black/15 open:shadow-xl"
    >
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-4 py-3 marker:content-none sm:min-h-[56px] sm:px-6 sm:py-4 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 text-left">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.15em] text-[color-mix(in_oklab,var(--sbd-red),transparent_10%)] sm:text-xs">
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
        <ProfileSection sectionId="profile-avatar" title="Аватар">
          <div
            className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3"
            role="group"
            aria-label="Оберіть аватар"
          >
            {AVATAR_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={profileAvatarPickBtnClass(avatarId === id)}
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

        <ProfileSection sectionId="profile-nickname" title="Позивний" withDivider>
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
            htmlFor="nick"
          >
            Текст позивного
          </label>
          <input
            id="nick"
            className={profileFieldClass}
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 40))}
            placeholder="наприклад Залізний"
            autoComplete="nickname"
            maxLength={40}
          />
        </ProfileSection>

        <ProfileSection sectionId="profile-athlete" title="Дані атлета" withDivider>
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
                className={profileNumFieldClass}
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
                className={profileFieldClass}
                value={loginEdit}
                onChange={(e) => setLoginEdit(e.target.value.slice(0, 40))}
                autoComplete="username"
                spellCheck={false}
              />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection sectionId="profile-maxes" title="Максимуми (кг)" withDivider>
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
                className={profileNumFieldClass}
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
                className={profileNumFieldClass}
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
                className={profileNumFieldClass}
                inputMode="decimal"
                value={dl}
                onChange={(e) => setDl(e.target.value)}
                placeholder="—"
                autoComplete="off"
              />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection sectionId="profile-ipf" title="Критерії IPF GL" withDivider>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--sbd-text)]">Стать</p>
              <div className="sbd-profile-seg flex w-full rounded-xl p-1" role="group" aria-label="Стать">
                <button
                  type="button"
                  className={profileSegBtnClass}
                  data-active={sex === "MALE" ? "true" : "false"}
                  onClick={() => setSex("MALE")}
                >
                  Чоловіки
                </button>
                <button
                  type="button"
                  className={profileSegBtnClass}
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
                className="sbd-profile-seg flex w-full rounded-xl p-1"
                role="group"
                aria-label="Екіпіровка"
              >
                <button
                  type="button"
                  className={profileSegBtnClass}
                  data-active={equipment === "CLASSIC" ? "true" : "false"}
                  onClick={() => setEquipment("CLASSIC")}
                >
                  Класичний
                </button>
                <button
                  type="button"
                  className={profileSegBtnClass}
                  data-active={equipment === "EQUIPPED" ? "true" : "false"}
                  onClick={() => setEquipment("EQUIPPED")}
                >
                  Екіпірувальний
                </button>
              </div>
            </div>
          </div>
        </ProfileSection>

        <ProfileSection sectionId="profile-pins" title="Закріплені досягнення" withDivider>
          <p className="mb-3 text-xs text-[var(--sbd-muted)]">До 3 нагород.</p>
          <div className="grid max-h-[min(50vh,22rem)] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {achCatalog.map((a) => {
              const pinned = pinnedIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  disabled={!a.unlocked || pinSaving}
                  onClick={() => void togglePinAchievement(a.id)}
                  className={`flex min-h-[52px] items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs transition ${profilePinBtnClass(a.unlocked, pinned)}`}
                >
                  <AchievementIcon achievementId={a.id} size={28} />
                  <span className="min-w-0 flex-1 leading-snug text-[var(--sbd-text)]">
                    {a.title}
                    {pinned ? (
                      <span className="mt-0.5 block text-[10px] font-bold uppercase text-[var(--sbd-red)]">
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
          <div className={uiBtnRowMobileStackClass}>
            <button
              type="button"
              disabled={saving}
              className={uiButtonPrimaryLgClass}
              onClick={() => void save()}
            >
              {saving ? "Збереження…" : "Зберегти зміни"}
            </button>
          </div>
        </div>
      </div>
    </details>
  );
}
