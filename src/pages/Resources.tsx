import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { GLOSSARY } from "../data/glossary";
import { HELPLINES, LETTER_CHECKLIST, LINKS } from "../data/resources";
import { K, useStored } from "../lib/store";

export default function Resources() {
  const [filter, setFilter] = useState("");
  const [ticked, setTicked] = useStored<string[]>(K.letters, []);
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  const f = filter.toLowerCase();
  const gl = GLOSSARY.filter(([t, d]) => !f || t.toLowerCase().includes(f) || d.toLowerCase().includes(f));
  const toggle = (k: string) => setTicked(p => (p.includes(k) ? p.filter(x => x !== k) : [...p, k]));

  return (
    <>
      <h1 className="page-title">Resources</h1>
      <p className="lede">Decision letter checklist, glossary, official guidance and useful contacts. Need something to print? Try the <Link to="/handout">one-page handout</Link>.</p>
      <nav className="row no-print" aria-label="On this page" style={{ marginBottom: 14 }}>
        <a className="chip" href="#letters">Decision letters</a>
        <a className="chip" href="#glossary">Glossary</a>
        <a className="chip" href="#links">Official guidance</a>
        <a className="chip" href="#help">Helplines</a>
      </nav>

      <section id="letters" className="card pad" style={{ marginBottom: 18 }}>
        <div className="row"><h2 style={{ margin: 0 }}>Decision letter checklist</h2><span style={{ flex: 1 }} /><button className="btn small no-print" onClick={() => setTicked([])}>Clear ticks</button></div>
        <p className="muted">Use this when writing or checking a decision letter. Good letters are less likely to be overturned at review.</p>
        <div className="grid cols-2">
          {LETTER_CHECKLIST.map(g => (
            <div key={g.title}>
              <h3 style={{ fontSize: 17, margin: "6px 0" }}>{g.title}</h3>
              <div className="checks">
                {g.items.map(it => {
                  const k = `${g.title}|${it}`;
                  return (
                    <label key={k} className={ticked.includes(k) ? "done" : ""}>
                      <input type="checkbox" checked={ticked.includes(k)} onChange={() => toggle(k)} />
                      <span>{it}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="glossary" className="card pad" style={{ marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Glossary</h2>
        <label className="field no-print" style={{ maxWidth: 360 }}>Filter terms
          <input type="search" value={filter} onChange={e => setFilter(e.target.value)} placeholder="e.g. priority" />
        </label>
        <dl className="gloss">
          {gl.map(([t, d]) => (<div key={t} style={{ display: "contents" }}><dt>{t}</dt><dd>{d}</dd></div>))}
        </dl>
        {!gl.length && <p className="muted">No matching terms.</p>}
      </section>

      <section id="links" className="card pad" style={{ marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Official guidance and further reading</h2>
        <ul className="tidy">
          {LINKS.map(l => (
            <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer">{l.title}</a> <span className="muted">: {l.note}</span></li>
          ))}
        </ul>
      </section>

      <section id="help" className="card pad">
        <h2 style={{ marginTop: 0 }}>Helplines</h2>
        <ul className="tidy">{HELPLINES.map(h => <li key={h.name}><b>{h.name}:</b> {h.detail}</li>)}</ul>
      </section>
    </>
  );
}
