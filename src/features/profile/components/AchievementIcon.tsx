"use client";

import { useId } from "react";

function SuperTotalIcon({ s, className, uid }: { s: number; className: string; uid: string }) {
  const g = `${uid}-tri`;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${g}-lg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="50%" stopColor="#e31e24" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#${g}-lg)`} opacity="0.32" />
      <path
        d="M12 3 L20 8.5 V15.5 L12 21 L4 15.5 V8.5 Z"
        fill="none"
        stroke="#e31e24"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="1.6" fill="#fca5a5" />
      <circle cx="8.2" cy="14.5" r="1.6" fill="#fca5a5" />
      <circle cx="15.8" cy="14.5" r="1.6" fill="#fca5a5" />
      <path d="M12 11.5 V14" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

function SuperLiftIcon({ s, className }: { s: number; className: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      <path
        d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.5-6.3 4.5 2.3-7-6-4.6h7.6z"
        className="fill-[#e31e24]/25"
        stroke="#e31e24"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BenchMilestoneIcon({
  tier,
  s,
  className,
  uid,
}: {
  tier: number;
  s: number;
  className: string;
  uid: string;
}) {
  const glow = tier >= 2;
  const plates = tier >= 1;
  const extraPlates = tier >= 3;
  const crown = tier >= 4;
  const barW = 7 + tier * 0.8;
  const x1 = 12 - barW;
  const x2 = 12 + barW;
  const fid = `${uid}-b${tier}`;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      {glow ? (
        <defs>
          <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={tier >= 4 ? 1.4 : 0.8} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      ) : null}
      <line
        x1={x1}
        y1="16"
        x2={x2}
        y2="16"
        stroke={tier >= 4 ? "#fecaca" : "#e31e24"}
        strokeWidth={1.2 + tier * 0.15}
        strokeLinecap="round"
        filter={glow ? `url(#${fid})` : undefined}
      />
      {plates ? (
        <>
          <rect x={x1 - 2.5} y="12.5" width="3" height="7" rx="0.6" fill={tier >= 3 ? "#b91c1c" : "#71717a"} />
          <rect x={x2 - 0.5} y="12.5" width="3" height="7" rx="0.6" fill={tier >= 3 ? "#b91c1c" : "#71717a"} />
        </>
      ) : (
        <>
          <rect x={x1 + 1} y="13.5" width="2" height="5" rx="0.4" fill="#52525b" />
          <rect x={x2 - 3} y="13.5" width="2" height="5" rx="0.4" fill="#52525b" />
        </>
      )}
      {extraPlates ? (
        <>
          <rect x={x1 - 4.5} y="13" width="1.8" height="6" rx="0.4" fill="#991b1b" opacity="0.9" />
          <rect x={x2 - 1.3} y="13" width="1.8" height="6" rx="0.4" fill="#991b1b" opacity="0.9" />
        </>
      ) : null}
      <rect x="9" y="11.5" width="6" height="5" rx="1" fill={tier >= 2 ? "#3f3f46" : "#52525b"} stroke="#a1a1aa" strokeWidth="0.4" />
      <line x1="12" y1="11.5" x2="12" y2="7.5" stroke="#e31e24" strokeWidth={1 + tier * 0.1} strokeLinecap="round" />
      {crown ? (
        <path
          d="M9 6 L10.5 8 L12 5.5 L13.5 8 L15 6 L15 7.2 H9 Z"
          fill="#fde047"
          stroke="#ca8a04"
          strokeWidth="0.35"
        />
      ) : null}
    </svg>
  );
}

function SquatMilestoneIcon({ tier, s, className }: { tier: number; s: number; className: string }) {
  const barY = 7.2 - tier * 0.35;
  const hipY = 15.5 + tier * 0.4;
  const stance = 2.2 + tier * 0.35;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      <line x1="3" y1={barY} x2="21" y2={barY} stroke={tier >= 2 ? "#fecaca" : "#e31e24"} strokeWidth={1.1 + tier * 0.2} strokeLinecap="round" />
      {tier >= 1 ? (
        <>
          <rect x="2" y={barY - 2} width="2.5" height="4" rx="0.4" fill="#71717a" />
          <rect x="19.5" y={barY - 2} width="2.5" height="4" rx="0.4" fill="#71717a" />
        </>
      ) : null}
      {tier >= 2 ? (
        <>
          <rect x="0.5" y={barY - 2.5} width="1.8" height="5" rx="0.3" fill="#991b1b" />
          <rect x="21.7" y={barY - 2.5} width="1.8" height="5" rx="0.3" fill="#991b1b" />
        </>
      ) : null}
      <line x1="12" y1={barY + 1} x2="12" y2={hipY - 2} stroke="#d4d4d8" strokeWidth="1.35" strokeLinecap="round" />
      <line x1="12" y1={hipY - 2} x2={12 - stance} y2={hipY} stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1={hipY - 2} x2={12 + stance} y2={hipY} stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx={12 - stance} cy={hipY} r="1.9" fill={tier >= 1 ? "#52525b" : "#71717a"} />
      <circle cx={12 + stance} cy={hipY} r="1.9" fill={tier >= 1 ? "#52525b" : "#71717a"} />
      {tier >= 2 ? <ellipse cx="12" cy={hipY + 2} rx="5" ry="1.3" fill="#e31e24" opacity="0.12" /> : null}
    </svg>
  );
}

function DeadliftMilestoneIcon({ tier, s, className }: { tier: number; s: number; className: string }) {
  const barY = 16.5 - Math.min(tier, 2) * 0.7;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      <line x1="2.5" y1={barY} x2="21.5" y2={barY} stroke={tier >= 2 ? "#fecaca" : "#e31e24"} strokeWidth={1.2 + tier * 0.15} strokeLinecap="round" />
      {tier >= 1 ? (
        <>
          <rect x="1.5" y={barY - 2.5} width="3" height="5" rx="0.5" fill="#71717a" />
          <rect x="19.5" y={barY - 2.5} width="3" height="5" rx="0.5" fill="#71717a" />
        </>
      ) : null}
      {tier >= 2 ? (
        <>
          <rect x="0" y={barY - 3} width="2.2" height="6.5" rx="0.4" fill="#991b1b" />
          <rect x="21.8" y={barY - 3} width="2.2" height="6.5" rx="0.4" fill="#991b1b" />
        </>
      ) : null}
      <path
        d={`M11.2 ${barY - 1.5} V${9 + tier * 0.4} H12.8 V${barY - 1.5}`}
        fill="none"
        stroke="#d4d4d8"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {tier >= 2 ? (
        <path d="M10.5 8.5 L12 6.5 L13.5 8.5" fill="none" stroke="#fde047" strokeWidth="0.85" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

export function AchievementIcon({
  achievementId,
  size = 20,
  className = "",
}: {
  achievementId: string;
  size?: number;
  className?: string;
}) {
  const s = size;
  const uid = useId().replace(/:/g, "");

  if (achievementId === "super_total") {
    return <SuperTotalIcon s={s} className={className} uid={uid} />;
  }
  if (
    achievementId === "super_bench" ||
    achievementId === "super_squat" ||
    achievementId === "super_deadlift"
  ) {
    return <SuperLiftIcon s={s} className={className} />;
  }

  const liftBw = achievementId.match(/^(squat|bench|deadlift)_bw_x(\d+)$/);
  const totalBw = achievementId.match(/^total_bw_x(\d+)$/);
  if (liftBw || totalBw) {
    const label =
      liftBw != null
        ? liftBw[1] === "squat"
          ? "S"
          : liftBw[1] === "bench"
            ? "B"
            : "D"
        : "Σ";
    const mult = liftBw != null ? liftBw[2] : totalBw![1];
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
        <circle cx="12" cy="12" r="9" fill="#27272a" stroke="#a1a1aa" strokeWidth="1" />
        <text
          x="12"
          y="11"
          textAnchor="middle"
          fill="#a1a1aa"
          fontSize="7"
          fontWeight="700"
          fontFamily="system-ui,sans-serif"
        >
          {label}
        </text>
        <text
          x="12"
          y="18"
          textAnchor="middle"
          fill="#e31e24"
          fontSize="9"
          fontWeight="700"
          fontFamily="system-ui,sans-serif"
        >
          {mult}×
        </text>
      </svg>
    );
  }

  const benchM = achievementId.match(/^bench_m(\d)$/);
  if (benchM) {
    const tier = Math.min(4, Math.max(0, parseInt(benchM[1], 10) || 0));
    return <BenchMilestoneIcon tier={tier} s={s} className={className} uid={uid} />;
  }
  const sqM = achievementId.match(/^sq_m(\d)$/);
  if (sqM) {
    const tier = Math.min(2, Math.max(0, parseInt(sqM[1], 10) || 0));
    return <SquatMilestoneIcon tier={tier} s={s} className={className} />;
  }
  const dlM = achievementId.match(/^dl_m(\d)$/);
  if (dlM) {
    const tier = Math.min(2, Math.max(0, parseInt(dlM[1], 10) || 0));
    return <DeadliftMilestoneIcon tier={tier} s={s} className={className} />;
  }

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" className={`shrink-0 ${className}`} aria-hidden>
      <circle cx="12" cy="12" r="8" className="fill-zinc-700" stroke="#e31e24" strokeWidth="1" />
    </svg>
  );
}
