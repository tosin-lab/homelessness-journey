import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PRESENT_ORDER, ROLES, STAGES } from "../data/stages";

export default function Present() {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const s = STAGES[PRESENT_ORDER[i]];
  const n = PRESENT_ORDER.length;

  const go = useCallback((d: number) => setI(x => Math.min(n - 1, Math.max(0, x + d))), [n]);
  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    nav("/journey");
  }, [nav]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
      if (e.key === "Escape" && !document.fullscreenElement) exit();
      if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.().catch(() => {});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, exit]);

  return (
    <div className="present" role="region" aria-label="Trainer presentation">
      <div className="bar">
        <b style={{ fontFamily: "var(--serif)" }}>Homelessness Journey · Trainer mode</b>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 14, color: "#dce8cc" }}>{i + 1} / {n} · arrow keys to move · F for full screen</span>
        <button className="btn small" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>Full screen</button>
        <button className="btn small" onClick={exit}>Exit</button>
      </div>
      <div className="slide" aria-live="polite">
        <div>
          <div style={{ color: "var(--mosslt)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.tag}{s.law ? ` · ${s.law}` : ""}</div>
          <h2>{s.title}</h2>
          <p className="plain">{s.plain}</p>
          <div className="box" style={{ marginTop: 18 }}>
            <h3>Interview tip</h3>
            <p style={{ margin: 0, fontSize: 18 }}>{s.tip}</p>
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="box">
            <h3>What the officer does</h3>
            <ul style={{ margin: 0, paddingLeft: 22 }}>{s.officer.map((o, k) => <li key={k}>{o}</li>)}</ul>
          </div>
          <div className="box">
            <h3>Who's involved · The law</h3>
            <p style={{ margin: "0 0 8px", fontSize: 16 }}>{s.roles.map(r => ROLES[r]).join(" · ")}</p>
            <p style={{ margin: 0, fontSize: 16 }}>{s.lawList.map(l => l[0]).join(" · ")}</p>
          </div>
        </div>
      </div>
      <div className="bar" style={{ justifyContent: "center", gap: 14 }}>
        <button className="btn" onClick={() => go(-1)} disabled={i === 0}>← Back</button>
        <button className="btn primary" onClick={() => go(1)} disabled={i === n - 1}>Next →</button>
      </div>
    </div>
  );
}
