import type { Edge, RoleId, Stage, StageId } from "../types";

export const CONTENT_DATE = "October 2026";

export const ROLES: Record<RoleId, string> = {
  frontdoor: "Front door / triage officer",
  caseworker: "Housing options caseworker",
  ta: "Temporary accommodation officer",
  prs: "Private rented / landlord officer",
  allocations: "Housing register officer",
  senior: "Senior officer / team leader",
  reviewer: "Review officer",
  legal: "Council legal team",
  partners: "Partner agencies"
};

export const STAGE_TYPES: Record<string, string> = {
  entry: "Front door",
  duty: "Duty",
  emerg: "Emergency",
  dec: "Decision",
  side: "Side route",
  rev: "Review",
  out: "Outcome"
};

const list: Stage[] = [
  {
    id: "approach", row: 1, col: 2, type: "entry", tag: "Stage 1", title: "Approach or referral",
    sub: "Client contacts us, or is referred", law: "s.184",
    plain: "Someone contacts the council because they are homeless or worried about losing their home. They might come themselves, or be referred by another service.",
    officer: [
      "Welcome them and take basic details: name, contact, who lives with them",
      "Ask straight away: are you safe? Where will you sleep tonight?",
      "For a Duty to Refer referral, contact the person quickly (with their consent)",
      "Open a case on the system",
      "If they may be homeless or at risk within 56 days, take an application. Never turn them away"
    ],
    roles: ["frontdoor", "partners"],
    lawList: [
      ["s.213B", "Duty to Refer: hospitals, prisons, probation, Jobcentres, social services and others must refer people at risk (with consent)"],
      ["s.184", "If there is 'reason to believe' someone may be homeless or threatened, the council must make inquiries"],
      ["s.179", "Everyone is entitled to free housing advice and information"]
    ],
    times: ["Same day", "Out-of-hours emergency service 24/7"],
    next: [["triage", "Next: triage"]],
    tip: "Say 'no wrong door'. Every approach is taken seriously. Turning people away without inquiries (gatekeeping) is unlawful."
  },
  {
    id: "triage", row: 2, col: 2, type: "entry", tag: "Stage 2", title: "Triage",
    sub: "Quick first conversation: how urgent?", law: "s.175",
    plain: "A short first conversation to understand what has happened and how urgent it is.",
    officer: [
      "Ask: where did you sleep last night? Where will you sleep tonight?",
      "Ask to SEE any eviction notice. Check who the landlord is and the date",
      "Spot risk: domestic abuse, children, self-harm, rough sleeping",
      "Decide: homeless now, or threatened within 56 days?",
      "Book the full assessment, or arrange emergency accommodation today"
    ],
    roles: ["frontdoor", "partners"],
    lawList: [
      ["s.175", "Homeless = no home it's reasonable to stay in. Threatened = likely to lose it within 56 days, or a valid notice ending within 56 days"],
      ["s.188", "Emergency (interim) accommodation if there's reason to believe they're homeless, eligible and in priority need"]
    ],
    times: ["Same day"],
    next: [["assess", "Next: assessment"], ["interim", "Emergency: interim accommodation"], ["advice", "Not at risk: advice"]],
    tip: "Always say you would ask to see the notice. Never take it on trust."
  },
  {
    id: "advice", row: 2, col: 1, type: "side", tag: "Side route", title: "Advice & information",
    sub: "Not at risk yet, or not eligible", law: "s.179",
    plain: "If the person isn't homeless or threatened within 56 days, or isn't eligible, they still get free advice and help to find the right service.",
    officer: [
      "Give clear advice on their housing options, in writing",
      "Check again: could they become threatened within 56 days?",
      "Not eligible but has children or care needs? Refer to children's or adult social care",
      "Signpost: debt advice, benefits help, Citizens Advice",
      "Tell them to come back straight away if things change"
    ],
    roles: ["frontdoor", "caseworker", "partners"],
    lawList: [
      ["s.179", "Free advice and information for everyone in the area"],
      ["s.185", "Not eligible means no homelessness duty, but other services may help"]
    ],
    times: ["Same day"],
    next: [["approach", "If things change: new approach"]],
    tip: "Even when no duty is owed, a good officer still helps. Early advice prevents a crisis later."
  },
  {
    id: "interim", row: 2, col: 3, type: "emerg", tag: "Emergency", title: "Interim accommodation",
    sub: "Somewhere safe while we look into it", law: "s.188",
    plain: "Emergency accommodation while the council looks into the case. Given when someone may be homeless, eligible and in priority need.",
    officer: [
      "Book a suitable placement, as close to home as possible",
      "Families with children: B&B only as a last resort, 6 weeks max",
      "Explain the placement rules and what happens next",
      "Record the reasons if placed out of area",
      "Keep in touch and keep the case moving"
    ],
    roles: ["frontdoor", "ta", "caseworker"],
    lawList: [
      ["s.188", "Interim duty: low threshold, 'reason to believe'"],
      ["s.206 / s.210", "Must be suitable, including location"],
      ["2003 Order", "B&B for families with children or pregnant women: 6 weeks max"]
    ],
    times: ["Same day, before the person leaves", "Lasts until the main duty decision"],
    next: [["relief", "Runs alongside: relief duty"]],
    tip: "The threshold is low: 'reason to believe', not proof. If in doubt, accommodate and make inquiries."
  },
  {
    id: "assess", row: 3, col: 2, type: "entry", tag: "Stage 3", title: "Assessment & PHP",
    sub: "Check the tests, agree the plan", law: "s.189A", reviewable: true,
    plain: "A fuller look at the person's situation. The officer checks the legal tests, assesses their needs and agrees a Personalised Housing Plan (PHP).",
    officer: [
      "Check eligibility (immigration status) and get proof",
      "Confirm homeless or threatened. Check the notice is valid",
      "Assess why they're losing their home, what home they need, and support needs",
      "Agree the PHP: steps for the council AND the client",
      "Write to the client confirming which duty they are owed"
    ],
    roles: ["caseworker", "partners"],
    lawList: [
      ["s.184", "Inquiries into eligibility and which duty is owed"],
      ["s.185", "Eligibility"],
      ["s.189A", "Written assessment and Personalised Housing Plan, kept under review"]
    ],
    times: ["As soon as possible after triage", "PHP reviewed throughout the case"],
    next: [["prevention", "Threatened within 56 days: prevention"], ["relief", "Homeless now: relief"], ["advice", "Not eligible: advice"]],
    tip: "Say: 'The PHP is a two-way plan with realistic steps for me and the client, reviewed regularly.'"
  },
  {
    id: "prevention", row: 4, col: 1, type: "duty", tag: "Stage 4a", title: "Prevention duty",
    sub: "Help them keep their home, or find another", law: "s.195", reviewable: true,
    plain: "The person is threatened with homelessness. The council takes reasonable steps to help them keep their home, or find a new one, before they become homeless.",
    officer: [
      "Contact the landlord or family and negotiate more time",
      "Check the notice: Section 8 reason and notice period (or Section 21 for housing association / older notices)",
      "Help with arrears: Discretionary Housing Payment, prevention fund, budgeting",
      "Family mediation, where it's safe",
      "Search for a new home: private rented, rent deposit scheme, supported housing",
      "Check affordability and suitability before any move"
    ],
    roles: ["caseworker", "prs", "partners"],
    lawList: [
      ["s.195", "Prevention duty: owed whatever their priority need, intentionality or local connection"],
      ["Renters' Rights Act", "Private tenants: a valid Section 8 notice ending within 56 days means threatened"]
    ],
    times: ["Up to 56 days (continues if still threatened by a valid notice)"],
    ends: [
      "Home kept or found, for 6+ months",
      "Becomes homeless: move to relief duty",
      "56 days pass (unless still threatened by a valid notice)",
      "Refuses a suitable offer",
      "Refuses to cooperate (after a written warning)",
      "Withdraws, loses contact, or no longer eligible"
    ],
    next: [["success", "Home kept or found"], ["relief", "Becomes homeless: relief"]],
    tip: "Prevention is the best outcome: cheaper for the council and far less stressful for the client."
  },
  {
    id: "relief", row: 4, col: 3, type: "duty", tag: "Stage 4b", title: "Relief duty",
    sub: "Help a homeless person find a home", law: "s.189B", reviewable: true,
    plain: "The person is already homeless. The council takes reasonable steps to help them secure a home that will be available for at least 6 months.",
    officer: [
      "Keep any emergency accommodation going if priority need is likely",
      "Search for homes: private rented, supported housing, housing register",
      "Arrange rent deposits or landlord incentives",
      "Check affordability and suitability of every option",
      "Update the PHP and keep in regular contact",
      "Near day 56: prepare for the main duty decision"
    ],
    roles: ["caseworker", "prs", "allocations", "partners"],
    lawList: [
      ["s.189B", "Relief duty: owed to eligible homeless people, whatever their priority need"],
      ["s.188", "Interim accommodation continues if priority need is likely"],
      ["s.193A", "Refusing a final offer ends relief, and the main duty is then not owed"]
    ],
    times: ["56 days"],
    ends: [
      "Home secured for 6+ months",
      "56 days pass: main duty decision",
      "Refuses a final accommodation offer or final Part 6 offer",
      "Refuses to cooperate (after a written warning). Since May 2026 this no longer affects the main duty",
      "Withdraws, loses contact, or no longer eligible"
    ],
    next: [["success", "Home found"], ["decision", "56 days pass, still homeless: decision"]],
    tip: "Relief duty is s.189B. It is the council's duty, not a housing association's."
  },
  {
    id: "success", row: 4, col: 2, type: "out", tag: "Outcome", title: "Home secured",
    sub: "Kept or found for 6+ months", law: "", reviewable: true, outcome: true,
    plain: "The best outcome: the person keeps their home, or moves somewhere suitable that is available for at least 6 months. The duty ends and the main duty is never reached.",
    officer: [
      "Confirm the new home is suitable and affordable",
      "Send the written decision ending the duty, with review rights",
      "Help with the move: deposit, benefits claim, furniture schemes",
      "End any emergency accommodation and tell the provider",
      "Make sure support is in place so the tenancy lasts, then close the case"
    ],
    roles: ["caseworker", "prs"],
    lawList: [
      ["s.195 / s.189B", "Duty ends when suitable accommodation is available for 6+ months"],
      ["s.202", "Client can still ask for a review, for example of suitability"]
    ],
    times: ["Review request within 21 days of the decision"],
    next: [],
    tip: "Tenancy sustainment matters. A home that fails after 3 months means the person comes back."
  },
  {
    id: "decision", row: 5, col: 2, type: "dec", tag: "Stage 5", title: "Main duty decision",
    sub: "Do they qualify for the main duty?", law: "s.184", reviewable: true,
    plain: "When relief ends and the person is still homeless, the council decides whether it owes the main housing duty.",
    officer: [
      "Check the tests: eligible? homeless? priority need? intentionally homeless?",
      "Gather evidence: medical, support workers, landlord, the client's own account",
      "Consider local connection. Refer to another council? (Never to an area of risk)",
      "Get the decision checked by a senior officer",
      "Send a clear written decision with reasons and review rights"
    ],
    roles: ["caseworker", "senior"],
    lawList: [
      ["s.184", "Written decision with reasons and review rights"],
      ["s.189", "Priority need (Hotak test for vulnerability)"],
      ["s.191", "Intentionality: the council must prove it"],
      ["s.198 / s.199", "Local connection referral"]
    ],
    times: ["At the end of the 56-day relief duty"],
    next: [["mainduty", "Main duty owed"], ["intentional", "Priority need but intentional"], ["notowed", "No priority need"]],
    tip: "Ask yourself: would this decision stand up at review? Fair, evidenced and in writing."
  },
  {
    id: "intentional", row: 6, col: 1, type: "side", tag: "Side route", title: "Intentionally homeless",
    sub: "Short-term help only", law: "s.190", reviewable: true,
    plain: "The person has priority need but lost their home because of something they deliberately did, or didn't do. They get short-term help, not the main duty.",
    officer: [
      "Provide accommodation for a 'reasonable period' so they can find somewhere",
      "Give advice and help with their search (PHP)",
      "Assess support needs and refer on",
      "Explain the decision and the right to a review"
    ],
    roles: ["caseworker", "senior", "ta"],
    lawList: [
      ["s.190", "Accommodation for a reasonable period, plus advice and assistance"],
      ["s.191", "What 'intentionally homeless' means"]
    ],
    times: ["'Reasonable period': depends on the case"],
    next: [["review", "Disagrees: review"]],
    tip: "Rent arrears from genuine hardship are NOT intentional. Always check if the lost home was affordable."
  },
  {
    id: "mainduty", row: 6, col: 2, type: "duty", tag: "Stage 6", title: "Main duty: temporary accommodation",
    sub: "Suitable TA until a settled home", law: "s.193",
    plain: "The council must make sure suitable accommodation is available. Most people wait in temporary accommodation (TA) until a settled home comes up.",
    officer: [
      "Place in suitable TA, close to school, work and support where possible",
      "Check TA meets the household's needs: size, health, safety",
      "Register them on the housing register (Part 6)",
      "Keep in touch and review suitability if things change",
      "Keep working on settled options, including private rented offers"
    ],
    roles: ["ta", "caseworker", "allocations"],
    lawList: [
      ["s.193", "Main housing duty"],
      ["s.206 / s.210", "Suitability, including location (Nzolameso case)"],
      ["Imam v Croydon", "Lack of money is no excuse for unsuitable accommodation"]
    ],
    times: ["No fixed end: can be months or years"],
    next: [["endmain", "Next: ending the main duty"]],
    tip: "TA is a means, not the end. The goal is a settled home."
  },
  {
    id: "notowed", row: 6, col: 3, type: "side", tag: "Side route", title: "No main duty",
    sub: "Advice & assistance continue", law: "s.184", reviewable: true,
    plain: "The person is homeless but doesn't have priority need (or isn't eligible). The main duty isn't owed, but they still get advice and help.",
    officer: [
      "Explain the decision clearly, in writing, with reasons",
      "Tell them about their right to a review (21 days)",
      "Keep helping: private rented search, hostels, supported housing",
      "Refer to support services: health, employment, outreach"
    ],
    roles: ["caseworker", "senior"],
    lawList: [
      ["s.184", "Written decision with reasons"],
      ["s.202", "Right to request a review"]
    ],
    times: ["Review request within 21 days"],
    next: [["review", "Disagrees: review"]],
    tip: "A 'no' is not the end of the help. Signposting and support still matter."
  },
  {
    id: "endmain", row: 7, col: 2, type: "dec", tag: "Stage 7", title: "Ending the main duty",
    sub: "Final offer, acceptance or change", law: "s.193", reviewable: true,
    plain: "The main duty ends when the person accepts a settled home, refuses a suitable final offer, or their circumstances change.",
    officer: [
      "Make a suitable final offer: social housing (Part 6) or a private rented offer",
      "A private rented offer must be an assured periodic tenancy and pass the extra safety checks",
      "Check affordability and suitability before offering",
      "Warn in writing what happens if they refuse, and their review rights",
      "Send the decision ending the duty in writing"
    ],
    roles: ["caseworker", "allocations", "prs", "senior"],
    lawList: [
      ["s.193", "Ways the main duty ends"],
      ["s.193(7AA)", "Private rented sector offer: assured periodic tenancy since 1 May 2026"],
      ["2012 Order", "Extra safety checks for private rented offers"],
      ["s.202(1A)", "Client can accept an offer AND ask for a review of its suitability"]
    ],
    times: [],
    ends: [
      "Accepts a suitable social home (Part 6)",
      "Accepts or refuses a suitable private rented offer",
      "Refuses a suitable final offer, after a written warning",
      "No longer eligible",
      "Becomes intentionally homeless from the TA",
      "Leaves the TA voluntarily"
    ],
    next: [["settled", "Accepts: settled home"], ["review", "Disagrees: review"]],
    tip: "Mention 'accept and review': clients can move in and still challenge suitability."
  },
  {
    id: "settled", row: 8, col: 1, type: "out", tag: "Outcome", title: "Settled home",
    sub: "Journey complete", law: "", outcome: true,
    plain: "The person has moved into a settled home. The homelessness journey is complete.",
    officer: [
      "Confirm the move-in and end the TA placement",
      "Help with the move: benefits, furniture, utilities",
      "Check support is in place so the tenancy lasts",
      "Close the case"
    ],
    roles: ["allocations", "prs", "ta"],
    lawList: [["s.193", "Main duty ends"]],
    times: [],
    next: [],
    tip: "A good move-in plan helps the tenancy last."
  },
  {
    id: "review", row: 8, col: 2, type: "rev", tag: "Stage 8", title: "Review",
    sub: "A senior officer looks again", law: "s.202",
    plain: "If the person disagrees with a decision, they can ask the council to look at it again. A senior officer who wasn't involved carries out the review.",
    officer: [
      "Every negative decision letter must explain review rights",
      "Client must ask within 21 days",
      "Reviewing officer: more senior, and not involved before",
      "Consider new information and invite the client's comments",
      "Send a 'minded to' letter if the original decision had a flaw",
      "Decide, usually within 8 weeks"
    ],
    roles: ["reviewer", "senior", "caseworker"],
    lawList: [
      ["s.202", "Reviews: eligibility, duty owed, intentionality, suitability, local connection, ending duties, PHP steps"],
      ["Review Regs 2018", "How and when reviews are done"],
      ["s.188(3)", "Council may provide accommodation while the review is pending"]
    ],
    times: ["21 days to request", "Usually 8 weeks to decide"],
    next: [["decision", "Decision changed: back to the right stage"], ["appeal", "Upheld but still unhappy: appeal"]],
    tip: "Clear, evidenced decisions are less likely to be overturned. Good notes protect everyone."
  },
  {
    id: "appeal", row: 8, col: 3, type: "rev", tag: "Stage 9", title: "County court appeal",
    sub: "Point of law only", law: "s.204",
    plain: "If the person is still unhappy after the review, they can appeal to the county court, but only on a point of law. Complaints about service (such as delays) go through the council's complaints process and then the Local Government and Social Care Ombudsman.",
    officer: [
      "Pass the case to the council's legal team",
      "Make sure the file and notes are complete and accurate",
      "Council may decide to accommodate during the appeal",
      "Follow the court's decision"
    ],
    roles: ["legal", "reviewer"],
    lawList: [
      ["s.204", "Appeal to the county court on a point of law"],
      ["s.204A", "Appeal about accommodation pending the appeal"]
    ],
    times: ["21 days from the review decision"],
    next: [],
    tip: "This is why good notes matter: your case file may be read by a judge."
  }
];

