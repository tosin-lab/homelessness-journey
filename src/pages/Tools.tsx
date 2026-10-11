import { Link } from "react-router";

const TOOLS = [
  { to: "/tools/duty-finder", title: "Which duty applies?", text: "Answer a few questions to see whether prevention, relief, interim accommodation or the main duty applies, and what to do next.", c: "var(--forest)" },
  { to: "/tools/notice-checker", title: "Notice checker", text: "Section 8 or Section 21? Private or social landlord? See whether the client is threatened with homelessness after the May 2026 changes.", c: "var(--terra)" },
  { to: "/tools/affordability", title: "Affordability calculator", text: "Income minus rent, bills and essentials. See what's left and any shortfall against the LHA rate.", c: "var(--gold)" },
  { to: "/tools/deadlines", title: "Deadline calculator", text: "Work out day 56, review deadlines, the 8-week review decision, appeal dates and the 6-week B&B limit.", c: "var(--slate)" }
];

export default function Tools() {
  return (
    <>
      <h1 className="page-title">Practical tools</h1>
      <p className="lede">Quick helpers for real casework and training exercises. They're a guide, not a decision: always check with a senior officer and your council's policies.</p>
      <div className="grid cols-2">
        {TOOLS.map(t => (
          <Link key={t.to} to={t.to} className="card feature" style={{ ["--c" as string]: t.c }}>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
