// Feature 11 (optional) - k-th nearest cab with median-of-medians
import { useState } from "react";
import { api } from "../api";

export default function KthPanel({ selected }) {
  const [k, setK] = useState(2);
  const [result, setResult] = useState(null);

  async function find() {
    setResult(await api.kthNearest(selected.a, Number(k)));
  }

  return (
    <div>
      <h3>k-th nearest cab (Median of medians)</h3>
      <p className="hint">Pick point A on the map, e.g. the rider's location.</p>
      <p>Location: <b>{selected.a ?? "-"}</b></p>
      <label>k = <input type="number" min={1} value={k} onChange={(e) => setK(e.target.value)} /></label>
      <button disabled={selected.a === null} onClick={find}>Find</button>

      {result && (
        <div className="result">
          {result.message ? <p>{result.message}</p> : (
            <>
              {!result.implemented && <p className="warn">Placeholder: write median-of-medians in backend/algorithms/kth_nearest.py</p>}
              <p>The {result.k}-th nearest free cab is <b>cab {result.cab_id}</b> at distance {result.distance}</p>
              <p>Comparisons: {result.comparisons}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
