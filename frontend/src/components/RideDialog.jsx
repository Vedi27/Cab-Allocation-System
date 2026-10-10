// Small popup shown next to the clicked node: choose the drop point and priority, then request the ride.
// The drop can be chosen in the list OR by clicking another node on the map.
import { useState } from "react";

const GAP = 60;
const PAD = 30;

export default function RideDialog({ city, draft, setDraft, onSubmit, error }) {
  const [priority, setPriority] = useState(1);
  const width = PAD * 2 + (city.cols - 1) * GAP;
  const height = PAD * 2 + (city.rows - 1) * GAP;
  const node = city.nodes[draft.pickup];
  const x = ((PAD + node.col * GAP) / width) * 100;
  const y = ((PAD + node.row * GAP) / height) * 100;
  // open to the right of the node, or to the left near the right edge
  const style = { top: `${Math.min(y, 70)}%`, ...(x > 55 ? { right: `${100 - x + 2}%` } : { left: `${x + 2}%` }) };

  return (
    <div className="ride-dialog" style={style}>
      <b>New rider</b>
      <label>Pickup</label>
      <div>Node {draft.pickup}</div>
      <label>Drop (pick here or click the map)</label>
      <select value={draft.drop ?? ""} onChange={(e) => setDraft({ ...draft, drop: e.target.value === "" ? null : Number(e.target.value) })}>
        <option value="">choose...</option>
        {city.nodes.filter((n) => n.id !== draft.pickup).map((n) => <option key={n.id} value={n.id}>Node {n.id}</option>)}
      </select>
      <label>Priority</label>
      <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
        <option value={1}>Normal</option>
        <option value={0}>Urgent</option>
      </select>
      {error && <p className="err">{error}</p>}
      <div className="row">
        <button disabled={draft.drop === null} onClick={() => onSubmit(draft.pickup, draft.drop, priority)}>Request cab</button>
        <button className="secondary" onClick={() => setDraft(null)}>Cancel</button>
      </div>
    </div>
  );
}
