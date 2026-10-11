import { Link } from "react-router";
import { STAGES } from "../data/stages";
import { ALL_QUESTIONS, FLASHCARDS, STAGE_QUIZ } from "../data/learning";
import { K, useStored, type QuizScores } from "../lib/store";
import type { StageId } from "../types";

export default function Learn() {
  const [quiz] = useStored<QuizScores>(K.quiz, {});
  const [best] = useStored<number | null>(K.bestTest, null);
  const [known] = useStored<number[]>(K.known, []);
  const ids = Object.keys(STAGE_QUIZ) as StageId[];

  return (
    <>
      <h1 className="page-title">Learn and practise</h1>
      <p className="lede">Check what you know, then practise the questions you're likely to be asked at interview.</p>
      <div className="grid cols-2">
        <Link to="/learn/test" className="card feature" style={{ ["--c" as string]: "var(--forest)" }}>
          <h3>Knowledge test</h3>
          <p>15 random questions from a bank of {ALL_QUESTIONS.length}. Get feedback on each one and a score at the end.{best !== null && <> Your best: <b>{best}%</b>.</>}</p>
        </Link>
        <Link to="/learn/flashcards" className="card feature" style={{ ["--c" as string]: "var(--slate)" }}>
          <h3>Interview flashcards</h3>
          <p>{FLASHCARDS.length} common interview questions with the key points for a strong answer. You know {known.length} so far.</p>
        </Link>
      </div>
      <section className="card pad" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0, fontSize: 20 }}>Stage quizzes</h2>
        <p className="muted">Each stage has a quick check at the bottom of its panel.</p>
        <div className="grid cols-3">
          {ids.map(id => {
            const s = quiz[id];
            return (
              <Link key={id} to={`/journey/${id}`} className={`card pad t-${STAGES[id].type}`} style={{ textDecoration: "none", color: "var(--ink)", borderTop: "4px solid var(--c)" }}>
                <b>{STAGES[id].title}</b><br />
                <span className="muted" style={{ fontSize: 13 }}>{s ? `Done: ${s.correct}/${s.total}` : "Not tried yet"}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
