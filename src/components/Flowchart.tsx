import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { EDGES, STAGES, STAGE_ORDER, STAGE_TYPES } from "../data/stages";
import type { Edge, RoleId, StageId } from "../types";

interface Props {
  selected?: StageId | null;
  onSelect: (id: StageId) => void;
  role?: RoleId | null;
  visited?: Set<StageId> | null;
  current?: StageId | null;
  viewed?: Set<string>;
  showStart?: boolean;
}

interface Geo {
  w: number;
  h: number;
  edges: { e: Edge; d: string; mx: number; my: number }[];
}

type Anchor = { x: number; y: number; d: [number, number] };

function anchor(el: HTMLElement, flow: HTMLElement, side: string): Anchor {
  const r = el.getBoundingClientRect();
  const f = flow.getBoundingClientRect();
  const [s, fr] = side.split(":");
  const p = fr ? parseFloat(fr) : 0.5;
  const L = r.left - f.left + flow.scrollLeft;
  const T = r.top - f.top + flow.scrollTop;
  if (s === "t") return { x: L + r.width * p, y: T, d: [0, -1] };
  if (s === "b") return { x: L + r.width * p, y: T + r.height, d: [0, 1] };
  if (s === "l") return { x: L, y: T + r.height * p, d: [-1, 0] };
  return { x: L + r.width, y: T + r.height * p, d: [1, 0] };
}

const MARKERS: Record<string, string> = { def: "#9AA88F", emerg: "#A8473A", rev: "#3E5C76", alt: "#9A6F1C", active: "#2C5F2D" };

export default function Flowchart({ selected, onSelect, role, visited, current, viewed, showStart }: Props) {
  const flowRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Partial<Record<StageId, HTMLButtonElement | null>>>({});
  const [geo, setGeo] = useState<Geo | null>(null);

  const compute = useCallback(() => {
    const flow = flowRef.current;
    const svg = svgRef.current;
    if (!flow || !svg) return;
    if (getComputedStyle(svg).display === "none") {
      setGeo(null);
      return;
    }
    const edges = EDGES.map(e => {
      const fa = nodeRefs.current[e.from];
      const ta = nodeRefs.current[e.to];
      if (!fa || !ta) return null;
      const a = anchor(fa, flow, e.fromSide);
      const b = anchor(ta, flow, e.toSide);
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const k = e.k ?? Math.max(30, Math.min(90, dist * 0.38));
      const c1 = { x: a.x + a.d[0] * k, y: a.y + a.d[1] * k };
      const c2 = { x: b.x + b.d[0] * k, y: b.y + b.d[1] * k };
      return {
        e,
        d: `M${a.x},${a.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${b.x},${b.y}`,
        mx: (a.x + 3 * c1.x + 3 * c2.x + b.x) / 8,
        my: (a.y + 3 * c1.y + 3 * c2.y + b.y) / 8
      };
    }).filter((x): x is Geo["edges"][number] => x !== null);
    setGeo({ w: flow.scrollWidth, h: flow.scrollHeight, edges });
  }, []);

  useLayoutEffect(() => {
    compute();
    const flow = flowRef.current;
    if (!flow) return;
    const ro = new ResizeObserver(() => compute());
    ro.observe(flow);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [compute]);

  const isActive = (e: Edge) => {
    if (visited && visited.size) return visited.has(e.from) && visited.has(e.to);
    return !!selected && (e.from === selected || e.to === selected);
  };
  const isFaded = (e: Edge) => {
    if (role) return !(STAGES[e.from].roles.includes(role) && STAGES[e.to].roles.includes(role));
    if (visited && visited.size) return !isActive(e);
    return false;
  };

  return (
    <div className="card flowwrap">
      <div className="legend" aria-hidden="true">
        {Object.entries(STAGE_TYPES).map(([k, v]) => (
          <span key={k}>
            <i className={`t-${k}`} style={{ borderColor: "var(--c)", background: k === "out" ? "var(--outcome)" : "#fff" }} />
            {v}
          </span>
        ))}
      </div>
      <div className="flow" ref={flowRef} role="list" aria-label="Stages of the homelessness journey">
        <svg className="edges" ref={svgRef} width={geo?.w ?? 0} height={geo?.h ?? 0} aria-hidden="true">
          <defs>
            {Object.entries(MARKERS).map(([k, c]) => (
              <marker key={k} id={`m-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={c} />
              </marker>
            ))}
          </defs>
          {geo?.edges.map(({ e, d }, i) => {
            const on = isActive(e);
            const kind = e.kind ?? "";
            const mk = kind.startsWith("emerg") ? "emerg" : kind === "rev" ? "rev" : kind === "alt" ? "alt" : "def";
            return <path key={i} className={`edge ${kind} ${on ? "active" : ""} ${isFaded(e) ? "faded" : ""}`} d={d} markerEnd={`url(#m-${on ? "active" : mk})`} />;
          })}
          {geo?.edges.filter(x => x.e.label).map(({ e, mx, my }, i) => {
            const w = (e.label as string).length * 6.4 + 14;
            return (
              <g key={i} className={`elabel ${isFaded(e) ? "faded" : ""}`}>
                <rect x={mx - w / 2} y={my - 10} width={w} height={20} rx={10} />
                <text x={mx} y={my + 4} textAnchor="middle">{e.label}</text>
              </g>
            );
          })}
        </svg>
        {STAGE_ORDER.map(id => {
          const s = STAGES[id];
          const cls = [
            "node", `t-${s.type}`,
            s.outcome ? "outcome" : "",
            selected === id && !visited?.size ? "sel" : "",
            role && !s.roles.includes(role) ? "dim" : "",
            visited?.has(id) ? "inpath" : "",
            current === id ? "current" : "",
            showStart && id === "approach" ? "start" : ""
          ].filter(Boolean).join(" ");
          return (
            <button
              key={id}
              role="listitem"
              ref={el => { nodeRefs.current[id] = el; }}
              className={cls}
              style={{ gridRow: s.row, gridColumn: s.col }}
              onClick={() => onSelect(id)}
              aria-current={selected === id || current === id ? "step" : undefined}
              aria-label={`${s.tag}: ${s.title}. ${s.sub}`}
            >
              {s.law && <span className="law">{s.law}</span>}
              <span className="tag">{s.tag}</span>
              <span className="ttl">{s.title}{s.outcome ? " ✓" : ""}</span>
              <span className="sub">{s.sub}</span>
              {s.reviewable && <span className="revb">Reviewable</span>}
              {viewed?.has(id) && <span className="done" aria-label="viewed">Viewed</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
