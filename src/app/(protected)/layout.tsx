import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { PageToolbar } from "@/components/PageToolbar";
import { ContentFade } from "@/components/ContentFade";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav login={user.login} />
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-8">
        <PageToolbar />
        <ContentFade>{children}</ContentFade>
      </div>
    </div>
  );
}
