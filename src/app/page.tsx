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
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:py-16 sm:pb-16">
      <Suspense fallback={null}>
        <LoginToast />
      </Suspense>
      <div className="animate-content-in relative z-10 w-full max-w-md shrink-0">
        <AuthForm />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] mx-auto w-full max-w-md px-4 sm:bottom-6">
        <AppCredit />
      </div>
    </main>
  );
}
