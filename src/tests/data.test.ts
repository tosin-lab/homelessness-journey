import { describe, expect, it } from "vitest";
import { EDGES, PRESENT_ORDER, STAGES, STAGE_ORDER } from "../data/stages";
import { CASES } from "../data/cases";
import { DUTY_TREE } from "../data/dutyTree";
import { ALL_QUESTIONS, FLASHCARDS } from "../data/learning";

describe("content integrity", () => {
  it("lists every stage exactly once", () => {
    expect(new Set(STAGE_ORDER).size).toBe(Object.keys(STAGES).length);
    expect(new Set(PRESENT_ORDER).size).toBe(Object.keys(STAGES).length);
  });

  it("only links to stages that exist", () => {
    for (const e of EDGES) {
      expect(STAGES[e.from], e.from).toBeDefined();
      expect(STAGES[e.to], e.to).toBeDefined();
    }
    for (const s of Object.values(STAGES)) for (const [to] of s.next) expect(STAGES[to], `${s.id} -> ${to}`).toBeDefined();
    for (const c of CASES) for (const [id] of c.steps) expect(STAGES[id], `${c.id}: ${id}`).toBeDefined();
  });

  it("has a duty finder where every answer leads somewhere", () => {
    for (const n of Object.values(DUTY_TREE)) {
      if (n.kind === "q") for (const o of n.options) expect(DUTY_TREE[o.next], `${n.id} -> ${o.next}`).toBeDefined();
      else {
        expect(STAGES[n.stage]).toBeDefined();
        if (n.cont) expect(DUTY_TREE[n.cont.next]).toBeDefined();
      }
    }
  });

  it("has quiz answers that point at real options", () => {
    for (const q of ALL_QUESTIONS) {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    }
    expect(ALL_QUESTIONS.length).toBeGreaterThanOrEqual(15);
    expect(FLASHCARDS.length).toBeGreaterThan(5);
  });

  it("uses no em-dashes in content", () => {
    const text = JSON.stringify({ STAGES, CASES, DUTY_TREE, ALL_QUESTIONS, FLASHCARDS });
    expect(text.includes("—")).toBe(false);
  });
});
