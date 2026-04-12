"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME_PREFERENCE,
  THEME_STORAGE_KEY,
  applyThemeToDocument,
  readStoredPreference,
  resolveTheme,
  type ThemePreference,
  type ThemeResolved,
} from "@/lib/theme";

type Ctx = {
  preference: ThemePreference;
  resolved: ThemeResolved;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function syncMetaThemeColor(resolved: ThemeResolved) {
  const content = resolved === "light" ? "#f4f4f5" : "#050505";
  let el = document.querySelector('meta[name="theme-color"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "theme-color");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_THEME_PREFERENCE);
  const didSyncFromStorage = useRef(false);

  const resolved = useMemo(() => resolveTheme(preference), [preference]);

  useLayoutEffect(() => {
    if (!didSyncFromStorage.current) {
      didSyncFromStorage.current = true;
      const stored = readStoredPreference() ?? DEFAULT_THEME_PREFERENCE;
      setPreferenceState(stored);
      const r = resolveTheme(stored);
      applyThemeToDocument(r);
      syncMetaThemeColor(r);
      return;
    }
    const r = resolveTheme(preference);
    applyThemeToDocument(r);
    syncMetaThemeColor(r);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      applyThemeToDocument(resolveTheme("system"));
      syncMetaThemeColor(resolveTheme("system"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      const next = readStoredPreference() ?? DEFAULT_THEME_PREFERENCE;
      setPreferenceState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, p);
    } catch {}
    const r = resolveTheme(p);
    applyThemeToDocument(r);
    syncMetaThemeColor(r);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}
