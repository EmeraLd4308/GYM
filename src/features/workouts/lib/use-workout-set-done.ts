"use client";

import { useCallback, useEffect, useState } from "react";

const TTL_MS = 48 * 60 * 60 * 1000;

type Entry = { done: boolean; at: number };

function storageKey(workoutId: string) {
  return `gym_set_done_v1:${workoutId}`;
}

function loadPruneSave(workoutId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(workoutId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Entry>;
    const now = Date.now();
    const next: Record<string, Entry> = {};
    const boolMap: Record<string, boolean> = {};
    for (const [id, v] of Object.entries(parsed)) {
      if (!v || typeof v.at !== "number") continue;
      if (now - v.at < TTL_MS) {
        next[id] = v;
        if (v.done) boolMap[id] = true;
      }
    }
    localStorage.setItem(storageKey(workoutId), JSON.stringify(next));
    return boolMap;
  } catch {
    return {};
  }
}

function persist(workoutId: string, setId: string, done: boolean) {
  try {
    const key = storageKey(workoutId);
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Entry>) : {};
    const now = Date.now();
    if (done) parsed[setId] = { done: true, at: now };
    else delete parsed[setId];
    const pruned: Record<string, Entry> = {};
    for (const [id, v] of Object.entries(parsed)) {
      if (now - v.at < TTL_MS) pruned[id] = v;
    }
    localStorage.setItem(key, JSON.stringify(pruned));
  } catch {
    /* ignore quota / private mode */
  }
}

export function useWorkoutSetDone(workoutId: string) {
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDoneMap(loadPruneSave(workoutId));
  }, [workoutId]);

  const isSetDone = useCallback(
    (setId: string) => doneMap[setId] === true,
    [doneMap],
  );

  const setSetDone = useCallback(
    (setId: string, done: boolean) => {
      setDoneMap((prev) => {
        const next = { ...prev };
        if (done) next[setId] = true;
        else delete next[setId];
        return next;
      });
      persist(workoutId, setId, done);
    },
    [workoutId],
  );

  return { isSetDone, setSetDone };
}
