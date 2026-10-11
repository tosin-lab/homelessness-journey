import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny persistent store backed by localStorage. When someone is signed in, src/lib/sync.ts copies it
 * to their account so progress follows them across devices. Falls back to memory if storage is blocked.
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

export interface ProgressState {
  viewed: string[];
  ticks: Ticks;
  quiz: QuizScores;
  bestTest: number | null;
  known: number[];
  letters: string[];
}

export const EMPTY_PROGRESS: ProgressState = { viewed: [], ticks: {}, quiz: {}, bestTest: null, known: [], letters: [] };

export function exportState(): ProgressState {
  return {
    viewed: load(K.viewed, EMPTY_PROGRESS.viewed),
    ticks: load(K.ticks, EMPTY_PROGRESS.ticks),
    quiz: load(K.quiz, EMPTY_PROGRESS.quiz),
    bestTest: load(K.bestTest, EMPTY_PROGRESS.bestTest),
    known: load(K.known, EMPTY_PROGRESS.known),
    letters: load(K.letters, EMPTY_PROGRESS.letters)
  };
}

export function importState(s: ProgressState) {
  (Object.keys(EMPTY_PROGRESS) as (keyof ProgressState)[]).forEach(k => {
    cache.set(k, s[k]);
    try {
      window.localStorage.setItem(PREFIX + k, JSON.stringify(s[k]));
    } catch {
      /* storage unavailable */
    }
  });
  listeners.forEach(l => l());
}

/** Run a callback whenever progress changes. Returns an unsubscribe function. */
export function onChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
