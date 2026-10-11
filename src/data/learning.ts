import type { Flashcard, QuizQuestion, StageId } from "../types";

export const STAGE_QUIZ: Partial<Record<StageId, QuizQuestion[]>> = {
  approach: [
    { q: "Someone says they might lose their home in 6 weeks. What should you do?", options: ["Tell them to come back once they've been evicted", "Take an application and make inquiries", "Refer them to a housing association"], answer: 1, explain: "6 weeks is within 56 days, so there's reason to believe they're threatened. Turning them away would be gatekeeping." },
    { q: "What is the Duty to Refer?", options: ["Councils must refer clients to private landlords", "Certain public bodies must refer people at risk of homelessness to the council, with consent", "Clients must refer themselves within 56 days"], answer: 1, explain: "s.213B covers bodies like hospitals, prisons, probation and Jobcentres." }
  ],
  triage: [
    { q: "A client says they've been evicted. What do you ask first?", options: ["Their National Insurance number", "Where they'll sleep tonight, and to see the notice", "Whether they have a local connection"], answer: 1, explain: "Urgency and the facts come first. Always see the notice yourself." },
    { q: "When is someone 'threatened with homelessness'?", options: ["Likely to become homeless within 56 days", "Likely to become homeless within 28 days", "Only once a court order is made"], answer: 0, explain: "The HRA extended this from 28 to 56 days." }
  ],
  advice: [
    { q: "Someone isn't eligible but has two young children. What do you do?", options: ["Close the case", "Give advice and refer to children's services", "Offer temporary accommodation under the main duty"], answer: 1, explain: "No homelessness duty is owed, but children's services may be able to help." }
  ],
  interim: [
    { q: "What's the test for interim accommodation?", options: ["Proof of priority need", "Reason to believe they may be homeless, eligible and in priority need", "A main duty decision"], answer: 1, explain: "The threshold is low: 'reason to believe', not proof." },
    { q: "How long can a family with children stay in B&B?", options: ["6 weeks maximum", "3 months", "No limit"], answer: 0, explain: "The 2003 Suitability Order limits B&B for families and pregnant women to 6 weeks." }
  ],
  assess: [
    { q: "What's in a Personalised Housing Plan?", options: ["Only the client's tasks", "Reasonable steps for both the council and the client", "The final offer of housing"], answer: 1, explain: "The PHP is a two-way plan, agreed and reviewed." },
    { q: "Which section covers assessments and PHPs?", options: ["s.189A", "s.193", "s.204"], answer: 0, explain: "s.189A of the Housing Act 1996." }
  ],
  prevention: [
    { q: "Who is owed the prevention duty?", options: ["Only people in priority need", "Anyone eligible and threatened with homelessness", "Only people with a local connection"], answer: 1, explain: "Priority need, intentionality and local connection don't matter at this stage." },
    { q: "A private tenant has a valid Section 8 notice ending in 5 weeks. What duty applies?", options: ["Prevention duty", "Relief duty", "Main duty"], answer: 0, explain: "A valid notice ending within 56 days means they're threatened, so prevention applies." }
  ],
  relief: [
    { q: "How long does the relief duty last?", options: ["28 days", "56 days", "6 months"], answer: 1, explain: "Relief lasts 56 days." },
    { q: "To end the relief duty, a home must be available for at least...", options: ["6 months", "12 months", "4 weeks"], answer: 0, explain: "Suitable accommodation available for at least 6 months." }
  ],
  success: [
    { q: "A client finds a suitable, affordable home during relief. What happens?", options: ["The main duty starts", "Relief ends, with a written decision and review rights", "Nothing until day 56"], answer: 1, explain: "The main duty is never reached because they're no longer homeless." }
  ],
  decision: [
    { q: "Which tests decide if the main duty is owed?", options: ["Eligible, homeless, priority need, not intentionally homeless", "Eligible and homeless only", "Local connection only"], answer: 0, explain: "All the tests come together at this point." },
    { q: "Who has to prove intentionality?", options: ["The client", "The council", "The landlord"], answer: 1, explain: "The burden is on the council." }
  ],
  intentional: [
    { q: "A tenant fell into arrears after losing their job. Intentionally homeless?", options: ["Yes, they didn't pay", "Usually not: genuine inability to pay isn't deliberate", "Yes, if the arrears are over 3 months"], answer: 1, explain: "Always check whether the lost home was affordable." }
  ],
  mainduty: [
    { q: "A council can't find local TA. Can it place a family 50 miles away without explanation?", options: ["Yes, if it's cheaper", "No: place as close as reasonably practicable and record why", "Yes, if the family agrees verbally"], answer: 1, explain: "Nzolameso v Westminster (2015) requires councils to consider and explain location." }
  ],
  notowed: [
    { q: "A single homeless man has no priority need. What happens?", options: ["Nothing more", "A written decision with review rights, plus advice and help", "He's placed in TA under the main duty"], answer: 1, explain: "A 'no' still comes with reasons, review rights and help." }
  ],
  endmain: [
    { q: "Since 1 May 2026, a private rented offer to end the main duty must be...", options: ["A 12-month assured shorthold tenancy", "An assured periodic tenancy", "A licence"], answer: 1, explain: "The Renters' Rights Act abolished ASTs in the private rented sector." },
    { q: "Can a client accept an offer and still challenge its suitability?", options: ["No", "Yes: accept and request a review", "Only through the Ombudsman"], answer: 1, explain: "s.202(1A) allows 'accept and review'." }
  ],
  settled: [
    { q: "What should happen when a client moves into their settled home?", options: ["End the TA placement and check support is in place", "Keep the TA as a backup", "Nothing"], answer: 0, explain: "Close things down properly and help the tenancy last." }
  ],
  review: [
    { q: "How long does a client have to request a review?", options: ["7 days", "21 days", "3 months"], answer: 1, explain: "21 days from being told the decision." },
    { q: "Who carries out the review?", options: ["The same officer", "A more senior officer not involved in the decision", "The landlord"], answer: 1, explain: "Reviews must be independent of the original decision." }
  ],
  appeal: [
    { q: "A county court appeal is on...", options: ["Any disagreement", "A point of law", "Service delays"], answer: 1, explain: "Service complaints go through the complaints process and then the Ombudsman." }
  ]
};

