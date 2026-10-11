import { EMPTY_PROGRESS, type ProgressState } from "./store";

const union = <T,>(a: T[] = [], b: T[] = []) => [...new Set([...a, ...b])];

/** Combine progress from this device with progress saved to the account, keeping the best of both. */
export function mergeProgress(a: Partial<ProgressState> | undefined, b: Partial<ProgressState> | undefined): ProgressState {
  const x = { ...EMPTY_PROGRESS, ...(a ?? {}) };
  const y = { ...EMPTY_PROGRESS, ...(b ?? {}) };

  const ticks: ProgressState["ticks"] = {};
  for (const k of new Set([...Object.keys(x.ticks), ...Object.keys(y.ticks)])) ticks[k] = union(x.ticks[k], y.ticks[k]);

  const quiz: ProgressState["quiz"] = {};
  for (const k of new Set([...Object.keys(x.quiz), ...Object.keys(y.quiz)])) {
    const p = x.quiz[k];
    const q = y.quiz[k];
    quiz[k] = !p ? q : !q ? p : q.correct > p.correct ? q : p;
  }

  const best = [x.bestTest, y.bestTest].filter((n): n is number => typeof n === "number");

  return {
    viewed: union(x.viewed, y.viewed),
    ticks,
    quiz,
    bestTest: best.length ? Math.max(...best) : null,
    known: union(x.known, y.known),
    letters: union(x.letters, y.letters)
  };
}
