"use client";

import { useEffect } from "react";

const STYLE_ID = "hide-next-dev-logo-mobile";
/** Як Tailwind `max-md`: ширина менше 768px. */
const MOBILE_MQ = "(max-width: 767px)";

const css = `
button#next-logo,
button[data-nextjs-dev-tools-button] {
  display: none !important;
}
`;

function setLightDomLogo(hide: boolean) {
  const btn = document.getElementById("next-logo");
  if (!btn) return;
  (btn as HTMLElement).style.display = hide ? "none" : "";
}

function installInShadow(shadowRoot: ShadowRoot, hide: boolean) {
  let el = shadowRoot.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (hide) {
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      el.textContent = css;
      shadowRoot.appendChild(el);
    }
  } else if (el) {
    el.remove();
  }
}

function scanPortals(hide: boolean) {
  document.querySelectorAll("nextjs-portal").forEach((host) => {
    const sr = (host as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
    if (sr) installInShadow(sr, hide);
  });
}

/**
 * Приховує індикатор Next.js Dev Tools (літера «N») на вузьких екранах.
 * Лише development; у production нічого не робить.
 */
export function MobileHideNextDevLogo() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const mq = window.matchMedia(MOBILE_MQ);

    const apply = () => {
      const hide = mq.matches;
      setLightDomLogo(hide);
      scanPortals(hide);
    };

    apply();
    mq.addEventListener("change", apply);
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      mq.removeEventListener("change", apply);
      mo.disconnect();
      setLightDomLogo(false);
      scanPortals(false);
    };
  }, []);

  return null;
}
