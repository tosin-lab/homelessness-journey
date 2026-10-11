import { Link } from "react-router";
import { CASES } from "../data/cases";
import { STAGES } from "../data/stages";

export default function Cases() {
  return (
    <>
      <h1 className="page-title">Case walkthroughs</h1>
      <p className="lede">Follow a client step by step. The flowchart lights up their route, and each step shows what the officer does at that stage.</p>
      <div className="grid cols-3">
        {CASES.map(c => (
          <Link key={c.id} to={`/cases/${c.id}`} className="card case-card" style={{ ["--c" as string]: c.colour }}>
            <b>{c.name}</b>
            <span>{c.blurb}</span>
            <p className="muted" style={{ fontSize: 12.5, margin: "8px 0 0" }}>
              {c.steps.length} steps · ends at {STAGES[c.steps[c.steps.length - 1][0]].title}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
