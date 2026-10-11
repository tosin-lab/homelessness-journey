import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Flowchart from "../components/Flowchart";
import StageDetail from "../components/StageDetail";
import { KEY_TIMES, ROLES, STAGES } from "../data/stages";
import { K, useStored } from "../lib/store";
import type { RoleId, StageId } from "../types";

export default function Journey() {
  const { stageId } = useParams();
  const nav = useNavigate();
  const selected = stageId && stageId in STAGES ? (stageId as StageId) : null;
  const [role, setRole] = useState<RoleId | null>(null);
  const [viewed, setViewed] = useStored<string[]>(K.viewed, []);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selected && !viewed.includes(selected)) setViewed(v => [...v, selected]);
  }, [selected, viewed, setViewed]);

  const select = (id: StageId) => {
    nav(`/journey/${id}`);
    if (window.innerWidth <= 1150) setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <>
      <h1 className="page-title">The homelessness customer journey</h1>
      <p className="lede">Click any stage to see what the housing officer does, who's involved and the law behind it. Stages marked <span className="pill" style={{ color: "var(--slate)" }}>Reviewable</span> involve decisions the client can ask the council to review.</p>
      <div className="times">{KEY_TIMES.map(([b, t], i) => <div className="time" key={i}><b>{b}</b>{t}</div>)}</div>
      <div className="row no-print" style={{ marginBottom: 12 }} role="group" aria-label="Highlight a role">
        <span className="muted" style={{ fontWeight: 600, fontSize: 13.5 }}>Highlight a role:</span>
        {(Object.keys(ROLES) as RoleId[]).map(r => (
          <button key={r} className={`chip ${role === r ? "on" : ""}`} aria-pressed={role === r} onClick={() => setRole(role === r ? null : r)}>{ROLES[r]}</button>
        ))}
      </div>
      <div className="journey">
        <Flowchart selected={selected} onSelect={select} role={role} viewed={new Set(viewed)} showStart={!selected} />
        <aside className="card panel" ref={panelRef} aria-live="polite">
          {selected ? (
            <StageDetail id={selected} />
          ) : (
            <div className="pad">
              <h2 style={{ marginTop: 0 }}>How to use this guide</h2>
              <ol>
                <li>Click any stage, starting with <b>Approach or referral</b>.</li>
                <li>See what the housing officer does, who's involved and the law.</li>
                <li>Tick off the officer's tasks and try the quick check.</li>
                <li>Use <b>Highlight a role</b> to see where each job fits in.</li>
                <li>Try a <Link to="/cases">case walkthrough</Link> to follow a client.</li>
              </ol>
              <button className="btn primary" onClick={() => select("approach")}>Start at the beginning →</button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
