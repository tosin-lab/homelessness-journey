import { useState } from "react";
import { Link } from "react-router";
import { ALL_QUESTIONS } from "../data/learning";
import { K, useStored } from "../lib/store";
import type { QuizQuestion } from "../types";

const LENGTH = 15;

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export default function FinalTest() {
  const [qs, setQs] = useState<QuizQuestion[]>(() => shuffle(ALL_QUESTIONS).slice(0, LENGTH));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useStored<number | null>(K.bestTest, null);

  const q = qs[i];
  const choose = (oi: number) => {
    if (picked !== null) return;
    setPicked(oi);
    if (oi === q.answer) setScore(s => s + 1);
  };
  const next = () => {
    if (i < qs.length - 1) { setI(i + 1); setPicked(null); return; }
    const pct = Math.round((score / qs.length) * 100);
    setBest(b => (b === null || pct > b ? pct : b));
    setDone(true);
  };
  const restart = () => { setQs(shuffle(ALL_QUESTIONS).slice(0, LENGTH)); setI(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <section className="card pad" style={{ maxWidth: 720 }}>
        <h1 className="page-title">Your score: {score} / {qs.length} ({pct}%)</h1>
        <p className="lede">{pct >= 80 ? "Excellent. You're ready to talk confidently about the journey." : pct >= 60 ? "Good. Review the stages you found tricky and try again." : "Keep going. Explore the journey and case walkthroughs, then have another go."}</p>
        <p className="muted">Best score on this device: {best ?? pct}%</p>
        <div className="row">
          <button className="btn primary" onClick={restart}>Try a new test</button>
          <Link className="btn" to="/journey">Back to the journey</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/learn">← Learn</Link></p>
      <h1 className="page-title">Knowledge test</h1>
      <div className="progress-bar" aria-hidden="true" style={{ maxWidth: 720, margin: "8px 0 14px" }}><i style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <section className="card pad" style={{ maxWidth: 720 }}>
        <p className="muted" style={{ margin: 0 }}>Question {i + 1} of {qs.length} · Score {score}</p>
        <h2 className="wizard-q" style={{ marginTop: 8 }}>{q.q}</h2>
        <div className="quiz-opts">
          {q.options.map((o, oi) => {
            const cls = picked === null ? "" : oi === q.answer ? "right" : oi === picked ? "wrong" : "";
            return <button key={oi} className={cls} disabled={picked !== null} onClick={() => choose(oi)} style={{ fontSize: 15, padding: "11px 13px" }}>{o}</button>;
          })}
        </div>
        {picked !== null && (
          <>
            <p className="explain" aria-live="polite"><b>{picked === q.answer ? "Correct." : "Not quite."}</b> {q.explain}</p>
            <button className="btn primary" onClick={next} autoFocus>{i < qs.length - 1 ? "Next question" : "See my score"}</button>
          </>
        )}
      </section>
    </>
  );
}
