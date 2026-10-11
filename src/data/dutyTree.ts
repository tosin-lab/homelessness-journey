import type { StageId } from "../types";

export interface DQuestion {
  kind: "q";
  id: string;
  text: string;
  help?: string;
  options: { label: string; next: string; note?: string }[];
}

export interface DResult {
  kind: "r";
  id: string;
  tone: "good" | "warn" | "info";
  title: string;
  summary: string;
  sections: string[];
  actions: string[];
  stage: StageId;
  cont?: { label: string; next: string };
}

export type DNode = DQuestion | DResult;

const nodes: DNode[] = [
  {
    kind: "q", id: "start",
    text: "Is there reason to believe the person may be homeless, or may become homeless within 56 days?",
    help: "This is a low bar. You don't need proof at this point.",
    options: [{ label: "Yes", next: "elig" }, { label: "No", next: "r_advice" }]
  },
  {
    kind: "q", id: "elig",
    text: "Are they eligible for help? (Mainly their immigration status)",
    help: "British and Irish citizens, people with indefinite leave or settled status, refugees and most people with recourse to public funds are usually eligible.",
    options: [
      { label: "Yes", next: "home" },
      { label: "No", next: "r_noteligible" },
      { label: "Not sure yet", next: "home", note: "Eligibility is still being checked: keep making inquiries (s.184)." }
    ]
  },
  {
    kind: "q", id: "home",
    text: "Do they have somewhere they can reasonably stay tonight?",
    help: "It must be reasonable to stay there. Somewhere they face violence, or can't get into, doesn't count.",
    options: [{ label: "Yes", next: "threat" }, { label: "No", next: "pn" }]
  },
  {
    kind: "q", id: "threat",
    text: "Are they likely to lose that home within 56 days, or do they have a valid notice ending within 56 days?",
    help: "Use the Notice checker if they have an eviction notice.",
    options: [{ label: "Yes", next: "r_prevention" }, { label: "No", next: "r_advice56" }]
  },
  {
    kind: "q", id: "pn",
    text: "Is there reason to believe they may be in priority need?",
    help: "For example: children or pregnancy, homeless because of domestic abuse, aged 16 or 17, a care leaver aged 18 to 20, or vulnerable (health, age, prison, armed forces).",
    options: [{ label: "Yes", next: "r_relief_interim" }, { label: "No", next: "r_relief" }]
  },
  {
    kind: "q", id: "md_pn",
    text: "After your inquiries, do they have priority need?",
    help: "Use the evidence you've gathered. Vulnerability is judged with the Hotak test.",
    options: [{ label: "Yes", next: "md_int" }, { label: "No", next: "r_nopn" }]
  },
  {
    kind: "q", id: "md_int",
    text: "Did they become homeless intentionally?",
    help: "A deliberate act or omission that caused them to lose a home it was reasonable to keep. The council must prove it. Genuine hardship is not intentional.",
    options: [{ label: "Yes", next: "r_intentional" }, { label: "No", next: "md_lc" }]
  },
  {
    kind: "q", id: "md_lc",
    text: "What is their local connection?",
    options: [
      { label: "They have a connection to this area", next: "r_main" },
      { label: "No connection here, but one elsewhere with no risk of violence there", next: "r_referral" },
      { label: "No connection anywhere", next: "r_main" },
      { label: "Connection elsewhere, but they'd be at risk of violence there", next: "r_main" }
    ]
  },
  {
    kind: "r", id: "r_advice", tone: "info", title: "Advice and information",
    summary: "No homelessness duty yet, but everyone is entitled to free advice.",
    sections: ["s.179"], stage: "advice",
    actions: ["Give clear advice on their housing options, in writing", "Signpost to debt, benefits or tenancy advice", "Tell them to come back straight away if things change"]
  },
  {
    kind: "r", id: "r_advice56", tone: "info", title: "Not threatened yet: advice now",
    summary: "They're not likely to lose their home within 56 days, so no prevention duty yet.",
    sections: ["s.179", "s.175"], stage: "advice",
    actions: ["Give advice now and note any key dates", "If they have a notice, prevention should start once it's within 56 days of ending", "Encourage them to come back early, not on the last day"]
  },
  {
    kind: "r", id: "r_noteligible", tone: "warn", title: "Not eligible: no homelessness duty",
    summary: "The council can't provide homelessness help, but other services may.",
    sections: ["s.185", "s.184", "s.202"], stage: "advice",
    actions: ["Send a written decision with reasons and review rights", "Children in the household? Refer to children's services", "Care needs? Refer to adult social care", "Signpost to immigration advice"]
  },
  {
    kind: "r", id: "r_prevention", tone: "good", title: "Prevention duty",
    summary: "They're threatened with homelessness. Help them keep their home or find another.",
    sections: ["s.195", "s.189A"], stage: "prevention",
    actions: ["Complete the assessment and agree a PHP", "Negotiate with the landlord or family", "Help with arrears: DHP, prevention fund, budgeting", "Search for alternatives and check affordability and suitability", "Up to 56 days (longer if still threatened by a valid notice)"]
  },
  {
    kind: "r", id: "r_relief_interim", tone: "warn", title: "Relief duty + interim accommodation",
    summary: "They're homeless and may be in priority need. Accommodate today while you make inquiries.",
    sections: ["s.188", "s.189B", "s.189A"], stage: "interim",
    actions: ["Arrange suitable interim accommodation today", "Complete the assessment and agree a PHP", "Help them secure a home for at least 6 months (56 days)", "Keep gathering evidence for the main duty decision"],
    cont: { label: "56 days have passed and they're still homeless", next: "md_pn" }
  },
  {
    kind: "r", id: "r_relief", tone: "good", title: "Relief duty",
    summary: "They're homeless. Help them secure a home that will last at least 6 months.",
    sections: ["s.189B", "s.189A"], stage: "relief",
    actions: ["Complete the assessment and agree a PHP", "Search: private rented, supported housing, housing register", "56 days", "If priority need becomes likely, arrange interim accommodation"],
    cont: { label: "56 days have passed and they're still homeless", next: "md_pn" }
  },
  {
    kind: "r", id: "r_nopn", tone: "info", title: "No main duty: advice and assistance",
    summary: "Homeless but no priority need, so the main duty isn't owed.",
    sections: ["s.184", "s.202"], stage: "notowed",
    actions: ["Send a written decision with reasons and review rights (21 days)", "Keep helping with their search", "Refer to support services"]
  },
  {
    kind: "r", id: "r_intentional", tone: "warn", title: "Intentionally homeless with priority need",
    summary: "Short-term help only, not the main duty.",
    sections: ["s.190", "s.191", "s.202"], stage: "intentional",
    actions: ["Provide accommodation for a reasonable period", "Give advice and help with their search", "Send a written decision with reasons and review rights"]
  },
  {
    kind: "r", id: "r_referral", tone: "info", title: "Local connection referral",
    summary: "Another council may owe the duty. Refer the case to them.",
    sections: ["s.198", "s.199", "s.202"], stage: "decision",
    actions: ["Confirm there's no risk of violence in the other area", "Refer to the council where they have a connection", "Keep accommodating until the referral is resolved", "Written decision with review rights"]
  },
  {
    kind: "r", id: "r_main", tone: "good", title: "Main housing duty",
    summary: "Eligible, homeless, priority need and not intentionally homeless. This council owes the main duty.",
    sections: ["s.193", "s.206", "s.210"], stage: "mainduty",
    actions: ["Send the written decision", "Provide suitable temporary accommodation", "Register them on the housing register", "Work towards a suitable final offer"]
  }
];

export const DUTY_TREE: Record<string, DNode> = Object.fromEntries(nodes.map(n => [n.id, n]));
