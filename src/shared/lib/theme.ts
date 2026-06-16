export const THEME_STORAGE_KEY = "sbd-theme";

export type ThemePreference = "dark" | "light" | "system";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export type ThemeResolved = "dark" | "light";

export function resolveTheme(preference: ThemePreference | null): ThemeResolved {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function readStoredPreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return null;
}

export function applyThemeToDocument(resolved: ThemeResolved): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolved;
}

export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var p=localStorage.getItem(k);var mq=function(){return window.matchMedia("(prefers-color-scheme: light)").matches;};var r=mq()?"light":"dark";if(p==="light")r="light";else if(p==="dark")r="dark";else if(p==="system")r=mq()?"light":"dark";document.documentElement.dataset.theme=r;}catch(e){try{document.documentElement.dataset.theme=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}catch(e2){document.documentElement.dataset.theme="dark";}}})();`;
