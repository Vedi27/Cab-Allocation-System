// Feature 11 - Backup Cab Finder (median of medians)
import { useState } from "react";
import { api } from "../api";
import FeatureInfo from "./FeatureInfo";
import PointPicker, { Stats } from "./PointPicker";

const ORDINAL = ["", "1st", "2nd", "3rd"];
const ordinal = (k) => ORDINAL[k] ?? `${k}th`;

export default function KthPanel({ selected, freeCount, showResult }) {
  const [k, setK] = useState(2);
  const [result, setResult] = useState(null);

  async function find() {
    const r = await api.kthNearest(selected.a, k);
    setResult(r);
    showResult([], r.route ? r.route.path : []);
  }

  return (
    <>
      <FeatureInfo id="backup" />
      <section className="try">
        <h3>Find a backup cab</h3>
        <PointPicker selected={selected} labels={["Rider at"]} single />

        <label className="field">
          Which nearest cab?
          <select value={k} onChange={(e) => setK(Number(e.target.value))}>
            {Array.from({ length: Math.max(freeCount, 1) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{ordinal(n)} nearest</option>
            ))}
          </select>
        </label>
        <button className="primary" disabled={selected.a === null} onClick={find}>Find cab</button>

        {result?.message && <p className="note">{result.message}</p>}
        {result?.cab_id && (
          <>
            <Stats items={[
              [`${ordinal(result.k)} nearest cab`, `Cab ${result.cab_id}`],
              ["Distance", result.distance],
              ["Comparisons", result.comparisons],
            ]} />
            <p className="note">
              Distances checked (unsorted): {result.candidates.map((c) => `cab ${c.cab}: ${c.distance}`).join(", ")}
            </p>
          </>
        )}
      </section>
    </>
  );
}