export const STAGES: Record<StageId, Stage> = Object.fromEntries(list.map(s => [s.id, s])) as Record<StageId, Stage>;

/** Order used for the mobile list and for search. */
export const STAGE_ORDER: StageId[] = [
  "approach", "triage", "interim", "advice", "assess", "prevention", "relief", "success",
  "decision", "mainduty", "intentional", "notowed", "endmain", "settled", "review", "appeal"
];

/** The main storyline used by trainer presentation mode. */
export const PRESENT_ORDER: StageId[] = [
  "approach", "triage", "interim", "assess", "prevention", "relief", "success",
  "decision", "intentional", "notowed", "mainduty", "endmain", "settled", "review", "appeal", "advice"
];

export const EDGES: Edge[] = [
  { from: "approach", fromSide: "b", to: "triage", toSide: "t" },
  { from: "triage", fromSide: "l", to: "advice", toSide: "r", kind: "soft" },
  { from: "triage", fromSide: "r", to: "interim", toSide: "l", kind: "emerg" },
  { from: "triage", fromSide: "b", to: "assess", toSide: "t" },
  { from: "assess", fromSide: "l", to: "advice", toSide: "b", label: "Not eligible", kind: "soft" },
  { from: "interim", fromSide: "b", to: "relief", toSide: "t:0.75", label: "Alongside", kind: "emerg-soft" },
  { from: "assess", fromSide: "b:0.35", to: "prevention", toSide: "t", label: "Threatened" },
  { from: "assess", fromSide: "b:0.65", to: "relief", toSide: "t:0.3", label: "Homeless now" },
  { from: "prevention", fromSide: "r", to: "success", toSide: "l" },
  { from: "relief", fromSide: "l", to: "success", toSide: "r" },
  { from: "prevention", fromSide: "b:0.6", to: "relief", toSide: "b:0.3", label: "Becomes homeless", kind: "alt", k: 58 },
  { from: "relief", fromSide: "b:0.75", to: "decision", toSide: "r", label: "56 days pass" },
  { from: "decision", fromSide: "b", to: "mainduty", toSide: "t", label: "Owed" },
  { from: "decision", fromSide: "l", to: "intentional", toSide: "t", label: "Intentional" },
  { from: "decision", fromSide: "r", to: "notowed", toSide: "t", label: "No priority need" },
  { from: "mainduty", fromSide: "b", to: "endmain", toSide: "t" },
  { from: "endmain", fromSide: "l", to: "settled", toSide: "t", label: "Accepts" },
  { from: "endmain", fromSide: "b", to: "review", toSide: "t", kind: "rev" },
  { from: "intentional", fromSide: "b", to: "review", toSide: "t:0.12", kind: "rev", k: 30 },
  { from: "notowed", fromSide: "b", to: "review", toSide: "t:0.88", kind: "rev", k: 30 },
  { from: "review", fromSide: "r", to: "appeal", toSide: "l", kind: "rev" }
];

export const KEY_TIMES: [string, string][] = [
  ["56 days", "prevention duty"],
  ["56 days", "relief duty"],
  ["6 months", "minimum a new home must last"],
  ["6 weeks", "max B&B for families"],
  ["21 days", "to request a review"],
  ["8 weeks", "usual time to decide a review"]
];
