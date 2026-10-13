// Feature 3 - All-Pairs Distance Table (Floyd-Warshall)
import { useState } from "react";
import { api } from "../api";
import FeatureInfo from "./FeatureInfo";
import PointPicker, { Stats } from "./PointPicker";

export default function PrecomputePanel({ selected, showResult }) {
  const [built, setBuilt] = useState(null);
  const [lookup, setLookup] = useState(null);
  const [live, setLive] = useState(null);
  const ready = selected.a !== null && selected.b !== null;

  async function buildTable() {
    setBuilt(await api.precompute());
    setLookup(null);
    setLive(null);
  }

  async function compare() {
    const l = await api.distance(selected.a, selected.b);
    const d = await api.route(selected.a, selected.b);
    setLookup(l);
    setLive(d);
    showResult([], d.path);
  }

  return (
    <>
      <FeatureInfo id="table" />
      <section className="try">
        <h3>1. Build the table</h3>
        <button className="primary" onClick={buildTable}>
          {built ? "Rebuild distance table" : "Build distance table"}
        </button>
        {built && (
          <Stats items={[
            ["Loop iterations (V³)", built.operations.toLocaleString()],
            ["Build time", `${built.time_ms} ms`],
          ]} />
        )}

        <h3>2. Look up a distance</h3>
        <PointPicker selected={selected} labels={["From", "To"]} />
        <button className="primary" disabled={!ready || !built} onClick={compare}>Compare with Dijkstra</button>
        {!built && <p className="note">Build the table first.</p>}

        {lookup && live && (
          <table className="data-table">
            <thead><tr><th>Method</th><th>Distance</th><th>Time</th></tr></thead>
            <tbody>
              <tr><td>Table lookup</td><td>{lookup.distance ?? "-"}</td><td>{lookup.time_ms} ms</td></tr>
              <tr><td>Dijkstra</td><td>{live.distance ?? "-"}</td><td>{live.time_ms} ms</td></tr>
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
