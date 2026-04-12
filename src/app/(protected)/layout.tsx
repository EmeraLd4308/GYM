import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Nav } from "@/components/Nav";
import { PageToolbar } from "@/components/PageToolbar";
import { ContentFade } from "@/components/ContentFade";
import { AchievementAnnounceClient } from "@/components/AchievementAnnounceClient";
import { AppCredit } from "@/components/AppCredit";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav login={user.login} avatarId={user.avatarId} nickname={user.nickname} />
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-6 md:max-w-6xl md:px-6 md:pb-8 md:pt-8 xl:px-8">
        <AchievementAnnounceClient />
        <PageToolbar />
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <ContentFade>{children}</ContentFade>
          </div>
          <footer className="shrink-0 pt-10">
            <AppCredit />
          </footer>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
