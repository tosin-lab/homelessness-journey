import { Link } from "react-router";
import { ROLES, STAGES } from "../data/stages";
import { STAGE_QUIZ } from "../data/learning";
import { K, useStored, type QuizScores, type Ticks } from "../lib/store";
import type { StageId } from "../types";
import Quiz from "./Quiz";

interface Props {
  id: StageId;
  showNext?: boolean;
  showQuiz?: boolean;
}

export default function StageDetail({ id, showNext = true, showQuiz = true }: Props) {
  const s = STAGES[id];
  const [ticks, setTicks] = useStored<Ticks>(K.ticks, {});
  const [, setQuiz] = useStored<QuizScores>(K.quiz, {});
  const done = new Set(ticks[id] ?? []);
  const questions = STAGE_QUIZ[id];

  const toggle = (i: number) => {
    setTicks(prev => {
      const cur = new Set(prev[id] ?? []);
      if (cur.has(i)) cur.delete(i); else cur.add(i);
      return { ...prev, [id]: [...cur] };
    });
  };

  return (
    <article className={`t-${s.type}`} aria-labelledby={`h-${id}`}>
      <header className="p-head">
        <div className="tag-line">{s.tag}{s.law ? ` · ${s.law}` : ""}</div>
        <h2 id={`h-${id}`}>{s.title}</h2>
        <p>{s.plain}</p>
      </header>
      <section className="sec">
        <h3>What the housing officer does</h3>
        <div className="checks">
          {s.officer.map((o, i) => (
            <label key={i} className={done.has(i) ? "done" : ""}>
              <input type="checkbox" checked={done.has(i)} onChange={() => toggle(i)} />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </section>
      {s.ends && (
        <section className="sec">
          <h3>How this ends</h3>
          <ul className="tidy">{s.ends.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </section>
      )}
      <section className="sec">
        <h3>Who's involved</h3>
        <div className="roles">{s.roles.map(r => <span key={r} className="role">{ROLES[r]}</span>)}</div>
      </section>
      <section className="sec">
        <h3>The law behind it</h3>
        <div className="lawlist">{s.lawList.map(([k, v], i) => <div key={i}><b>{k}</b> {v}</div>)}</div>
      </section>
      {s.times.length > 0 && (
        <section className="sec">
          <h3>Timescales</h3>
          <ul className="tidy">{s.times.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}
      {showNext && (
        <section className="sec">
          <h3>Where next?</h3>
          {s.next.length ? (
            <div className="nexts">{s.next.map(([to, label]) => <Link key={to} to={`/journey/${to}`}>→ {label}</Link>)}</div>
          ) : (
            <span className="muted">End of the journey.</span>
          )}
        </section>
      )}
      <section className="sec">
        <div className="tip"><b>Interview tip:</b> {s.tip}</div>
      </section>
      {showQuiz && questions && (
        <section className="sec">
          <h3>Quick check</h3>
          <Quiz key={id} questions={questions} onDone={(c, t) => setQuiz(prev => ({ ...prev, [id]: { correct: c, total: t } }))} />
        </section>
      )}
    </article>
  );
}
