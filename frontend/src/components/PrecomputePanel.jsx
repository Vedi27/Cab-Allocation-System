// Feature 3 - Floyd-Warshall precompute vs Dijkstra on demand
import { useState } from "react";
import { api } from "../api";

export default function PrecomputePanel({ selected }) {
  const [pre, setPre] = useState(null);
  const [lookup, setLookup] = useState(null);
  const [live, setLive] = useState(null);

  async function precompute() {
    setPre(await api.precompute());
    setLookup(null);
  }

  async function compare() {
    setLookup(await api.distance(selected.a, selected.b));
    setLive(await api.route(selected.a, selected.b));
  }

  const ready = selected.a !== null && selected.b !== null;

  return (
    <div>
      <h3>Instant lookup (Floyd-Warshall)</h3>
      <p className="hint">Precompute all distances once, then look up any pair in O(1).</p>
      <button onClick={precompute}>Precompute all distances</button>

      {pre && (
        <div className="result">
          {!pre.implemented && <p className="warn">Placeholder: write Floyd-Warshall in backend/algorithms/floyd_warshall.py</p>}
          <p>Operations: {pre.operations}</p>
          <p>Precompute time: {pre.time_ms} ms</p>
        </div>
      )}

      <p>A: <b>{selected.a ?? "-"}</b> &nbsp; B: <b>{selected.b ?? "-"}</b></p>
      <button disabled={!ready || !pre} onClick={compare}>Compare lookup vs Dijkstra</button>

      {lookup && live && (
        <table className="small-table">
          <thead><tr><th></th><th>Distance</th><th>Time (ms)</th></tr></thead>
          <tbody>
            <tr><td>Table lookup</td><td>{lookup.distance ?? "-"}</td><td>{lookup.time_ms ?? "-"}</td></tr>
            <tr><td>Dijkstra</td><td>{live.distance ?? "-"}</td><td>{live.time_ms}</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
