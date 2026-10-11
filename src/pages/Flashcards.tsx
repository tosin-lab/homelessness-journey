import { useState } from "react";
import { Link } from "react-router";
import { FLASHCARDS } from "../data/learning";
import { K, useStored } from "../lib/store";

export default function Flashcards() {
  const [known, setKnown] = useStored<number[]>(K.known, []);
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const deck = FLASHCARDS.map((c, idx) => ({ ...c, idx })).filter(c => !onlyUnknown || !known.includes(c.idx));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck[Math.min(pos, deck.length - 1)];

  const move = (d: number) => { setFlipped(false); setPos(p => (p + d + deck.length) % deck.length); };
  const mark = (k: boolean) => {
    if (!card) return;
    setKnown(prev => (k ? [...new Set([...prev, card.idx])] : prev.filter(x => x !== card.idx)));
    if (!(onlyUnknown && k)) move(1); else setFlipped(false);
  };

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/learn">← Learn</Link></p>
      <h1 className="page-title">Interview flashcards</h1>
      <p className="lede">Say your answer out loud, then flip the card to compare with the key points.</p>
      <div className="row" style={{ marginBottom: 10 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 14 }}>
          <input type="checkbox" checked={onlyUnknown} onChange={e => { setOnlyUnknown(e.target.checked); setPos(0); setFlipped(false); }} /> Only show cards I don't know yet
        </label>
        <span className="muted" style={{ fontSize: 14 }}>Known: {known.length}/{FLASHCARDS.length}</span>
      </div>
      <div style={{ maxWidth: 760 }}>
        <div className="progress-bar" aria-hidden="true" style={{ marginBottom: 12 }}><i style={{ width: `${(known.length / FLASHCARDS.length) * 100}%` }} /></div>
        {card ? (
          <>
            <button className={`card flash ${flipped ? "back" : ""}`} onClick={() => setFlipped(f => !f)} aria-label={flipped ? "Show the question" : "Show the answer"}>
              <span className="muted" style={{ fontSize: 13 }}>Card {Math.min(pos, deck.length - 1) + 1} of {deck.length} · {flipped ? "Key points" : "Question"} · click to flip</span>
              <span className="q" style={{ marginTop: 8 }}>{card.q}</span>
              {flipped && <ul className="tidy" style={{ marginTop: 12, fontSize: 16 }}>{card.points.map((p, i) => <li key={i}>{p}</li>)}</ul>}
            </button>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => move(-1)}>← Previous</button>
              <button className="btn" onClick={() => move(1)}>Next →</button>
              <span style={{ flex: 1 }} />
              <button className="btn" onClick={() => mark(false)}>Practise again</button>
              <button className="btn primary" onClick={() => mark(true)}>I know this</button>
            </div>
          </>
        ) : (
          <div className="notice good">You know all the cards. <button className="btn small" onClick={() => setOnlyUnknown(false)}>Show all cards</button></div>
        )}
      </div>
    </>
  );
}
