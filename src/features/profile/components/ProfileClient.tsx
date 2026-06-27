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
        <div className="sbd-card h-32 rounded-2xl p-6" />
        <div className="sbd-card h-80 rounded-2xl p-6" />
      </div>
    );
  }

  return (
    <div className="sbd-stagger-children space-y-8 pb-6 md:space-y-10 md:pb-8">
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
