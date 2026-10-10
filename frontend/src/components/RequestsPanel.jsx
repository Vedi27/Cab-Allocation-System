// Feature 4 (request queue) + Feature 5 (greedy cab assignment)
import { useState } from "react";
import { api } from "../api";

export default function RequestsPanel({ selected, waiting, setWaiting, setCabs, showResult }) {
  const [priority, setPriority] = useState(1);
  const [last, setLast] = useState(null);

  async function addRequest() {
    const r = await api.addRequest(selected.a, selected.b, Number(priority));
    setWaiting(r.waiting);
  }

  async function assignNext() {
    const r = await api.assign();
    setLast(r);
    if (r.cabs) {
      setCabs(r.cabs);
      setWaiting(r.waiting);
      showResult(r.route?.visited ?? [], r.route?.path ?? []);
    }
  }

  async function freeAll() {
    const r = await api.freeAllCabs();
    setCabs(r.cabs);
  }

  const ready = selected.a !== null && selected.b !== null;

  return (
    <div>
      <h3>Ride requests (Min-heap)</h3>
      <p className="hint">A = pickup, B = drop. Urgent riders and those waiting longest are served first.</p>
      <p>Pickup: <b>{selected.a ?? "-"}</b> &nbsp; Drop: <b>{selected.b ?? "-"}</b></p>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value={1}>Normal</option>
        <option value={0}>Urgent</option>
      </select>
      <button disabled={!ready} onClick={addRequest}>Add request</button>

      <h4>Waiting ({waiting.length})</h4>
      <ul className="queue">
        {waiting.map((r) => (
          <li key={r.id}>#{r.id}: {r.pickup} → {r.drop} {r.priority === 0 && <span className="tag">urgent</span>}</li>
        ))}
      </ul>

      <h3>Cab assignment (Greedy)</h3>
      <button disabled={waiting.length === 0} onClick={assignNext}>Assign next rider</button>
      <button className="secondary" onClick={freeAll}>Free all cabs</button>

      {last && (
        <div className="result">
          {last.message && <p>{last.message}</p>}
          {last.cab_id && (
            <>
              {!last.implemented && <p className="warn">Placeholder: write the greedy logic in backend/algorithms/assignment.py</p>}
              <p>Rider #{last.request.id} gets <b>cab {last.cab_id}</b></p>
              <p>Ranking (nearest first):</p>
              <ol>
                {last.ranking.map((x) => <li key={x.cab}>Cab {x.cab}: {x.distance ?? "-"}</li>)}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
