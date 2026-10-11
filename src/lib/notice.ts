import { addDays, addMonths, diffDays } from "./dates";

export type Landlord = "private" | "ha" | "council";
export type NoticeType = "s8" | "s21" | "other";
export type Ground = "g1" | "g1a" | "g8" | "g10" | "asb" | "other";

export interface NoticeInput {
  landlord: Landlord;
  type: NoticeType;
  served: Date | null;
  expiry: Date | null;
  ground?: Ground;
  courtStarted?: boolean;
  tenancyOver12Months?: boolean;
  today: Date;
}

export type NoticeStatus = "threatened" | "not-yet" | "invalid" | "expired" | "check";

export interface NoticeResult {
  status: NoticeStatus;
  headline: string;
  points: string[];
  daysToExpiry: number | null;
  preventionBy: Date | null;
}

/** Section 21 ended for private landlords on this date (Renters' Rights Act 2025). */
export const RRA_DATE = new Date(2026, 4, 1);
/** Pre-May private Section 21 notices only survive if court action started by this date. */
export const COURT_DEADLINE = new Date(2026, 6, 31);

export const GROUNDS: { id: Ground; label: string }[] = [
  { id: "g1", label: "Ground 1: landlord or family moving in" },
  { id: "g1a", label: "Ground 1A: landlord selling" },
  { id: "g8", label: "Ground 8: serious rent arrears" },
  { id: "g10", label: "Grounds 10 / 11: some arrears or persistent late payment" },
  { id: "asb", label: "Anti-social behaviour (Grounds 7A / 14)" },
  { id: "other", label: "Other or not sure" }
];

function timing(input: NoticeInput) {
  const days = input.expiry ? diffDays(input.today, input.expiry) : null;
  const preventionBy = input.expiry ? addDays(input.expiry, -56) : null;
  return { days, preventionBy };
}

function byExpiry(input: NoticeInput, points: string[]): NoticeResult {
  const { days, preventionBy } = timing(input);
  if (days === null) {
    return { status: "check", headline: "Add the date the notice ends to see if they're threatened with homelessness.", points, daysToExpiry: null, preventionBy: null };
  }
  if (days < 0) {
    return {
      status: "threatened",
      headline: "The notice has already ended. Only a court order and bailiffs can lawfully evict. They're still threatened with homelessness: prevention duty.",
      points: [...points, "Ask about any court papers or hearing date.", "If the landlord tries to force them out without a court order, that may be an illegal eviction: involve your tenancy relations or private sector housing team."],
      daysToExpiry: days, preventionBy
    };
  }
  if (days <= 56) {
    return {
      status: "threatened",
      headline: `The notice ends in ${days} day${days === 1 ? "" : "s"}. If it's valid, they're threatened with homelessness: prevention duty.`,
      points: [...points, "Prevention can't be ended just because 56 days pass while they're still threatened by a valid notice."],
      daysToExpiry: days, preventionBy
    };
  }
  return {
    status: "not-yet",
    headline: `The notice ends in ${days} days, so it doesn't make them threatened yet. Give advice now.`,
    points: [...points, "Diarise the date the notice comes within 56 days of ending and ask them to come back before then."],
    daysToExpiry: days, preventionBy
  };
}