export const EXTRA_QUESTIONS: QuizQuestion[] = [
  { q: "What does LHA stand for?", options: ["Local Housing Association", "Local Housing Allowance", "Landlord Housing Agreement"], answer: 1, explain: "It caps how much housing benefit or Universal Credit pays towards private rent." },
  { q: "A single 30-year-old: which LHA rate usually applies?", options: ["One-bedroom rate", "Shared accommodation (room) rate", "Two-bedroom rate"], answer: 1, explain: "Single people under 35 usually get the room rate, with some exemptions." },
  { q: "Since 1 May 2026, can a private landlord serve a new Section 21 notice?", options: ["Yes", "No", "Only for rent arrears"], answer: 1, explain: "Private landlords must now use Section 8 with a legal reason." },
  { q: "A housing association starter tenant gets a Section 21. Is that possible?", options: ["No, Section 21 has gone for everyone", "Yes, it can still apply to housing association tenants for now", "Only for council tenants"], answer: 1, explain: "The Renters' Rights Act changes haven't been applied to social housing yet." },
  { q: "What is MARAC?", options: ["A meeting of agencies about high-risk domestic abuse cases", "A type of tenancy", "A homelessness statistic"], answer: 0, explain: "Officers may refer high-risk cases after a DASH risk assessment." },
  { q: "Someone fleeing domestic abuse has no local connection here. Can you refer them back?", options: ["Yes, always", "No, not to an area where they'd be at risk of violence", "Only if they agree on the phone"], answer: 1, explain: "Never refer someone back to risk." },
  { q: "Income £1,800, rent £950, bills £250, essentials £650. Is the home affordable?", options: ["No: it leaves -£50", "Yes: it leaves £50", "Yes: it leaves £150"], answer: 0, explain: "1,800 - 950 - 250 - 650 = -50. Nothing left to live on, so not affordable." },
  { q: "Which groups have automatic priority need?", options: ["Single people over 35", "Families with dependent children and people homeless because of domestic abuse", "Anyone with rent arrears"], answer: 1, explain: "Others may have priority need if vulnerable." },
  { q: "What should every negative decision letter include?", options: ["Reasons and the right to request a review", "Only the decision", "A court date"], answer: 0, explain: "Written reasons and review rights, every time." },
  { q: "Prevention duty ends when someone becomes homeless. What happens next?", options: ["The case closes", "The relief duty starts", "The main duty starts"], answer: 1, explain: "Prevention moves on to relief." }
];

