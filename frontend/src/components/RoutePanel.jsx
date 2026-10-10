// Feature 2 - shortest route with Dijkstra
import { useState } from "react";
import { api } from "../api";

export default function RoutePanel({ selected, showResult }) {
  const [result, setResult] = useState(null);

  async function findRoute() {
    const r = await api.route(selected.a, selected.b);
    setResult(r);
    showResult(r.visited, r.path);
  }

  const ready = selected.a !== null && selected.b !== null;

  return (
    <div>
      <h3>Route finding (Dijkstra)</h3>
      <p className="hint">Click two points on the map: A (start) and B (end).</p>
      <p>A: <b>{selected.a ?? "-"}</b> &nbsp; B: <b>{selected.b ?? "-"}</b></p>
      <button disabled={!ready} onClick={findRoute}>Find shortest route</button>

      {result && (
        <div className="result">
          {!result.implemented && <p className="warn">Placeholder: write Dijkstra in backend/algorithms/dijkstra.py</p>}
          <p>Path: {result.path.join(" → ")}</p>
          <p>Distance (ETA): {result.distance ?? "-"}</p>
          <p>Nodes visited: {result.visited.length}</p>
          <p>Edge relaxations: {result.operations}</p>
          <p>Time: {result.time_ms} ms</p>
        </div>
      )}
    </div>
  );
}
