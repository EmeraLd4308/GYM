"use client";

import type { ReactNode } from "react";
import { AVATAR_IDS, AVATAR_LABELS, type AvatarId, normalizeAvatarId } from "@/lib/avatars";

const stroke = "stroke-[#e31e24]";
const fillBg = "fill-zinc-900/90";
const fillSoft = "fill-zinc-800/80";

function glyphs(id: AvatarId): ReactNode {
  const c = `${stroke} fill-none stroke-[1.35] [stroke-linecap:round] [stroke-linejoin:round]`;
  switch (id) {
    case "barbell":
      return (
        <g className={c}>
          <line x1="4" y1="16" x2="28" y2="16" />
          <circle cx="7" cy="16" r="4.5" className={fillBg} />
          <circle cx="25" cy="16" r="4.5" className={fillBg} />
        </g>
      );
    case "plate":
      return (
        <g className={c}>
          <circle cx="16" cy="16" r="11" className={fillBg} />
          <circle cx="16" cy="16" r="3.5" />
        </g>
      );
    case "squat":
      return (
        <g className={c}>
          <path d="M10 8 L16 6 L22 8" />
          <path d="M16 10 L16 22 M12 14 L20 14 M10 24 L14 22 L18 22 L22 24" />
        </g>
      );
    case "bench":
      return (
        <g className={c}>
          <line x1="4" y1="22" x2="28" y2="22" />
          <path d="M8 22 L8 14 L24 14 L24 22" className={fillSoft} />
          <line x1="16" y1="14" x2="16" y2="8" />
        </g>
      );
    case "deadlift":
      return (
        <g className={c}>
          <line x1="5" y1="24" x2="27" y2="24" />
          <path d="M11 24 L13 10 L19 10 L21 24" className={fillBg} />
        </g>
      );
    case "kettlebell":
      return (
        <g className={c}>
          <path d="M12 10 C12 6 20 6 20 10 L20 12" />
          <path d="M10 12 C10 22 22 22 22 12 Z" className={fillBg} />
        </g>
      );
    case "dumbbell":
      return (
        <g className={c}>
          <line x1="6" y1="16" x2="26" y2="16" />
          <rect x="4" y="11" width="5" height="10" rx="1" className={fillBg} />
          <rect x="23" y="11" width="5" height="10" rx="1" className={fillBg} />
        </g>
      );
    case "chalk":
      return (
        <g className={c}>
          <path d="M8 20 Q10 8 16 10 Q22 12 24 6" />
          <path d="M10 22 Q14 18 20 20" opacity="0.7" />
        </g>
      );
    case "belt":
      return (
        <g className={c}>
          <path d="M6 18 L10 12 L22 12 L26 18 L22 22 L10 22 Z" className={fillBg} />
          <line x1="16" y1="12" x2="16" y2="22" />
        </g>
      );
    case "trophy":
      return (
        <g className={c}>
          <path d="M10 10 L22 10 L20 22 L12 22 Z" className={fillBg} />
          <path d="M8 10 L6 14 L10 14 M24 10 L26 14 L22 14" />
          <line x1="12" y1="22" x2="20" y2="22" />
        </g>
      );
    case "flame":
      return (
        <g className={c}>
          <path
            d="M16 6 Q22 14 18 22 Q16 26 14 22 Q10 16 16 6 M14 14 Q12 20 16 24 Q20 20 18 14"
            className={fillSoft}
          />
        </g>
      );
    case "bolt":
      return (
        <g className={c}>
          <path d="M18 4 L10 18 L15 18 L12 28 L22 12 L17 12 Z" className={fillBg} />
        </g>
      );
    case "medal":
      return (
        <g className={c}>
          <path d="M10 6 L14 14 L18 6" />
          <circle cx="16" cy="20" r="7" className={fillBg} />
          <path d="M13 20 L15.5 22.5 L20 17" />
        </g>
      );
    case "timer":
      return (
        <g className={c}>
          <circle cx="16" cy="17" r="9" className={fillBg} />
          <line x1="16" y1="17" x2="16" y2="11" />
          <line x1="16" y1="17" x2="21" y2="19" />
          <path d="M16 4 L16 6" />
        </g>
      );
    case "hex":
      return (
        <g className={c}>
          <path d="M16 4 L26 10 L26 22 L16 28 L6 22 L6 10 Z" className={fillBg} />
          <path d="M16 10 L16 22 M11 13 L21 19 M21 13 L11 19" opacity="0.5" />
        </g>
      );
  }
}

export function PresetAvatar({
  avatarId,
  size = 36,
  className = "",
  decorative = false,
}: {
  avatarId?: string | null;
  size?: number;
  className?: string;

  decorative?: boolean;
}) {
  const id = normalizeAvatarId(avatarId);
  const label = `Аватар: ${AVATAR_LABELS[id]}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`shrink-0 rounded-full bg-gradient-to-br from-zinc-900 to-black ring-1 ring-white/10 ${className ?? ""}`}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      {glyphs(id)}
    </svg>
  );
}

export function isValidAvatarId(id: string): id is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(id);
}
