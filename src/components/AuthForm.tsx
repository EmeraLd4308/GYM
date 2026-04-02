"use client";

import { useEffect, useRef, useState } from "react";
import { persistSessionCookie } from "@/lib/session-client";

function redirectAfterAuth() {
  window.location.assign("/dashboard");
}

export function AuthForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [hasText, setHasText] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function readHasText(): boolean {
    const v = inputRef.current?.value?.trim() ?? "";
    return v.length > 0;
  }

  function syncHasTextFromDom() {
    setHasText(readHasText());
  }

  useEffect(() => {
    if (!focused) return;
    const id = window.setInterval(() => {
      const next = readHasText();
      setHasText((prev) => (prev !== next ? next : prev));
    }, 100);
    return () => window.clearInterval(id);
  }, [focused]);

  function getLoginTrimmed(): string {
    return inputRef.current?.value?.trim() ?? "";
  }

  function applySession(data: { token?: string }) {
    if (data.token) persistSessionCookie(data.token);
  }

  async function register() {
    setError(null);
    setSuggestions([]);
    syncHasTextFromDom();
    const value = getLoginTrimmed();
    if (!value) {
      setError("Введіть логін.");
      return;
    }
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ login: value }),
        });
      } catch {
        setError(
          "Немає зв'язку з сервером. Запусти: npm run dev (слухає 0.0.0.0) і відкрий той самий IP:3000, що в адресному рядку.",
        );
        return;
      }
      let data: { error?: string; suggestions?: string[]; token?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError("Некоректна відповідь сервера.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Помилка.");
        if (Array.isArray(data.suggestions)) setSuggestions(data.suggestions);
        return;
      }
      applySession(data);
      redirectAfterAuth();
    } finally {
      setLoading(false);
    }
  }

  async function loginUser() {
    setError(null);
    setSuggestions([]);
    syncHasTextFromDom();
    const value = getLoginTrimmed();
    if (!value) {
      setError("Введіть логін.");
      return;
    }
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ login: value }),
        });
      } catch {
        setError(
          "Немає зв'язку з сервером. Запусти: npm run dev (слухає 0.0.0.0) і відкрий той самий IP:3000, що в адресному рядку.",
        );
        return;
      }
      let data: { error?: string; token?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError("Некоректна відповідь сервера.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Помилка.");
        return;
      }
      applySession(data);
      redirectAfterAuth();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="w-full max-w-md space-y-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0c] p-5 shadow-2xl shadow-black/60 sm:space-y-8 sm:p-8"
      onPointerDownCapture={() => syncHasTextFromDom()}
      onSubmit={(e) => {
        e.preventDefault();
        void loginUser();
      }}
      noValidate
    >
      <div className="space-y-2 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-[#e31e24]">
          Squat · Bench · Deadlift
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
          Облік тренувань
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500">
          Логін без пароля — для себе та залу. Обери ім&apos;я й заходь.
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="login">
          Логін
        </label>
        <input
          ref={inputRef}
          id="login"
          name="login"
          enterKeyHint="go"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          defaultValue=""
          className="min-h-[48px] w-full rounded-md border border-white/10 bg-black/50 px-4 py-3 text-base text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/20"
          onInput={(e) => setHasText(e.currentTarget.value.trim().length > 0)}
          onPaste={() => window.requestAnimationFrame(syncHasTextFromDom)}
          onFocus={() => {
            setFocused(true);
            window.requestAnimationFrame(syncHasTextFromDom);
          }}
          onBlur={() => {
            setFocused(false);
            syncHasTextFromDom();
          }}
          placeholder="наприклад, vadym"
          autoComplete="username"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {suggestions.length > 0 && (
        <div className="text-sm text-zinc-400">
          <p className="mb-2 text-xs uppercase tracking-wider text-zinc-500">Вільні варіанти</p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="min-h-[44px] touch-manipulation rounded-md border border-[#e31e24]/30 bg-[#e31e24]/10 px-3 py-2 text-sm font-medium text-[#ff6b6b] active:bg-[#e31e24]/25"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.value = s;
                      setHasText(true);
                    }
                    setError(null);
                    setSuggestions([]);
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={loading}
          className={`min-h-[48px] flex-1 touch-manipulation rounded-md bg-[#e31e24] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition hover:bg-[#c41a21] active:bg-[#a0151a] disabled:cursor-wait disabled:opacity-50 ${!hasText && !loading ? "opacity-55" : ""}`}
          onClick={() => void register()}
        >
          Реєстрація
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`min-h-[48px] flex-1 touch-manipulation rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-zinc-200 transition hover:bg-white/10 active:bg-white/15 disabled:cursor-wait disabled:opacity-50 ${!hasText && !loading ? "opacity-55" : ""}`}
        >
          Увійти
        </button>
      </div>
    </form>
  );
}
