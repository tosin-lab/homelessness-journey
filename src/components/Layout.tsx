import { useEffect, useState, type FormEvent } from "react";
import logo from "../assets/logo.svg";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { CONTENT_DATE } from "../data/stages";

const NAV = [
  ["/journey", "Journey"],
  ["/cases", "Cases"],
  ["/tools", "Tools"],
  ["/learn", "Learn"],
  ["/resources", "Resources"]
] as const;

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState("");

  // Scroll to top and move focus when moving between sections (not between stages of the same page)
  const section = loc.pathname.split("/")[1] ?? "";
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [section]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-head">
        <div className="inner">
          <Link to="/" className="brand" aria-label="Homelessness Journey home">
            <img src={logo} alt="" />
            <span>Homelessness Journey<small>Housing officer guide · England</small></span>
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
            ))}
          </nav>
          <form className="head-search" role="search" onSubmit={submit}>
            <label htmlFor="q" className="sr-only">Search</label>
            <input id="q" type="search" placeholder="Search e.g. 'Section 8'" value={q} onChange={e => setQ(e.target.value)} />
            <button type="submit">Search</button>
            <Link to="/present" className="icon-btn" title="Trainer presentation mode">Present</Link>
          </form>
        </div>
      </header>
      <main id="main" className="page" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-foot">
        Training aid for England, correct as at {CONTENT_DATE}: Housing Act 1996 Part 7, as amended by the Homelessness
        Reduction Act 2017 and the Renters' Rights Act 2025. Not legal advice: always check the Homelessness Code of
        Guidance and your council's own policies. Your progress is saved on this device only.{" "}
        <a href="/__signout">Sign out</a>
      </footer>
    </>
  );
}
