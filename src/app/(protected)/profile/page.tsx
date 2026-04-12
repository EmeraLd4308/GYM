import { getSessionUser } from "@/lib/auth";
import { ProfileClient } from "@/components/ProfileClient";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ProfileClient />
    </div>
  );
}
