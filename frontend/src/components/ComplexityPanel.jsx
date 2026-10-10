// Feature 8 - empirical analysis: measured time and operations as n grows
import { useState } from "react";
import { api } from "../api";

export default function ComplexityPanel() {
  const [rows, setRows] = useState([]);

  async function run() {
    const r = await api.benchmark();
    setRows(r.results);
  }

  return (
    <div>
      <h3>Complexity analysis</h3>
      <p className="hint">Runs the algorithms on bigger and bigger cities (n = number of intersections).</p>
      <table className="small-table">
        <thead>
          <tr><th>Algorithm</th><th>Time</th><th>Space</th></tr>
        </thead>
        <tbody>
          <tr><td>Dijkstra (min-heap)</td><td>O((V+E) log V)</td><td>O(V)</td></tr>
          <tr><td>Floyd-Warshall</td><td>O(V³)</td><td>O(V²)</td></tr>
          <tr><td>Heap push / pop</td><td>O(log n)</td><td>O(n)</td></tr>
          <tr><td>Merge sort</td><td>O(n log n)</td><td>O(n)</td></tr>
          <tr><td>Median of medians</td><td>O(n)</td><td>O(n)</td></tr>
        </tbody>
      </table>

      <button onClick={run}>Run benchmark</button>

      {rows.length > 0 && (
        <table className="small-table">
          <thead>
            <tr><th>n</th><th>Dijkstra ops</th><th>Dijkstra ms</th><th>Floyd ops</th><th>Floyd ms</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n}>
                <td>{r.n}</td><td>{r.dijkstra_ops}</td><td>{r.dijkstra_ms}</td>
                <td>{r.floyd_ops}</td><td>{r.floyd_ms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