export function checkNotice(input: NoticeInput): NoticeResult {
  const { landlord, type, served } = input;
  const servedBeforeRRA = served ? served < RRA_DATE : null;

  if (type === "other") {
    return byExpiry(input, [
      "For other situations (a council notice, family asking them to leave, a Home Office notice to quit asylum housing), ask: are they likely to lose their home within 56 days?",
      "Check the details with a senior officer if you're unsure."
    ]);
  }

  if (landlord === "council") {
    return {
      status: "invalid",
      headline: type === "s21"
        ? "Council tenancies aren't assured shorthold tenancies, so Section 21 doesn't apply."
        : "Council tenants usually have secure or introductory tenancies, which use different notices.",
      points: [
        "Find out exactly what notice they have (for example a notice of seeking possession).",
        "Then choose 'Other notice' above, add the end date, and check with a senior officer."
      ],
      daysToExpiry: null, preventionBy: null
    };
  }

  if (landlord === "ha") {
    if (type === "s21") {
      return byExpiry(input, [
        "Housing association assured shorthold tenancies (such as starter tenancies) can still get a Section 21 for now: the Renters' Rights Act changes haven't been applied to social housing yet.",
        "Check it's valid: correct form, the right notice period, and deposit rules if a deposit was taken."
      ]);
    }
    return byExpiry(input, [
      "Housing association assured tenancy: check the ground and notice period, and get advice if unsure.",
      "Contact the housing association early: they may agree a plan, especially for arrears."
    ]);
  }

  // Private landlord
  if (type === "s21") {
    if (servedBeforeRRA === false) {
      return {
        status: "invalid",
        headline: "Private landlords can't serve new Section 21 notices from 1 May 2026, so this notice is very likely invalid.",
        points: [
          "Rare exceptions exist where an older notice kept the tenancy as an assured shorthold. Check with a senior or Shelter Legal.",
          "The landlord may face a penalty: tell your private sector housing team.",
          "If the landlord is forcing them out, this could be an illegal eviction. Act quickly.",
          "Still assess whether they're likely to lose their home within 56 days for any other reason."
        ],
        daysToExpiry: null, preventionBy: null
      };
    }
    if (servedBeforeRRA === null) {
      return { status: "check", headline: "Add the date the notice was served. Section 21 rules changed on 1 May 2026.", points: [], daysToExpiry: null, preventionBy: null };
    }
    if (input.today > COURT_DEADLINE && input.courtStarted !== true) {
      return {
        status: "expired",
        headline: "This Section 21 was served before 1 May 2026 but can only be used if the landlord applied to court by 31 July 2026.",
        points: [
          "If no court claim was made, the notice can no longer be used.",
          "Ask the client if they've received any court papers. If they have, tick 'court proceedings started'.",
          "The landlord would now need a Section 8 notice with a legal reason."
        ],
        daysToExpiry: null, preventionBy: null
      };
    }
    const pts = ["Section 21 served before 1 May 2026: it stays valid only if the landlord applied to court by 31 July 2026."];
    if (input.courtStarted) pts.push("Court proceedings have started: ask for the court papers and any possession date. Use that date as the end date.");
    return byExpiry(input, pts);
  }

  // Private landlord, Section 8
  if (servedBeforeRRA) {
    return byExpiry(input, [
      "Section 8 served before 1 May 2026: the old rules apply. It doesn't automatically mean they're threatened, so get advice and assess carefully."
    ]);
  }
  const pts: string[] = [
    "Check it's on the new prescribed Section 8 form and names a ground (reason).",
    "An unprotected deposit doesn't automatically make a Section 8 invalid: the landlord has until the hearing to sort it."
  ];
  const g = input.ground ?? "other";
  let minEnd: Date | null = null;
  if (g === "g1" || g === "g1a") {
    pts.push("Grounds 1 and 1A need at least 4 months' notice.");
    if (input.tenancyOver12Months === false) pts.unshift("Grounds 1 and 1A can't be used in the first 12 months of a tenancy, so this notice looks invalid. Check with a senior.");
    if (g === "g1a") pts.push("After Ground 1A, the landlord can't re-let the property for 12 months.");
    if (served) minEnd = addMonths(served, 4);
  } else if (g === "g8") {
    pts.push("Ground 8 needs at least 3 months' rent arrears both when the notice was served and at the court hearing, and 4 weeks' notice.");
    pts.push("Getting arrears below 3 months (for example with a DHP or prevention fund) can defeat Ground 8.");
    if (served) minEnd = addDays(served, 28);
  } else if (g === "g10") {
    pts.push("Grounds 10 and 11 are discretionary: the court decides if it's reasonable. They need 4 weeks' notice.");
    if (served) minEnd = addDays(served, 28);
  } else if (g === "asb") {
    pts.push("Anti-social behaviour grounds can have very short notice periods. Check the specific ground with a senior.");
  } else {
    pts.push("Check the ground and its minimum notice period with a senior or Shelter Legal.");
  }
  if (minEnd && input.expiry && input.expiry < minEnd) {
    pts.unshift("The notice period looks too short for this ground, so the notice may be invalid. Check with a senior.");
  }
  return byExpiry(input, pts);
}
