import { STAGES, STAGE_ORDER } from "../data/stages";
import { CASES } from "../data/cases";
import { GLOSSARY } from "../data/glossary";
import { FLASHCARDS } from "../data/learning";

export interface SearchItem {
  type: "Stage" | "Case" | "Glossary" | "Interview question" | "Tool";
  title: string;
  text: string;
  href: string;
}

const TOOLS: SearchItem[] = [
  { type: "Tool", title: "Which duty applies?", text: "Step-by-step duty finder: prevention, relief, interim, main duty, intentionality, local connection", href: "/tools/duty-finder" },
  { type: "Tool", title: "Notice checker", text: "Section 8 Section 21 eviction notice valid threatened with homelessness 56 days Renters' Rights Act", href: "/tools/notice-checker" },
  { type: "Tool", title: "Affordability calculator", text: "income rent bills essentials residual LHA shortfall suitable", href: "/tools/affordability" },
  { type: "Tool", title: "Deadline calculator", text: "56 days review 21 days 8 weeks appeal B&B 6 weeks dates", href: "/tools/deadlines" }
];

export const INDEX: SearchItem[] = [
  ...STAGE_ORDER.map(id => {
    const s = STAGES[id];
    return {
      type: "Stage" as const,
      title: s.title,
      text: [s.sub, s.plain, ...s.officer, ...s.lawList.flat(), ...(s.ends ?? []), s.tip].join(" "),
      href: `/journey/${id}`
    };
  }),
  ...CASES.map(c => ({ type: "Case" as const, title: `Case: ${c.name}`, text: [c.blurb, ...c.steps.map(s => s[1]), c.lesson].join(" "), href: `/cases/${c.id}` })),
  ...GLOSSARY.map(([t, d]) => ({ type: "Glossary" as const, title: t, text: d, href: `/resources#glossary` })),
  ...FLASHCARDS.map(f => ({ type: "Interview question" as const, title: f.q, text: f.points.join(" "), href: `/learn/flashcards` })),
  ...TOOLS
];

export function search(query: string, limit = 40): SearchItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = INDEX.map(item => {
    const title = item.title.toLowerCase();
    const text = item.text.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 5;
      else if (text.includes(t)) score += 1;
      else return { item, score: -1 };
    }
    return { item, score };
  }).filter(r => r.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(r => r.item);
}

/** Short excerpt around the first matching term. */
export function excerpt(text: string, query: string, len = 160): string {
  const t = query.toLowerCase().split(/\s+/).find(Boolean) ?? "";
  const i = t ? text.toLowerCase().indexOf(t) : -1;
  const start = Math.max(0, i - 50);
  const s = text.slice(start, start + len);
  return (start > 0 ? "..." : "") + s + (start + len < text.length ? "..." : "");
}
