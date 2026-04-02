import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-start px-4 pt-10 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] sm:justify-center sm:py-16 sm:pb-16">
      <div className="animate-content-in relative z-10 w-full max-w-md shrink-0">
        <AuthForm />
      </div>
    </main>
  );
}
