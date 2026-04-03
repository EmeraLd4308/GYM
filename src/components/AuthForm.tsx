"use client";

import { useToast } from "@/components/ToastProvider";

/**
 * POST на login-form / register-form. Валідація в клієнті + тости (без нативних підказок браузера).
 */
export function AuthForm() {
  const { error } = useToast();

  return (
    <form
      className="w-full max-w-md space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 shadow-2xl shadow-black/60 sm:space-y-8 sm:p-8"
      method="post"
      noValidate
      onSubmit={(e) => {
        const form = e.currentTarget;
        const login = String(new FormData(form).get("login") ?? "").trim();
        const ne = e.nativeEvent as SubmitEvent;
        const submitter = ne.submitter as HTMLButtonElement | null;
        const action = submitter?.getAttribute("formaction") ?? "";
        const isRegister = action.includes("register-form");

        if (!login) {
          e.preventDefault();
          error("Введіть логін.");
          return;
        }
        if (login.length > 40) {
          e.preventDefault();
          error("Логін занадто довгий (максимум 40 символів).");
          return;
        }
        if (isRegister && login.length < 2) {
          e.preventDefault();
          error("Логін занадто короткий (мінімум 2 символи для реєстрації).");
          return;
        }
      }}
    >
      <div className="space-y-2 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-[#e31e24]">
          Присід · Жим · Тяга
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
          Облік тренувань
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500">
          Логін без пароля. Обери ім&apos;я та увійди або зареєструйся.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="login">
          Логін
        </label>
        <input
          id="login"
          name="login"
          type="text"
          maxLength={40}
          enterKeyHint="go"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="min-h-[48px] w-full rounded-md border border-white/10 bg-black/50 px-4 py-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/20"
          placeholder="наприклад, anatolich"
          autoComplete="username"
        />
      </div>
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          formAction="/api/auth/register-form"
          formMethod="post"
          className="min-h-[48px] flex-1 touch-manipulation rounded-md bg-[#e31e24] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition active:bg-[#a0151a]"
        >
          Реєстрація
        </button>
        <button
          type="submit"
          formAction="/api/auth/login-form"
          formMethod="post"
          className="min-h-[48px] flex-1 touch-manipulation rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-zinc-200 transition active:bg-white/15"
        >
          Увійти
        </button>
      </div>
    </form>
  );
}
