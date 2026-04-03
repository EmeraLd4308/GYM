"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "default" | "error" | "success";

type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastApi = {
  toast: (message: string, variant?: ToastVariant) => void;
  error: (message: string) => void;
  success: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DISMISS_MS = 4800;

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "default") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => remove(id), DISMISS_MS);
      timers.current.set(id, timer);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      error: (m: string) => toast(m, "error"),
      success: (m: string) => toast(m, "success"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[200] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-slide-in pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 text-sm shadow-2xl shadow-black/60 ${
              t.variant === "error"
                ? "border-red-500/40 bg-[#140808] text-red-100"
                : t.variant === "success"
                  ? "border-emerald-500/35 bg-[#08140c] text-emerald-100"
                  : "border-white/[0.12] bg-[#111] text-zinc-100"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
