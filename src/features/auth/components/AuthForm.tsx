"use client";

import { useState } from "react";
import { useToast } from "@/shared/shell/ToastProvider";
import {
  uiButtonBlockClass,
  uiButtonPrimaryClass,
  uiFieldErrorClass,
  uiInputLgClass,
} from "@/shared/ui/styles";

export function AuthForm() {
  const { error } = useToast();
  const [pending, setPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  return (
    <form
      className="sbd-auth-card sbd-surface-shine w-full max-w-md space-y-5 rounded-2xl p-5 sm:space-y-6 sm:p-8"
      noValidate
      aria-busy={pending}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setLoginError(null);
        setSubmitError(null);

        const login = String(new FormData(form).get("login") ?? "").trim();
        if (!login) {
          const message = "Введіть нік.";
          setLoginError(message);
          error(message);
          return;
        }
        if (login.length > 40) {
          const message = "Занадто довгий нік (макс. 40).";
          setLoginError(message);
          error(message);
          return;
        }

        setPending(true);
        try {
          const fd = new FormData(form);
          const res = await fetch("/api/auth/enter-form", {
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
            const message = "Сервер недоступний. Спробуй пізніше.";
            setSubmitError(message);
            error(message);
            return;
          }

          const message = "Щось пішло не так. Спробуй ще раз.";
          setSubmitError(message);
          error(message);
        } catch {
          const message = "Немає мережі.";
          setSubmitError(message);
          error(message);
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="space-y-3 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--sbd-text)] sm:text-3xl">
          Тренування SBD
        </h1>
        <p className="text-sm text-[var(--sbd-muted)]">Новий акаунт створиться автоматично.</p>
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
          className={uiInputLgClass}
          placeholder="Твій нік"
          autoComplete="username"
          disabled={pending}
          aria-invalid={loginError ? "true" : "false"}
          aria-describedby={loginError ? "login-error" : undefined}
          onChange={() => {
            if (loginError) setLoginError(null);
            if (submitError) setSubmitError(null);
          }}
        />
        {loginError ? (
          <p id="login-error" className={uiFieldErrorClass} role="alert">
            {loginError}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3" aria-live="polite">
        {submitError ? (
          <p className={uiFieldErrorClass} role="alert">
            {submitError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className={`${uiButtonPrimaryClass} ${uiButtonBlockClass} min-h-[52px] rounded-xl py-3 text-base active:opacity-[0.92]`}
        >
          {pending ? "Зачекай…" : "Увійти"}
        </button>
      </div>
    </form>
  );
}
