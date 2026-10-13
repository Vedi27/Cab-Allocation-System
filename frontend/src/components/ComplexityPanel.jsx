// Feature 8 - Algorithm Performance (empirical analysis)
import { useState } from "react";
import { api } from "../api";
import FeatureInfo from "./FeatureInfo";

const THEORY = [
  ["Dijkstra (min-heap)", "O((V+E) log V)", "O(V)"],
  ["Floyd-Warshall", "O(V³)", "O(V²)"],
  ["Min-heap add / remove", "O(log n)", "O(n)"],
  ["Merge sort", "O(n log n)", "O(n)"],
  ["Median of medians", "O(n)", "O(n)"],
];

// one small bar chart per algorithm (their scales differ too much to share an axis)
function MiniBars({ title, rows, field }) {
  const max = Math.max(...rows.map((r) => r[field]), 1);
  const W = 260, H = 120, gap = 10;
  const barW = (W - gap * (rows.length - 1)) / rows.length;
  return (
    <figure className="mini-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={title}>
        <line x1="0" y1={H} x2={W} y2={H} className="axis" />
        {rows.map((r, i) => {
          const h = Math.max((r[field] / max) * (H - 14), 2);
          const x = i * (barW + gap);
          return (
            <g key={r.n}>
              <rect x={x} y={H - h} width={barW} height={h} rx="4" className="chart-bar">
                <title>{`n = ${r.n}: ${r[field].toLocaleString()} operations`}</title>
              </rect>
              <text x={x + barW / 2} y={H + 13} className="tick">{r.n}</text>
            </g>
          );
        })}
        <text x={W} y={10} className="tick end">{max.toLocaleString()}</text>
      </svg>
    </figure>
  );
}

export default function ComplexityPanel() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const r = await api.benchmark();
    setRows(r.results);
    setRunning(false);
  }

  return (
    <>
      <FeatureInfo id="performance" />
      <section className="try">
        <h3>Theoretical complexity</h3>
        <table className="data-table">
          <thead><tr><th>Algorithm</th><th>Time</th><th>Space</th></tr></thead>
          <tbody>
            {THEORY.map(([a, t, s]) => <tr key={a}><td>{a}</td><td>{t}</td><td>{s}</td></tr>)}
          </tbody>
        </table>

        <h3>Measured on growing cities</h3>
        <button className="primary" disabled={running} onClick={run}>
          {running ? "Running..." : rows.length ? "Run again" : "Run benchmark"}
        </button>

        {rows.length > 0 && (
          <>
            <div className="charts">
              <MiniBars title="Dijkstra: edge relaxations" rows={rows} field="dijkstra_ops" />
              <MiniBars title="Floyd-Warshall: loop iterations" rows={rows} field="floyd_ops" />
            </div>
            <p className="note">x-axis: n, the number of intersections. Hover a bar for its value.</p>
            <table className="data-table">
              <thead><tr><th>n</th><th>Dijkstra ops</th><th>Dijkstra ms</th><th>Floyd ops</th><th>Floyd ms</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.n}>
                    <td>{r.n}</td><td>{r.dijkstra_ops}</td><td>{r.dijkstra_ms}</td>
                    <td>{r.floyd_ops.toLocaleString()}</td><td>{r.floyd_ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </>
  );
}
