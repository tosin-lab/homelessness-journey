import { Link } from "react-router";

export default function NotFound() {
  return (
    <section className="card pad" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Page not found</h1>
      <p className="lede">That page doesn't exist. Try the journey or search instead.</p>
      <div className="row">
        <Link className="btn primary" to="/journey">Go to the journey</Link>
        <Link className="btn" to="/">Home</Link>
      </div>
    </section>
  );
}
