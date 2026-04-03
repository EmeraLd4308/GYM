"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

/**
 * Вхід: мінімум тексту, великі зони натискання — перші секунди зрозуміло, що робити.
 */
export function AuthForm() {
  const { error } = useToast();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="w-full max-w-md space-y-5 rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 shadow-2xl shadow-black/60 sm:space-y-6 sm:p-8"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const ne = e.nativeEvent as SubmitEvent;
        const submitter = ne.submitter as HTMLButtonElement | null;
        const mode = submitter?.dataset.action ?? "register";
        const isRegister = mode === "register";

        const login = String(new FormData(form).get("login") ?? "").trim();
        if (!login) {
          error("Введіть нік.");
          return;
        }
        if (login.length > 40) {
          error("Занадто довгий нік (макс. 40).");
          return;
        }
        if (isRegister && login.length < 2) {
          error("Для реєстрації — мінімум 2 символи.");
          return;
        }

        const endpoint = isRegister ? "/api/auth/register-form" : "/api/auth/login-form";
        setPending(true);
        try {
          const fd = new FormData(form);
          const res = await fetch(endpoint, {
            method: "POST",
            body: fd,
            credentials: "include",
            redirect: "follow",
          });

          const finalUrl = new URL(res.url, window.location.origin);
          if (finalUrl.pathname === "/dashboard" || finalUrl.pathname.startsWith("/dashboard/")) {
            window.location.assign(res.url);
            return;
          }
          if (finalUrl.pathname === "/" && finalUrl.searchParams.has("err")) {
            window.location.assign(res.url);
            return;
          }

          if (!res.ok) {
            error("Сервер недоступний. Спробуй пізніше.");
            return;
          }

          error("Щось пішло не так. Спробуй ще раз.");
        } catch {
          error("Немає мережі.");
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="space-y-3 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">Журнал SBD</h1>
        <p className="text-sm leading-snug text-zinc-400">
          Без пароля. Введи нік — далі «Реєстрація» (вперше) або «Увійти».
        </p>
      </div>
      <div className="space-y-2">
        <label className="sr-only" htmlFor="login">
          Твій нік
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
          className="min-h-[52px] w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/50 focus:ring-2 focus:ring-[#e31e24]/20"
          placeholder="Як тебе звати в апі"
          autoComplete="username"
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          data-action="register"
          disabled={pending}
          className="min-h-[52px] w-full touch-manipulation rounded-xl bg-[#e31e24] px-4 py-3 text-base font-bold text-white shadow-lg shadow-red-950/40 transition enabled:active:bg-[#a0151a] disabled:opacity-50"
        >
          Реєстрація — вперше
        </button>
        <button
          type="submit"
          data-action="login"
          disabled={pending}
          className="min-h-[52px] w-full touch-manipulation rounded-xl border border-white/20 bg-transparent px-4 py-3 text-base font-semibold text-zinc-200 transition enabled:active:bg-white/10 disabled:opacity-50"
        >
          Увійти
        </button>
      </div>
    </form>
  );
}
