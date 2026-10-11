import { useMemo, useState } from "react";
import { Link } from "react-router";
import { formatUK, parseISO, startOfDay } from "../lib/dates";
import { GROUNDS, RRA_DATE, checkNotice, type Ground, type Landlord, type NoticeType } from "../lib/notice";

const TONE: Record<string, string> = { threatened: "warn", "not-yet": "info", invalid: "bad", expired: "info", check: "info" };
const LABEL: Record<string, string> = {
  threatened: "Threatened with homelessness",
  "not-yet": "Not threatened yet",
  invalid: "Notice looks invalid",
  expired: "Notice can no longer be used",
  check: "Need more information"
};

function Radios<T extends string>({ name, value, onChange, options }: { name: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="radio-row">
      {options.map(([v, l]) => (
        <label key={v}>
          <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
          <span>{l}</span>
        </label>
      ))}
    </div>
  );
}

export default function NoticeChecker() {
  const [landlord, setLandlord] = useState<Landlord>("private");
  const [type, setType] = useState<NoticeType>("s8");
  const [served, setServed] = useState("");
  const [expiry, setExpiry] = useState("");
  const [ground, setGround] = useState<Ground>("g1a");
  const [court, setCourt] = useState(false);
  const [over12, setOver12] = useState(true);

  const servedDate = parseISO(served);
  const res = useMemo(
    () => checkNotice({ landlord, type, served: servedDate, expiry: parseISO(expiry), ground, courtStarted: court, tenancyOver12Months: over12, today: startOfDay(new Date()) }),
    [landlord, type, served, expiry, ground, court, over12] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const privateS21Old = landlord === "private" && type === "s21" && servedDate && servedDate < RRA_DATE;
  const showGround = landlord === "private" && type === "s8";

  return (
    <>
      <p className="muted" style={{ margin: "0 0 4px" }}><Link to="/tools">← Tools</Link></p>
      <h1 className="page-title">Notice checker</h1>
      <p className="lede">Is the client threatened with homelessness because of an eviction notice? Updated for the Renters' Rights Act changes on 1 May 2026. Always ask to see the notice itself.</p>
      <div className="tool-layout">
        <form className="card pad" onSubmit={e => e.preventDefault()}>
          <fieldset>
            <legend>Who is the landlord?</legend>
            <Radios name="ll" value={landlord} onChange={setLandlord} options={[["private", "Private landlord"], ["ha", "Housing association"], ["council", "Council"]]} />
          </fieldset>
          <fieldset>
            <legend>What kind of notice?</legend>
            <Radios name="nt" value={type} onChange={setType} options={[["s8", "Section 8"], ["s21", "Section 21"], ["other", "Other notice"]]} />
          </fieldset>
          <div className="grid cols-2">
            <label className="field">Date served<span className="hint">When the client got the notice</span>
              <input type="date" value={served} onChange={e => setServed(e.target.value)} />
            </label>
            <label className="field">Date it ends<span className="hint">The date on the notice, or a court possession date</span>
              <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
            </label>
          </div>
          {showGround && (
            <>
              <label className="field">Ground (reason) on the notice
                <select value={ground} onChange={e => setGround(e.target.value as Ground)}>
                  {GROUNDS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </label>
              {(ground === "g1" || ground === "g1a") && (
                <label className="field" style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
                  <input type="checkbox" checked={over12} onChange={e => setOver12(e.target.checked)} /> The tenancy is more than 12 months old
                </label>
              )}
            </>
          )}
          {privateS21Old && (
            <label className="field" style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
              <input type="checkbox" checked={court} onChange={e => setCourt(e.target.checked)} /> The landlord has started court proceedings
            </label>
          )}
        </form>
        <section className="card pad" aria-live="polite">
          <div className={`notice ${TONE[res.status]}`}>
            <div className="tag-line">{LABEL[res.status]}</div>
            <p style={{ margin: "6px 0 0", fontSize: 16, fontWeight: 600 }}>{res.headline}</p>
          </div>
          {res.preventionBy && res.status === "not-yet" && (
            <p style={{ marginTop: 12 }}>Prevention duty should start no later than <b>{formatUK(res.preventionBy)}</b> (56 days before the notice ends).</p>
          )}
          {res.points.length > 0 && (
            <>
              <h2 style={{ fontSize: 17, margin: "14px 0 6px" }}>Things to check</h2>
              <ul className="tidy">{res.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </>
          )}
          <p className="muted" style={{ fontSize: 13, marginTop: 14 }}>Training aid only. Notice rules are detailed: confirm with a senior officer or <a href="https://england.shelter.org.uk/professional_resources/legal" target="_blank" rel="noreferrer">Shelter Legal</a>.</p>
          <Link to="/journey/prevention" className="btn small">About the prevention duty</Link>
        </section>
      </div>
    </>
  );
}
