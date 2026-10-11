import { describe, expect, it } from "vitest";
import { addDays, addMonths, diffDays, toISO } from "../lib/dates";
import { checkNotice } from "../lib/notice";
import { assessAffordability } from "../lib/afford";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const TODAY = d(2026, 10, 11);

describe("dates", () => {
  it("adds days and months safely", () => {
    expect(toISO(addDays(d(2026, 1, 31), 56))).toBe("2026-03-28");
    expect(toISO(addMonths(d(2026, 1, 31), 1))).toBe("2026-02-28");
    expect(diffDays(d(2026, 10, 1), d(2026, 10, 11))).toBe(10);
  });
});

describe("notice checker", () => {
  it("treats a private Section 21 served after 1 May 2026 as invalid", () => {
    const r = checkNotice({ landlord: "private", type: "s21", served: d(2026, 6, 1), expiry: d(2026, 8, 1), today: TODAY });
    expect(r.status).toBe("invalid");
  });
  it("treats a pre-May private Section 21 with no court claim as expired after 31 July 2026", () => {
    const r = checkNotice({ landlord: "private", type: "s21", served: d(2026, 3, 1), expiry: d(2026, 5, 1), courtStarted: false, today: TODAY });
    expect(r.status).toBe("expired");
  });
  it("flags a valid Section 8 ending within 56 days as threatened", () => {
    const r = checkNotice({ landlord: "private", type: "s8", ground: "g8", served: d(2026, 10, 1), expiry: d(2026, 11, 10), today: TODAY });
    expect(r.status).toBe("threatened");
    expect(r.daysToExpiry).toBe(30);
  });
  it("warns when Ground 1A notice is shorter than 4 months", () => {
    const r = checkNotice({ landlord: "private", type: "s8", ground: "g1a", served: d(2026, 10, 1), expiry: d(2026, 11, 1), tenancyOver12Months: true, today: TODAY });
    expect(r.points[0]).toMatch(/too short/);
  });
  it("says not threatened yet when the notice ends more than 56 days away", () => {
    const r = checkNotice({ landlord: "private", type: "s8", ground: "g1", served: d(2026, 9, 1), expiry: d(2027, 1, 15), tenancyOver12Months: true, today: TODAY });
    expect(r.status).toBe("not-yet");
    expect(toISO(r.preventionBy!)).toBe("2026-11-20");
  });
  it("still allows Section 21 for housing association tenants", () => {
    const r = checkNotice({ landlord: "ha", type: "s21", served: d(2026, 10, 1), expiry: d(2026, 12, 1), today: TODAY });
    expect(r.status).toBe("threatened");
  });
  it("rejects Section 21 for council tenants", () => {
    const r = checkNotice({ landlord: "council", type: "s21", served: d(2026, 10, 1), expiry: d(2026, 12, 1), today: TODAY });
    expect(r.status).toBe("invalid");
  });
});

describe("affordability", () => {
  it("finds the worked example unaffordable", () => {
    const r = assessAffordability({ frequency: "monthly", income: [2000], rent: 1050, bills: [250], essentials: [700] });
    expect(r.residual).toBe(0);
    expect(r.verdict).toBe("unaffordable");
  });
  it("converts weekly figures to monthly", () => {
    const r = assessAffordability({ frequency: "weekly", income: [600], rent: 200, bills: [50], essentials: [150], lhaWeekly: 180 });
    expect(r.income).toBe(2600);
    expect(r.residual).toBe(866.67);
    expect(r.shortfall).toBe(86.67);
    expect(r.verdict).toBe("affordable");
  });
});
