import { getSessionUser } from "@/shared/lib/auth";
import { ProfileClient } from "@/features/profile/components/ProfileClient";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ProfileClient />
    </div>
  );
}
