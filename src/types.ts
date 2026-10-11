export type RoleId =
  | "frontdoor"
  | "caseworker"
  | "ta"
  | "prs"
  | "allocations"
  | "senior"
  | "reviewer"
  | "legal"
  | "partners";

export type StageType = "entry" | "duty" | "emerg" | "dec" | "out" | "side" | "rev";

export type StageId =
  | "approach"
  | "triage"
  | "advice"
  | "interim"
  | "assess"
  | "prevention"
  | "relief"
  | "success"
  | "decision"
  | "intentional"
  | "mainduty"
  | "notowed"
  | "endmain"
  | "settled"
  | "review"
  | "appeal";

export interface Stage {
  id: StageId;
  row: number;
  col: number;
  type: StageType;
  tag: string;
  title: string;
  sub: string;
  law: string;
  reviewable?: boolean;
  outcome?: boolean;
  plain: string;
  officer: string[];
  roles: RoleId[];
  lawList: [string, string][];
  times: string[];
  ends?: string[];
  next: [StageId, string][];
  tip: string;
}

export interface Edge {
  from: StageId;
  fromSide: string;
  to: StageId;
  toSide: string;
  label?: string;
  kind?: "emerg" | "rev" | "alt" | "soft" | "emerg-soft";
  k?: number;
}

export interface CaseStudy {
  id: string;
  name: string;
  colour: string;
  blurb: string;
  steps: [StageId, string][];
  lesson: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface Flashcard {
  q: string;
  points: string[];
}
