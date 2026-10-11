import type { CaseStudy } from "../types";

export const CASES: CaseStudy[] = [
  {
    id: "amina", name: "Amina", colour: "var(--moss)",
    blurb: "Private tenant, landlord selling. A prevention success.",
    steps: [
      ["approach", "Amina, 38, lives with her 10-year-old son in a private rented flat. She fills in the council's online form after her landlord gives her a notice."],
      ["triage", "The officer asks to see the notice: a Section 8 notice (landlord selling), ending in 7 weeks. She is threatened with homelessness."],
      ["assess", "She is a British citizen, so eligible. The PHP is agreed: the officer will speak to the landlord and offer a rent deposit; Amina will search for 2-bed flats and send them in weekly."],
      ["prevention", "The landlord agrees to 4 extra weeks. A 2-bed flat is found. The officer checks affordability (income minus rent, bills and essentials leaves enough) and suitability (near school, safety certificates in place)."],
      ["success", "Amina and her son move in with a council rent deposit. The prevention duty ends. Best outcome: they never became homeless."]
    ],
    lesson: "Acting early, and reading the notice properly, gave the officer time to prevent homelessness altogether."
  },
  {
    id: "kwame", name: "Kwame", colour: "var(--gold)",
    blurb: "Newly recognised refugee leaving Home Office housing.",
    steps: [
      ["approach", "Kwame, 31, has just been granted refugee status. The Home Office has told him to leave his asylum accommodation in 28 days. A refugee support charity refers him."],
      ["triage", "He will lose his accommodation within 56 days, so he is threatened with homelessness. He is single with no obvious priority need."],
      ["assess", "Refugee status means he is eligible. PHP: open a bank account, claim Universal Credit, ask the Home Office about an extension; the officer will search for rooms."],
      ["prevention", "Single and under 35, so the room rate applies. The officer finds a room in a shared house and uses the rent deposit scheme. Affordability is checked against his Universal Credit award."],
      ["success", "Kwame moves into the room before his asylum accommodation ends. He never sleeps rough."]
    ],
    lesson: "Refugees are eligible and should get help straight away. Don't wait until day 28."
  },
  {
    id: "lee", name: "Lee", colour: "var(--slate)",
    blurb: "Prison leaver referred under the Duty to Refer.",
    steps: [
      ["approach", "The prison makes a Duty to Refer referral 6 weeks before Lee, 42, is released. He has nowhere to go."],
      ["triage", "Release is within 56 days, so he is threatened with homelessness. The officer speaks to Lee and his probation officer."],
      ["assess", "Eligible. PHP: probation to share risk information; the officer to refer to supported housing; Lee to attend a benefits appointment on release day."],
      ["prevention", "No supported housing place is ready by release day."],
      ["relief", "Lee is released and is now homeless, so the relief duty starts. He has a history of mental ill health: reason to believe he may be vulnerable."],
      ["interim", "Interim accommodation is arranged on release day while inquiries continue."],
      ["success", "Three weeks later a supported housing room becomes available. Lee moves in with support from probation and a mental health worker. The relief duty ends."]
    ],
    lesson: "Duty to Refer referrals give you time to plan. Joint working with probation is key."
  },
  {
    id: "chloe", name: "Chloe", colour: "var(--moss)",
    blurb: "Care leaver, 20, asked to leave a friend's sofa.",
    steps: [
      ["approach", "Chloe, 20, is a care leaver. Her friend has asked her to leave the sofa she has been sleeping on."],
      ["triage", "She is homeless tonight. Care leavers aged 18 to 20 have automatic priority need."],
      ["interim", "Emergency accommodation is booked the same day. Her personal adviser from the leaving care team is told."],
      ["assess", "Eligible. Joint assessment with the leaving care team. PHP: supported lodgings or a training flat; budgeting support."],
      ["relief", "The officer and leaving care team search for options. Care leavers under 25 are exempt from the room-rate limit, which widens her choices."],
      ["success", "Chloe moves into a one-bed training flat with support. The relief duty ends."]
    ],
    lesson: "Care leavers have extra protections. Always work jointly with the leaving care team."
  },
  {
    id: "dan", name: "Dan", colour: "var(--slate)",
    blurb: "19, asked to leave by mum. A review changes the decision.",
    steps: [
      ["approach", "Dan, 19, walks into the council office. His mum told him to leave this morning after an argument."],
      ["triage", "He has nowhere to sleep tonight, so he is homeless. He mentions anxiety and panic attacks: reason to believe he could be vulnerable."],
      ["interim", "The officer books emergency accommodation in a supported hostel the same day."],
      ["assess", "Eligible. PHP: try family mediation; Dan registers with a GP and applies for supported housing; the officer searches for rooms in shared houses (under 35, so room rate)."],
      ["relief", "Mediation is tried but mum won't have him back. No suitable room is found within 56 days."],
      ["decision", "With no medical evidence on file, the decision is: no priority need. A letter is sent with reasons and review rights."],
      ["notowed", "Dan still gets advice and help with his search. He is told he has 21 days to ask for a review."],
      ["review", "Dan asks for a review and sends a letter from his GP and mental health team. A senior officer finds he IS vulnerable."],
      ["mainduty", "Decision changed: main duty owed. Dan is placed in suitable temporary accommodation while he waits for a settled home."]
    ],
    lesson: "Gather evidence before deciding. Reviews exist to put mistakes right."
  },
  {
    id: "sarah", name: "Sarah", colour: "var(--terra)",
    blurb: "Fleeing domestic abuse with two children. All the way to a settled home.",
    steps: [
      ["approach", "Sarah arrives at 3pm with her two children. She has fled her partner in Liverpool."],
      ["triage", "Safety first: private room, DASH risk checklist. High risk, so a MARAC referral is made. She is homeless (not reasonable to stay) and has automatic priority need."],
      ["interim", "Emergency accommodation is booked before she leaves, well away from Liverpool. Two nights in B&B, then a self-contained flat."],
      ["assess", "Eligible. No referral back to Liverpool because of the risk. PHP agreed; IDVA support arranged; school places sorted."],
      ["relief", "56 days of searching. She joins the housing register. No settled home yet."],
      ["decision", "Eligible, homeless, priority need, not intentionally homeless: main duty owed."],
      ["mainduty", "She stays in suitable self-contained temporary accommodation near the children's new school."],
      ["endmain", "After 10 months she is offered a suitable 2-bed housing association home through the housing register, and accepts."],
      ["settled", "Sarah and the children move in. The main duty ends."]
    ],
    lesson: "Safety comes first, and you never refer someone back to an area where they are at risk."
  },
  {
    id: "okafor", name: "The Okafors", colour: "var(--terra)",
    blurb: "Family in TA who refuse a private rented offer.",
    steps: [
      ["mainduty", "The Okafor family (two parents, two children) have been in temporary accommodation for 14 months under the main duty."],
      ["endmain", "The council offers a suitable 2-bed private rented flat: an assured periodic tenancy, affordable, safety checks passed, 25 minutes by bus from the children's school. The letter warns that refusing will end the duty and explains review rights."],
      ["review", "The family refuse, saying it is too far from school, and request a review. The reviewing officer considers the journey, the children's needs and the evidence, and decides the offer was suitable. The duty has ended."],
      ["appeal", "They are told they can appeal to the county court on a point of law within 21 days. They get advice from Shelter and decide not to appeal. The council gives advice on next steps."]
    ],
    lesson: "They could have accepted the flat AND asked for a review at the same time (s.202(1A)). Always explain this option."
  }
];
