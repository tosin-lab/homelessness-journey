import { useRef, useState, type RefObject } from "react";
import { Link } from "react-router";
import { DUTY_TREE, type DQuestion, type DResult } from "../data/dutyTree";
import { STAGES } from "../data/stages";

interface Step { nodeId: string; answer?: string; note?: string }

export default function DutyFinder() {
  const [trail, setTrail] = useState<Step[]>([{ nodeId: "start" }]);
  const headRef = useRef<HTMLHeadingElement>(null);
  const cur = DUTY_TREE[trail[trail.length - 1].nodeId];

  const go = (next: string, answer: string, note?: string) => {
    setTrail(t => {
      const copy = t.slice();
      copy[copy.length - 1] = { ...copy[copy.length - 1], answer, note };
      return [...copy, { nodeId: next }];
    });
    setTimeout(() => headRef.current?.focus(), 0);
  };
  const back = () => setTrail(t => (t.length > 1 ? [...t.slice(0, -2), { nodeId: t[t.length - 2].nodeId }] : t));
  const restart = () => setTrail([{ nodeId: "start" }]);

  const answered = trail.slice(0, -1);
  const notes = answered.map(s => s.note).filter(Boolean) as string[];

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/tools">← Tools</Link></p>
      <h1 className="page-title">Which duty applies?</h1>
      <p className="lede">Answer each question in order. You can go back at any point.</p>
      <div className="tool-layout">
        <section className="card pad" aria-live="polite">
          {cur.kind === "q" ? (
            <Question q={cur} onAnswer={go} headRef={headRef} />
          ) : (
            <Result r={cur} notes={notes} onContinue={go} headRef={headRef} />
          )}
          <div className="row" style={{ marginTop: 16 }}>
            <button className="btn small" onClick={back} disabled={trail.length < 2}>Back</button>
            <button className="btn small" onClick={restart} disabled={trail.length < 2}>Start again</button>
          </div>
        </section>
        <aside className="card pad">
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Your answers</h2>
          {answered.length ? (
            <div className="trail">
              {answered.map((s, i) => {
                const n = DUTY_TREE[s.nodeId];
                return (
                  <div key={i}>
                    {n.kind === "q" ? n.text : (n as DResult).title}<br />
                    <b>{s.answer}</b>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">Your answers will appear here.</p>
          )}
          <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>This is a training aid. Real decisions need proper inquiries, evidence and, where needed, a senior officer's sign-off.</p>
        </aside>
      </div>
    </>
  );
}

function Question({ q, onAnswer, headRef }: { q: DQuestion; onAnswer: (n: string, a: string, note?: string) => void; headRef: RefObject<HTMLHeadingElement | null> }) {
  return (
    <>
      <h2 className="wizard-q" tabIndex={-1} ref={headRef}>{q.text}</h2>
      {q.help && <p className="muted">{q.help}</p>}
      <div className="answers">
        {q.options.map(o => <button key={o.label} onClick={() => onAnswer(o.next, o.label, o.note)}>{o.label}</button>)}
      </div>
    </>
  );
}

function Result({ r, notes, onContinue, headRef }: { r: DResult; notes: string[]; onContinue: (n: string, a: string) => void; headRef: RefObject<HTMLHeadingElement | null> }) {
  const tone = r.tone === "good" ? "good" : r.tone === "warn" ? "warn" : "info";
  return (
    <>
      <div className={`notice ${tone}`}>
        <div className="tag-line">Result</div>
        <h2 className="wizard-q" tabIndex={-1} ref={headRef} style={{ margin: "4px 0" }}>{r.title}</h2>
        <p style={{ margin: 0 }}>{r.summary}</p>
      </div>
      <p style={{ margin: "12px 0 6px" }}><b>The law:</b> {r.sections.join(", ")}</p>
      <h3 style={{ fontSize: 16, margin: "12px 0 6px" }}>What to do</h3>
      <ul className="tidy">{r.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
      {notes.map((n, i) => <p key={i} className="notice warn" style={{ marginTop: 10 }}>{n}</p>)}
      <div className="row" style={{ marginTop: 14 }}>
        <Link to={`/journey/${r.stage}`} className="btn">See this stage: {STAGES[r.stage].title}</Link>
        {r.cont && <button className="btn primary" onClick={() => onContinue(r.cont!.next, r.cont!.label)}>{r.cont.label} →</button>}
      </div>
    </>
  );
}
