"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  commitRestDurationFromMinutesField,
  formatMinutesForInput,
  formatRestTimerMmSs,
  formatRestTimerPresetLabel,
  isRestTimerPreset,
  parseMinutesInput,
  readStoredRestDurationSec,
  REST_TIMER_PRESETS,
} from "@/shared/lib/rest-timer-duration";
import { playRestTimerDoneSound, playRestTimerStopSound } from "@/shared/lib/rest-timer-sound";
import {
  uiBtnRowClass,
  uiButtonDangerTextClass,
  uiButtonGhostClass,
  uiButtonPrimarySmClass,
  uiFieldFitClass,
  uiFormRowClass,
  uiInputNumClass,
  uiLabelClass,
  uiPresetGridClass,
} from "@/shared/ui/styles";

const STORAGE_SEC = "sbd-rest-duration-sec";
const STORAGE_AUTO = "sbd-rest-auto-start";

function initialActivePreset(sec: number): number | null {
  return isRestTimerPreset(sec) ? sec : null;
}

function sanitizeMinutesInput(raw: string): string {
  let out = "";
  let dot = false;
  for (const ch of raw.replace(",", ".")) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === "." && !dot) {
      dot = true;
      out += ch;
    }
  }
  return out;
}

type Props = {
  onRegisterStart?: (start: () => void) => void;
};

export function WorkoutRestTimer({ onRegisterStart }: Props) {
  const initialSec = readStoredRestDurationSec();
  const [durationSec, setDurationSec] = useState(initialSec);
  const [customMin, setCustomMin] = useState(() => formatMinutesForInput(initialSec));
  const [activePreset, setActivePreset] = useState<number | null>(() => initialActivePreset(initialSec));
  const [autoStart, setAutoStart] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_AUTO) === "1",
  );
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const customMinRef = useRef(customMin);
  customMinRef.current = customMin;

  const displaySec = running && remaining != null ? remaining : durationSec;

  const previewSec = useMemo(
    () => commitRestDurationFromMinutesField(customMin, durationSec),
    [customMin, durationSec],
  );

  const persistDuration = useCallback((sec: number) => {
    setDurationSec(sec);
    setCustomMin(formatMinutesForInput(sec));
    localStorage.setItem(STORAGE_SEC, String(sec));
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const completeTimer = useCallback(() => {
    clearTick();
    setRunning(false);
    setRemaining(null);
    playRestTimerDoneSound();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([120, 80, 120]);
    }
  }, [clearTick]);

  const stopTimer = useCallback(() => {
    clearTick();
    setRunning(false);
    setRemaining(null);
    playRestTimerStopSound();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(40);
    }
  }, [clearTick]);

  const resolveDurationSec = useCallback((): number => {
    const sec = commitRestDurationFromMinutesField(customMinRef.current, durationSec);
    persistDuration(sec);
    setActivePreset(isRestTimerPreset(sec) ? sec : null);
    return sec;
  }, [durationSec, persistDuration]);

  const startTimer = useCallback(
    (sec?: number) => {
      const total = sec ?? resolveDurationSec();
      clearTick();
      setRemaining(total);
      setRunning(true);
      tickRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev == null || prev <= 1) {
            completeTimer();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTick, completeTimer, resolveDurationSec],
  );

  const selectPreset = useCallback(
    (sec: number) => {
      if (activePreset === sec) {
        setActivePreset(null);
        return;
      }
      setActivePreset(sec);
      persistDuration(sec);
    },
    [activePreset, persistDuration],
  );

  const handleCustomChange = useCallback((raw: string) => {
    const value = sanitizeMinutesInput(raw);
    setCustomMin(value);
    setActivePreset(null);
    const parsed = parseMinutesInput(value);
    if (parsed != null) {
      setDurationSec(commitRestDurationFromMinutesField(value, durationSec));
    }
  }, [durationSec]);

  const handleCustomBlur = useCallback(() => {
    const sec = commitRestDurationFromMinutesField(customMin, durationSec);
    persistDuration(sec);
    setActivePreset(isRestTimerPreset(sec) ? sec : null);
  }, [customMin, durationSec, persistDuration]);

  useEffect(() => {
    onRegisterStart?.(() => startTimer());
  }, [onRegisterStart, startTimer]);

  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  const shownSec = running ? displaySec : previewSec;

  return (
    <div className="sbd-card rounded-xl border border-[var(--sbd-border)] p-4 sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className={`${uiLabelClass} shrink-0`}>Таймер відпочинку</p>
        <p
          className={`shrink-0 font-display font-bold tabular-nums ${
            running ? "text-3xl text-[var(--sbd-red)] sm:text-4xl" : "text-2xl text-[var(--sbd-text)] sm:text-3xl"
          }`}
        >
          {formatRestTimerMmSs(shownSec)}
        </p>
      </div>

      <div className={`mt-3 ${uiPresetGridClass}`}>
        {REST_TIMER_PRESETS.map((sec) => (
          <button
            key={sec}
            type="button"
            aria-pressed={activePreset === sec}
            className={`${uiButtonGhostClass} min-h-10 px-3 text-xs ${activePreset === sec ? "ring-1 ring-[var(--sbd-red)]/40" : ""}`}
            onClick={() => selectPreset(sec)}
          >
            {formatRestTimerPresetLabel(sec)}
          </button>
        ))}
      </div>

      <div className={`mt-3 ${uiFormRowClass}`}>
        <label className={uiFieldFitClass}>
          <span className={`${uiLabelClass} mb-1 block`}>Свій час (хв)</span>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={`${uiInputNumClass} w-full sm:max-w-[9rem] ${activePreset === null ? "ring-1 ring-[var(--sbd-red)]/25" : ""}`}
            value={customMin}
            onChange={(e) => handleCustomChange(e.target.value)}
            onBlur={handleCustomBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                startTimer();
              }
            }}
          />
        </label>
        <div className={`${uiBtnRowClass} self-end`}>
          {!running ? (
            <button type="button" className={uiButtonPrimarySmClass} onClick={() => startTimer()}>
              Старт
            </button>
          ) : (
            <>
              <button
                type="button"
                className={`${uiButtonDangerTextClass} min-h-11 px-4`}
                onClick={stopTimer}
              >
                Стоп
              </button>
              <button type="button" className={`${uiButtonGhostClass} min-h-11 px-4 text-xs`} onClick={() => startTimer()}>
                Знову
              </button>
            </>
          )}
        </div>
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[var(--sbd-muted)]">
        <input
          type="checkbox"
          checked={autoStart}
          onChange={(e) => {
            setAutoStart(e.target.checked);
            localStorage.setItem(STORAGE_AUTO, e.target.checked ? "1" : "0");
          }}
          className="h-4 w-4 accent-[var(--sbd-red)]"
        />
        Автостарт після «Зроблено»
      </label>
    </div>
  );
}

export function shouldAutoStartRestTimer(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_AUTO) === "1";
}
