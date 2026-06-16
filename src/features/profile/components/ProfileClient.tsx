"use client";

import { ProfileEditForm } from "@/features/profile/components/ProfileEditForm";
import { ProfileLeaderboard } from "@/features/profile/components/ProfileLeaderboard";
import { ProfilePreviewAside } from "@/features/profile/components/ProfilePreviewAside";
import { useProfile } from "@/features/profile/lib/use-profile";

export function ProfileClient() {
  const profile = useProfile();

  if (profile.loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Завантаження профілю">
        <div className="h-10 w-2/3 max-w-md rounded-lg bg-[color-mix(in_oklab,var(--sbd-card)_60%,transparent)]" />
        <div className="sbd-card h-32 rounded-2xl p-6" />
        <div className="sbd-card h-80 rounded-2xl p-6" />
      </div>
    );
  }

  return (
    <div className="sbd-stagger-children space-y-10 pb-6 md:space-y-12 md:pb-8">
      <header className="max-w-3xl space-y-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--sbd-text)] sm:text-3xl">
          Силові максимуми та GL
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
        <ProfilePreviewAside {...profile} />

        <div className="order-2 flex flex-col gap-6 sm:gap-8 lg:order-1 lg:col-span-7 lg:gap-8">
          <ProfileEditForm {...profile} />
          <ProfileLeaderboard
            login={profile.login}
            achCatalog={profile.achCatalog}
            refreshToken={profile.lbRefreshToken}
          />
        </div>
      </div>
    </div>
  );
}
