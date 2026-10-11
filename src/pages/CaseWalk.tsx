import { useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import Flowchart from "../components/Flowchart";
import StageDetail from "../components/StageDetail";
import { CASES } from "../data/cases";
import { STAGES } from "../data/stages";
import NotFound from "./NotFound";

export default function CaseWalk() {
  const { caseId } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const c = CASES.find(x => x.id === caseId);
  const boxRef = useRef<HTMLDivElement>(null);
  const total = c?.steps.length ?? 0;
  const step = Math.min(Math.max(Number(params.get("step") ?? "1") || 1, 1), Math.max(total, 1)) - 1;

  useEffect(() => {
    if (!c) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight" && step < total - 1) setParams({ step: String(step + 2) });
      if (e.key === "ArrowLeft" && step > 0) setParams({ step: String(step) });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [c, step, total, setParams]);

  if (!c) return <NotFound />;
  const [stageId, text] = c.steps[step];
  const visited = new Set(c.steps.slice(0, step + 1).map(s => s[0]));
  const last = step === total - 1;

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/cases">← All cases</Link></p>
      <h1 className="page-title">Case: {c.name}</h1>
      <p className="lede">{c.blurb} Use the buttons, or the left and right arrow keys.</p>
      <div className="casebox" ref={boxRef} aria-live="polite" style={{ borderRadius: 12, marginBottom: 16 }}>
        <div className="row">
          <span className="who">Step {step + 1} of {total}</span>
          <span className="steps-dots" aria-hidden="true">{c.steps.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</span>
        </div>
        <h2>{STAGES[stageId].title}</h2>
        <p style={{ fontSize: 16, maxWidth: 900 }}>{text}</p>
        {last && <p style={{ fontSize: 16 }}><b>Lesson:</b> {c.lesson}</p>}
        <div className="row">
          <button className="btn" disabled={step === 0} onClick={() => setParams({ step: String(step) })}>Back</button>
          {last ? (
            <Link className="btn primary" to="/cases" style={{ borderColor: "#fff" }}>Finish</Link>
          ) : (
            <button className="btn primary" style={{ borderColor: "#fff" }} onClick={() => setParams({ step: String(step + 2) })}>Next step</button>
          )}
        </div>
      </div>
      <div className="journey">
        <Flowchart onSelect={id => nav(`/journey/${id}`)} visited={visited} current={stageId} />
        <aside className="card panel">
          <StageDetail id={stageId} showNext={false} showQuiz={false} />
        </aside>
      </div>
    </>
  );
}
