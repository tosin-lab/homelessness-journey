import { useMemo, useState } from "react";
import { Link } from "react-router";
import { assessAffordability, type Frequency } from "../lib/afford";

const INCOME = ["Wages (after tax)", "Universal Credit (including housing element)", "Child Benefit", "Other income"];
const BILLS = ["Council tax", "Energy (gas and electricity)", "Water", "Phone and internet"];
const ESSENTIALS = ["Food and household", "Travel", "Children's costs and childcare", "Debt repayments", "Other essentials"];

const gbp = (n: number) => n.toLocaleString("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const num = (s: string) => (s.trim() === "" ? 0 : Number(s));

function Money({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = "m-" + label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="money">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" min="0" step="1" placeholder="0" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export default function Affordability() {
  const [freq, setFreq] = useState<Frequency>("monthly");
  const [income, setIncome] = useState(INCOME.map(() => ""));
  const [rent, setRent] = useState("");
  const [bills, setBills] = useState(BILLS.map(() => ""));
  const [ess, setEss] = useState(ESSENTIALS.map(() => ""));
  const [lha, setLha] = useState("");
  const [minRes, setMinRes] = useState("");

  const r = useMemo(() => assessAffordability({
    frequency: freq,
    income: income.map(num), rent: num(rent), bills: bills.map(num), essentials: ess.map(num),
    lhaWeekly: num(lha) || undefined, minResidual: num(minRes) || undefined
  }), [freq, income, rent, bills, ess, lha, minRes]);

  const setAt = (arr: string[], set: (a: string[]) => void, i: number) => (v: string) => set(arr.map((x, j) => (j === i ? v : x)));
  const example = () => {
    setFreq("monthly");
    setIncome(["1200", "650", "102", "0"]); setRent("1050");
    setBills(["130", "110", "45", "30"]); setEss(["420", "80", "120", "40", "30"]); setLha("200"); setMinRes("");
  };
  const clear = () => { setIncome(INCOME.map(() => "")); setRent(""); setBills(BILLS.map(() => "")); setEss(ESSENTIALS.map(() => "")); setLha(""); setMinRes(""); };
  const tone = r.verdict === "unaffordable" ? "bad" : r.verdict === "tight" ? "warn" : r.verdict === "affordable" ? "good" : "info";

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/tools">← Tools</Link></p>
      <h1 className="page-title">Affordability calculator</h1>
      <p className="lede">A home that isn't affordable isn't suitable. Add up the household's income, take away rent, bills and essentials, and see what's left.</p>
      <div className="row no-print" style={{ marginBottom: 12 }}>
        <button className="btn small" onClick={example}>Fill with an example</button>
        <button className="btn small" onClick={clear}>Clear</button>
        <button className="btn small" onClick={() => window.print()}>Print</button>
      </div>
      <div className="tool-layout">
        <form className="card pad" onSubmit={e => e.preventDefault()}>
          <fieldset>
            <legend>Figures are</legend>
            <div className="radio-row">
              {([["monthly", "Monthly"], ["weekly", "Weekly"], ["fourweekly", "Every 4 weeks"]] as [Frequency, string][]).map(([v, l]) => (
                <label key={v}><input type="radio" name="f" checked={freq === v} onChange={() => setFreq(v)} /><span>{l}</span></label>
              ))}
            </div>
          </fieldset>
          <fieldset><legend>Income</legend>{INCOME.map((l, i) => <Money key={l} label={l} value={income[i]} onChange={setAt(income, setIncome, i)} />)}</fieldset>
          <fieldset><legend>Housing</legend><Money label="Rent (including service charges)" value={rent} onChange={setRent} /></fieldset>
          <fieldset><legend>Bills</legend>{BILLS.map((l, i) => <Money key={l} label={l} value={bills[i]} onChange={setAt(bills, setBills, i)} />)}</fieldset>
          <fieldset><legend>Essentials</legend>{ESSENTIALS.map((l, i) => <Money key={l} label={l} value={ess[i]} onChange={setAt(ess, setEss, i)} />)}</fieldset>
          <fieldset>
            <legend>Optional</legend>
            <Money label="LHA rate (weekly, from LHA Direct)" value={lha} onChange={setLha} />
            <Money label="Council's minimum left over (monthly)" value={minRes} onChange={setMinRes} />
          </fieldset>
        </form>
        <section className="card pad panel" aria-live="polite">
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Result (per month)</h2>
          <div className="kv">
            <span>Income</span><span>{gbp(r.income)}</span>
            <span>Rent</span><span>- {gbp(r.rent)}</span>
            <span>Bills</span><span>- {gbp(r.bills)}</span>
            <span>Essentials</span><span>- {gbp(r.essentials)}</span>
            <span className="tot">Left over</span><span className="tot">{gbp(r.residual)}</span>
          </div>
          <div className={`notice ${tone}`} style={{ marginTop: 14 }}>
            <div className="result-big">{r.verdict === "check" ? "Add figures" : r.verdict === "unaffordable" ? "Not affordable" : r.verdict === "tight" ? "Very tight" : "Likely affordable"}</div>
            <p style={{ margin: "4px 0 0" }}>{r.message}</p>
          </div>
          {r.lhaMonthly !== null && (
            <p style={{ marginTop: 12 }}>
              LHA covers about <b>{gbp(r.lhaMonthly)}</b> a month.{" "}
              {r.shortfall ? <>The household must find a <b>{gbp(r.shortfall)}</b> shortfall each month from other income. A Discretionary Housing Payment may help short term.</> : <>The rent is within the LHA rate.</>}
            </p>
          )}
          <p className="muted" style={{ fontSize: 13 }}>Weekly figures are converted using × 52 ÷ 12; four-weekly using × 13 ÷ 12. Record the calculation on the case file. Training aid only: follow your council's affordability policy.</p>
          <Link to="/journey/endmain" className="btn small no-print">Where affordability fits in</Link>
        </section>
      </div>
    </>
  );
}
