import { CONTENT_DATE, KEY_TIMES } from "../data/stages";

export default function Handout() {
  return (
    <>
      <div className="row no-print" style={{ marginBottom: 12, maxWidth: 980, marginInline: "auto" }}>
        <p className="muted" style={{ margin: 0 }}>A one-page summary to print or save as PDF.</p>
        <span style={{ flex: 1 }} />
        <button className="btn primary" onClick={() => window.print()}>Print or save as PDF</button>
      </div>
      <article className="handout">
        <h1>The homelessness journey: one-page guide</h1>
        <p className="muted" style={{ margin: "0 0 8px", fontSize: 13 }}>England · correct as at {CONTENT_DATE} · Housing Act 1996 Part 7, Homelessness Reduction Act 2017, Renters' Rights Act 2025</p>
        <div className="cols">
          <div>
            <h2>The journey</h2>
            <ol>
              <li><b>Approach or referral:</b> self, or Duty to Refer. Never turn people away.</li>
              <li><b>Triage:</b> where tonight? See the notice. Spot risk. Interim accommodation if needed.</li>
              <li><b>Assessment & PHP:</b> check the tests, agree steps for both sides.</li>
              <li><b>Prevention (threatened) or relief (homeless):</b> 56 days each.</li>
              <li><b>Main duty decision:</b> eligible, homeless, priority need, not intentional.</li>
              <li><b>Temporary accommodation:</b> suitable, close to home where possible.</li>
              <li><b>Ending the main duty:</b> suitable final offer, social or private rented.</li>
              <li><b>Review (21 days) and appeal:</b> for any negative decision.</li>
            </ol>
            <h2>The five tests</h2>
            <ul>
              <li>Eligibility (s.185)</li><li>Homelessness (s.175)</li><li>Priority need (s.189)</li><li>Intentionality (s.191)</li><li>Local connection (s.199)</li>
            </ul>
            <h2>The three duties</h2>
            <ul>
              <li><b>Prevention (s.195):</b> help keep or find a home. Regardless of priority need.</li>
              <li><b>Relief (s.189B):</b> help find a home for 6+ months. Regardless of priority need.</li>
              <li><b>Main duty (s.193):</b> secure suitable accommodation until the duty ends.</li>
            </ul>
          </div>
          <div>
            <h2>Key numbers</h2>
            <ul>{KEY_TIMES.map(([b, t], i) => <li key={i}><b>{b}:</b> {t}</li>)}</ul>
            <h2>New since 1 May 2026</h2>
            <ul>
              <li>No new Section 21 notices from private landlords.</li>
              <li>Valid Section 8 notice ending within 56 days = threatened.</li>
              <li>Housing association tenants can still get a Section 21 for now.</li>
              <li>Private rented offers are assured periodic tenancies.</li>
            </ul>
            <h2>Affordability & suitability</h2>
            <ul>
              <li>Income minus rent, bills and essentials: enough left to live on?</li>
              <li>Right size, location, health needs, safety checks.</li>
              <li>B&B for families: 6 weeks maximum.</li>
            </ul>
            <h2>Every decision letter</h2>
            <ul>
              <li>Clear decision and reasons</li><li>Review rights and the 21-day deadline</li><li>Where to get independent advice</li>
            </ul>
            <h2>Domestic abuse</h2>
            <ul>
              <li>Safety first. Automatic priority need.</li>
              <li>DASH risk checklist; MARAC and IDVA if high risk.</li>
              <li>Never refer back to an area of risk.</li>
            </ul>
          </div>
        </div>
      </article>
    </>
  );
}
