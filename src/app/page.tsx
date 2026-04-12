import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { AppCredit } from "@/components/AppCredit";
import { AuthForm } from "@/components/AuthForm";
import { LoginToast } from "@/components/LoginToast";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-start px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:justify-center sm:py-16 sm:pb-16">
      <Suspense fallback={null}>
        <LoginToast />
      </Suspense>
      <div className="animate-content-in relative z-10 w-full max-w-md shrink-0">
        <AuthForm />
      </div>
      <div className="mt-auto w-full max-w-md shrink-0 pt-8">
        <AppCredit />
      </div>
    </main>
  );
}