export const ALL_QUESTIONS: QuizQuestion[] = [
  ...Object.values(STAGE_QUIZ).flat().filter((q): q is QuizQuestion => !!q),
  ...EXTRA_QUESTIONS
];

export const FLASHCARDS: Flashcard[] = [
  { q: "What changed when the HRA came in (April 2018)?", points: ["New prevention and relief duties", "Help starts 56 days before homelessness (was 28)", "Duty to Refer for public bodies", "Personalised Housing Plans for every applicant", "Focus on acting early"] },
  { q: "Name the five tests.", points: ["Eligibility (s.185)", "Homelessness (s.175)", "Priority need (s.189)", "Intentionality (s.191)", "Local connection (s.199)"] },
  { q: "A 23-year-old man says he's homeless. What inquiries will you make?", points: ["Where is he sleeping tonight? What happened?", "See any notice; check eligibility", "Health, support needs, care leaver status, income", "Homeless now means relief duty; interim if priority need is likely", "Under 35, so the room rate usually applies"] },
  { q: "How will you check an eviction notice is valid?", points: ["Ask to see it; note the date served", "Private landlord: Section 8 on the prescribed form, with a ground and the right notice period", "Housing association: Section 21 may still apply for now", "Ends within 56 days means threatened: prevention duty", "If unsure, check with a senior or Shelter Legal"] },
  { q: "Your client is on relief duty and 56 days have passed. What will you do?", points: ["Review the PHP and what's been tried", "Decide if the main duty is owed: priority need, intentionality, local connection", "Owed: main duty and suitable TA", "Not owed: written decision, reasons, review rights, advice"] },
  { q: "How will you make sure your client engages with you?", points: ["Build trust and explain the process in plain English", "Agree the PHP together", "Regular contact: calls, texts, reminders", "Be flexible and trauma-informed", "Follow up missed appointments before any non-cooperation warning"] },
  { q: "Can you carry a caseload from start to finish?", points: ["Keep a diary of deadlines: 56 days, notice dates, reviews", "Prioritise risk and urgent cases", "Keep notes up to date and decisions on time", "Use partners and escalate when needed"] },
  { q: "A client is fleeing domestic abuse from Liverpool. What are your steps?", points: ["Safety first: talk in private", "She is homeless and has automatic priority need", "Interim accommodation the same day", "DASH risk assessment; MARAC and IDVA referrals if high risk", "Never refer her back to Liverpool"] },
  { q: "How do you assess affordability?", points: ["Add up all income", "Take away rent, bills and essentials", "Is enough left to live on? Use the council's policy", "Check any shortfall against LHA; consider DHP", "Record the calculation on file"] },
  { q: "What makes accommodation suitable?", points: ["Affordable", "Right size", "Location: school, work, support, health care", "Meets health and disability needs", "Safe: gas certificate, alarms, good condition; extra checks for private rented offers"] },
  { q: "What's the difference between prevention and relief?", points: ["Prevention: threatened with homelessness", "Relief: already homeless", "Both 56 days, both regardless of priority need", "Relief aims for a home lasting 6+ months; interim accommodation if priority need is likely"] },
  { q: "What did the Renters' Rights Act change?", points: ["Section 21 ended for private landlords on 1 May 2026", "Landlords now use Section 8 with a legal reason", "Valid Section 8 ending within 56 days means threatened", "Private rented offers are now assured periodic tenancies", "Refusing to cooperate no longer affects the main duty"] },
  { q: "What happens if someone disagrees with a decision?", points: ["Review within 21 days (s.202)", "Done by a more senior officer not involved before", "Usually decided within 8 weeks", "Then county court appeal on a point of law within 21 days (s.204)"] }
];
