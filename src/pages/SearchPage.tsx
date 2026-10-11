import { Link, useSearchParams } from "react-router";
import { excerpt, search } from "../lib/search";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const results = search(q);

  return (
    <>
      <h1 className="page-title">Search</h1>
      <form role="search" onSubmit={e => e.preventDefault()} style={{ maxWidth: 560, marginBottom: 16 }}>
        <label className="field">Search stages, cases, tools, glossary and interview questions
          <input type="search" value={q} onChange={e => setParams({ q: e.target.value }, { replace: true })} autoFocus />
        </label>
      </form>
      {q && <p className="muted" aria-live="polite">{results.length} result{results.length === 1 ? "" : "s"} for "{q}"</p>}
      <div className="grid" style={{ maxWidth: 820 }}>
        {results.map((r, i) => (
          <Link key={i} to={r.href} className="card pad" style={{ textDecoration: "none", color: "var(--ink)" }}>
            <span className="pill">{r.type}</span>
            <h2 style={{ fontSize: 18, margin: "6px 0 4px", color: "var(--forest)" }}>{r.title}</h2>
            <p className="muted" style={{ margin: 0, fontSize: 14 }}>{excerpt(r.text, q)}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
