import { useState } from "react";
import type { QuizQuestion } from "../types";

interface Props {
  questions: QuizQuestion[];
  onDone?: (correct: number, total: number) => void;
}

/** Shows all questions at once with instant feedback. Used for stage quizzes. */
export default function Quiz({ questions, onDone }: Props) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter(p => p !== null).length;
  const correct = picked.filter((p, i) => p === questions[i].answer).length;

  const choose = (qi: number, oi: number) => {
    if (picked[qi] !== null) return;
    const next = picked.map((p, i) => (i === qi ? oi : p));
    setPicked(next);
    if (next.every(p => p !== null)) {
      onDone?.(next.filter((p, i) => p === questions[i].answer).length, questions.length);
    }
  };

  return (
    <div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 14 }}>
          <p className="quiz-q">{q.q}</p>
          <div className="quiz-opts" role="group" aria-label={q.q}>
            {q.options.map((o, oi) => {
              const p = picked[qi];
              const cls = p === null ? "" : oi === q.answer ? "right" : oi === p ? "wrong" : "";
              return (
                <button key={oi} className={cls} disabled={p !== null} onClick={() => choose(qi, oi)}>
                  {o}
                </button>
              );
            })}
          </div>
          {picked[qi] !== null && (
            <p className="explain" aria-live="polite">
              <b>{picked[qi] === q.answer ? "Correct." : "Not quite."}</b> {q.explain}
            </p>
          )}
        </div>
      ))}
      {answered === questions.length && (
        <p className="notice good" aria-live="polite">You got {correct} out of {questions.length}.</p>
      )}
      {answered > 0 && (
        <button className="btn small" onClick={() => setPicked(questions.map(() => null))}>Try again</button>
      )}
    </div>
  );
}
