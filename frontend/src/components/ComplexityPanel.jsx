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

// growth functions used to draw the "theory" line on each chart
const GROWTH = {
  nlogn: (n) => n * Math.log2(n),
  n: (n) => n,
  n3: (n) => n ** 3,
};

// One small bar chart per algorithm (their scales differ too much to share an axis).
// Bars = measured operations. Dashed line = the theoretical growth f(n),
// scaled so it meets the last bar; if the bars follow the line, the theory holds.
function MiniBars({ title, rows, field, growth, growthLabel }) {
  const W = 260, H = 120, gap = 10;
  const f = GROWTH[growth];
  const last = rows[rows.length - 1];
  const scale = last[field] / f(last.n);
  const max = Math.max(...rows.map((r) => Math.max(r[field], f(r.n) * scale)), 1);
  const barW = (W - gap * (rows.length - 1)) / rows.length;
  const y = (v) => H - Math.max((v / max) * (H - 14), 2);
  const points = rows.map((r, i) => `${i * (barW + gap) + barW / 2},${y(f(r.n) * scale)}`).join(" ");

  return (
    <figure className="mini-chart">
      <figcaption>
        {title}
        <span className="theory-key"><i /> {growthLabel} shape</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={`${title}, compared with ${growthLabel}`}>
        <line x1="0" y1={H} x2={W} y2={H} className="axis" />
        {rows.map((r, i) => {
          const x = i * (barW + gap);
          return (
            <g key={r.n}>
              <rect x={x} y={y(r[field])} width={barW} height={H - y(r[field])} rx="4" className="chart-bar">
                <title>{`n = ${r.n}: ${r[field].toLocaleString()} operations`}</title>
              </rect>
              <text x={x + barW / 2} y={H + 13} className="tick">{r.n}</text>
            </g>
          );
        })}
        <polyline points={points} className="theory-line" />
        <text x={W} y={10} className="tick end">{max.toLocaleString(undefined, { maximumFractionDigits: 0 })}</text>
      </svg>
    </figure>
  );
}

export default function ComplexityPanel() {
  const [rows, setRows] = useState([]);
  const [lists, setLists] = useState([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    const r = await api.benchmark();
    setRows(r.results);
    setLists(r.structures ?? []);
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

        <button className="primary" disabled={running} onClick={run}>
          {running ? "Running..." : rows.length ? "Run again" : "Run benchmark"}
        </button>
        <p className="note">Bars are measured operations; the dashed line is the shape the theory predicts. Hover a bar for its value.</p>

        {rows.length > 0 && (
          <>
            <h3>Graph algorithms on growing cities</h3>
            <p className="note small">n = number of intersections (4×4 up to 12×12 grids).</p>
            <div className="charts">
              <MiniBars title="Dijkstra: edge relaxations" rows={rows} field="dijkstra_ops" growth="nlogn" growthLabel="n log n" />
              <MiniBars title="Floyd-Warshall: loop iterations" rows={rows} field="floyd_ops" growth="n3" growthLabel="n³" />
            </div>
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

        {lists.length > 0 && (
          <>
            <h3>Heap, sorting and selection on random lists</h3>
            <p className="note small">n = list size. ops = comparisons. Heap = n adds then n removes.</p>
            <div className="charts">
              <MiniBars title="Min-heap: comparisons" rows={lists} field="heap_ops" growth="nlogn" growthLabel="n log n" />
              <MiniBars title="Merge sort: comparisons" rows={lists} field="merge_ops" growth="nlogn" growthLabel="n log n" />
              <MiniBars title="Median of medians: comparisons" rows={lists} field="select_ops" growth="n" growthLabel="n" />
            </div>
            <h3>Operations ÷ predicted growth</h3>
            <table className="data-table">
              <thead>
                <tr><th>n</th><th>Heap ÷ n log n</th><th>Merge ÷ n log n</th><th>Select ÷ n</th></tr>
              </thead>
              <tbody>
                {lists.map((r) => (
                  <tr key={r.n}>
                    <td>{r.n}</td><td>{r.heap_ratio}</td><td>{r.merge_ratio}</td><td>{r.select_ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">
              Each column stays roughly the same while n grows 16 times. That is what the theory predicts:
              the work grows like n log n for the heap and merge sort, and like n for selection.
              Hover a bar above for the exact number of comparisons.
            </p>
          </>
        )}
      </section>
    </>
  );
}
