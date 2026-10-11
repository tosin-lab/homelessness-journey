export type Frequency = "monthly" | "weekly" | "fourweekly";

export const FREQ_FACTOR: Record<Frequency, number> = {
  monthly: 1,
  weekly: 52 / 12,
  fourweekly: 13 / 12
};

export interface AffordInput {
  frequency: Frequency;
  income: number[];
  rent: number;
  bills: number[];
  essentials: number[];
  /** Weekly LHA rate for the household's size and area. Optional. */
  lhaWeekly?: number;
  /** The council's minimum residual income per month, if it has one. Optional. */
  minResidual?: number;
}

export interface AffordResult {
  income: number;
  rent: number;
  bills: number;
  essentials: number;
  residual: number;
  lhaMonthly: number | null;
  shortfall: number | null;
  verdict: "unaffordable" | "tight" | "affordable" | "check";
  message: string;
}

const sum = (a: number[]) => a.reduce((t, n) => t + (Number.isFinite(n) ? n : 0), 0);
const round = (n: number) => Math.round(n * 100) / 100;

export function assessAffordability(i: AffordInput): AffordResult {
  const f = FREQ_FACTOR[i.frequency];
  // Work with unrounded values, then round once for display
  const rawIncome = sum(i.income) * f;
  const rawRent = (Number.isFinite(i.rent) ? i.rent : 0) * f;
  const rawBills = sum(i.bills) * f;
  const rawEss = sum(i.essentials) * f;
  const rawLha = i.lhaWeekly && i.lhaWeekly > 0 ? (i.lhaWeekly * 52) / 12 : null;
  const income = round(rawIncome);
  const rent = round(rawRent);
  const bills = round(rawBills);
  const essentials = round(rawEss);
  const residual = round(rawIncome - rawRent - rawBills - rawEss);
  const lhaMonthly = rawLha !== null ? round(rawLha) : null;
  const shortfall = rawLha !== null ? round(Math.max(0, rawRent - rawLha)) : null;

  let verdict: AffordResult["verdict"];
  let message: string;
  if (income <= 0) {
    verdict = "check";
    message = "Add the household's income to see the result.";
  } else if (residual <= 0) {
    verdict = "unaffordable";
    message = "Nothing is left after rent, bills and essentials. This home is not affordable, so it isn't suitable.";
  } else if (i.minResidual && residual < i.minResidual) {
    verdict = "unaffordable";
    message = "What's left is below your council's minimum. Treat this home as not affordable.";
  } else if (residual < income * 0.05) {
    verdict = "tight";
    message = "Very little is left. Check debts, one-off costs and the household's needs carefully before deciding.";
  } else {
    verdict = "affordable";
    message = "There is money left after essentials. Likely affordable, but check against your council's policy and record your reasoning.";
  }
  return { income, rent, bills, essentials, residual, lhaMonthly, shortfall, verdict, message };
}
