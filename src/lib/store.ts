import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny persistent store backed by localStorage. Progress stays on this device only:
 * nothing is sent anywhere. Falls back to memory if storage is blocked.
 */
const PREFIX = "hj:";
const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();

function load<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value: T = fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    /* storage unavailable */
  }
  cache.set(key, value);
  return value;
}

function save<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStored<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(subscribe, () => load(key, fallback), () => fallback);
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const prev = load(key, fallback);
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      save(key, next);
    },
    // fallback is a stable literal at each call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );
  return [value, set];
}

export function resetAll() {
  const keys: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => window.localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
  cache.clear();
  listeners.forEach(l => l());
}

/** Shared keys */
export const K = {
  viewed: "viewed",
  ticks: "ticks",
  quiz: "quiz",
  bestTest: "bestTest",
  known: "known",
  letters: "letters"
} as const;

export type Ticks = Record<string, number[]>;
export type QuizScores = Record<string, { correct: number; total: number }>;
