import { Link } from "react-router";
import { KEY_TIMES, STAGES, STAGE_ORDER } from "../data/stages";
import { STAGE_QUIZ, FLASHCARDS } from "../data/learning";
import { K, resetAll, useStored, type QuizScores, type Ticks } from "../lib/store";
import { accountsEnabled } from "../lib/account";

const FEATURES = [
  { to: "/journey", title: "Explore the journey", text: "A clickable flowchart from first approach to the end of the main duty, reviews and appeals.", c: "var(--forest)" },
  { to: "/cases", title: "Walk through a case", text: "Follow seven clients step by step, from a prevention success to a refused offer.", c: "var(--terra)" },
  { to: "/tools", title: "Practical tools", text: "Which duty applies, notice checker, affordability and deadline calculators.", c: "var(--gold)" },
  { to: "/learn", title: "Learn and practise", text: "Quick quizzes, a knowledge test and interview flashcards with model answers.", c: "var(--slate)" }
];

export default function Home() {
  const [viewed] = useStored<string[]>(K.viewed, []);
  const [ticks] = useStored<Ticks>(K.ticks, {});
  const [quiz] = useStored<QuizScores>(K.quiz, {});
  const [best] = useStored<number | null>(K.bestTest, null);
  const [known] = useStored<number[]>(K.known, []);

  const totalTasks = STAGE_ORDER.reduce((n, id) => n + STAGES[id].officer.length, 0);
  const doneTasks = Object.values(ticks).reduce((n, a) => n + a.length, 0);
  const quizTotal = Object.keys(STAGE_QUIZ).length;
  const quizDone = Object.keys(quiz).length;
  const started = viewed.length + doneTasks + quizDone + known.length > 0 || best !== null;

  return (
    <>
      <section className="hero">
        <div>
          <h1>Learn the homelessness journey, stage by stage</h1>
          <p>A plain-English guide for new housing officers in England: what happens at each stage, what you do, who's involved and the law behind it.</p>
          <div className="row">
            <Link to="/journey" className="btn primary">Start the journey →</Link>
            <Link to="/cases" className="btn">Walk through a case</Link>
            <Link to="/tools/duty-finder" className="btn">Which duty applies?</Link>
          </div>
        </div>
        <div className="mini-flow" aria-label="The journey in brief">
          {["Approach or referral", "Triage", "Assessment & PHP", "Prevention or relief (56 days)", "Main duty decision", "Temporary accommodation", "Settled home, or review"].map((s, i) => (
            <div key={i} style={{ borderColor: i === 3 ? "var(--moss)" : i === 4 ? "var(--gold)" : "var(--forest)" }}>{i + 1}. {s}</div>
          ))}
        </div>
      </section>

      <div className="grid cols-4" style={{ marginTop: 18 }}>
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="card feature" style={{ ["--c" as string]: f.c }}>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </Link>
        ))}
      </div>

      <div className="grid cols-2" style={{ marginTop: 18 }}>
        <section className="card pad">
          <h2 style={{ marginTop: 0, fontSize: 20 }}>Key numbers</h2>
          <div className="times">{KEY_TIMES.map(([b, t], i) => <div className="time" key={i}><b>{b}</b>{t}</div>)}</div>
          <div className="notice info">
            <b>New in 2026:</b> Section 21 'no-fault' evictions ended for private landlords on 1 May 2026. A valid Section 8
            notice ending within 56 days now means a private tenant is threatened with homelessness.{" "}
            <Link to="/tools/notice-checker">Try the notice checker</Link>.
          </div>
        </section>
        <section className="card pad" aria-labelledby="prog">
          <h2 id="prog" style={{ marginTop: 0, fontSize: 20 }}>Your progress</h2>
          {started ? (
            <>
              <div className="grid cols-2">
                <div className="stat"><b>{viewed.length}/{STAGE_ORDER.length}</b><span>stages explored</span></div>
                <div className="stat"><b>{doneTasks}/{totalTasks}</b><span>officer tasks ticked</span></div>
                <div className="stat"><b>{quizDone}/{quizTotal}</b><span>stage quizzes done</span></div>
                <div className="stat"><b>{best === null ? "–" : `${best}%`}</b><span>best test score</span></div>
                <div className="stat"><b>{known.length}/{FLASHCARDS.length}</b><span>flashcards known</span></div>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>{accountsEnabled ? "Saved to your account, so it follows you across devices." : "Saved on this device."}</p>
              <button className="btn small" onClick={() => { if (confirm("Clear all your progress? This can't be undone.")) resetAll(); }}>Reset progress</button>
            </>
          ) : (
            <p className="muted">Nothing yet. Explore a stage, tick off tasks or try a quiz, and your progress will show here.</p>
          )}
        </section>
      </div>
    </>
  );
}
