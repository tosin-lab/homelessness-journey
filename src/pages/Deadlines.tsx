import { useState } from "react";
import { Link } from "react-router";
import { addDays, formatUK, parseISO, relative, startOfDay } from "../lib/dates";

interface Calc {
  id: string;
  label: string;
  hint: string;
  days: number;
  result: string;
}

const CALCS: Calc[] = [
  { id: "duty", label: "Prevention or relief duty started", hint: "Day the duty began", days: 56, result: "56 days end" },
  { id: "notice", label: "Eviction notice ends", hint: "Date on the notice", days: -56, result: "Prevention should start by" },
  { id: "decision", label: "Decision letter received", hint: "Date the client was told", days: 21, result: "Review must be requested by" },
  { id: "review", label: "Review requested", hint: "Date the request was made", days: 56, result: "Review decision usually due (8 weeks)" },
  { id: "appeal", label: "Review decision received", hint: "Date the client was told", days: 21, result: "County court appeal deadline" },
  { id: "bnb", label: "Family placed in B&B", hint: "First night in B&B", days: 42, result: "6-week B&B limit reached" }
];

export default function Deadlines() {
  const [dates, setDates] = useState<Record<string, string>>({});
  const today = startOfDay(new Date());

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/tools">← Tools</Link></p>
      <h1 className="page-title">Deadline calculator</h1>
      <p className="lede">Enter a date to see the key deadline that follows. Useful for planning your caseload diary.</p>
      <section className="card pad" style={{ maxWidth: 900 }}>
        {CALCS.map(c => {
          const d = parseISO(dates[c.id]);
          const out = d ? addDays(d, c.days) : null;
          const overdue = out && out < today;
          return (
            <div className="deadline" key={c.id}>
              <label className="field" style={{ margin: 0 }}>{c.label}<span className="hint">{c.hint}</span>
                <input type="date" value={dates[c.id] ?? ""} onChange={e => setDates(s => ({ ...s, [c.id]: e.target.value }))} />
              </label>
              <div className="out" aria-live="polite">
                {out ? (
                  <>
                    {c.result}: <b>{formatUK(out)}</b><br />
                    <span className={overdue ? "" : "muted"} style={overdue ? { color: "var(--terra)", fontWeight: 600 } : undefined}>{relative(today, out)}</span>
                  </>
                ) : (
                  <span className="muted">{c.result}: add a date</span>
                )}
              </div>
            </div>
          );
        })}
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>Simple day counts for training. Some deadlines can be extended (for example, a council can accept a late review request), and review timescales vary by decision type.</p>
      </section>
    </>
  );
}
