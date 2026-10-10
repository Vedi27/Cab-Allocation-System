// Time-based simulation controls. The clock loop itself lives in App.jsx.
// 1 time unit = 1 unit of road weight (the number written on each road).
import { api } from "../api";

const STATUS = { to_pickup: "heading to rider", on_trip: "on trip" };

export default function SimPanel({ sim, applySim, running, setRunning, speed, setSpeed, lastRide }) {
  if (!sim) return <p>Loading...</p>;
  const st = sim.stats;
  const changeConfig = (auto, spawn) => api.simConfig(auto, spawn).then(applySim);
  const step = async () => applySim(await api.simTick(1));
  const busy = sim.cabs.filter((c) => !c.free);

  return (
    <div>
      <h3>Simulation</h3>
      <p className="hint">Book rides from the panel on the left. Each road number is its travel time in minutes, and the clock counts those minutes.</p>
      <p><b>Clock: {sim.clock}</b></p>
      <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Play"}</button>
      <button className="secondary" disabled={running} onClick={step}>Step +1</button>
      <p>Speed: {speed} ticks/sec <input type="range" min="1" max="20" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></p>

      {lastRide && !lastRide.error && (
        <div className="result">
          {lastRide.status === "assigned"
            ? <p className="ok">Rider #{lastRide.ride.id}: cab {lastRide.cab} on its way. Pickup in {lastRide.pickup_eta}, arrives in {lastRide.trip_eta}.</p>
            : <p>Rider #{lastRide.ride.id}: all cabs busy, queued at position {lastRide.position}.</p>}
        </div>
      )}

      <label><input type="checkbox" checked={sim.auto_assign} onChange={(e) => changeConfig(e.target.checked, 0)} /> Auto-assign waiting riders when a cab frees up</label>

      <h4>Active rides ({busy.length})</h4>
      <ul className="queue">
        {busy.map((c) => (
          <li key={c.id}>Cab {c.id}: #{c.request.id} {c.request.pickup} → {c.request.drop}, {STATUS[c.status]}, done in {c.end_time - sim.clock}</li>
        ))}
      </ul>

      <h4>Stats</h4>
      <p>Waiting: {sim.waiting.length} &nbsp; Completed: {st.completed} &nbsp; Busy: {st.busy_cabs}/{sim.cabs.length} ({st.utilisation}%)</p>
      <p>Avg wait: {st.avg_wait ?? "-"} &nbsp; Max wait: {st.max_wait ?? "-"} &nbsp; Avg trip: {st.avg_trip ?? "-"}</p>

      <h4>Recent trips</h4>
      <ul className="queue">
        {sim.trips.map((t) => (
          <li key={t.request}>#{t.request} cab {t.cab}: waited {t.wait}, drove {t.trip_time} (done at {t.dropped_at}) {t.priority === 0 && <span className="tag">urgent</span>}</li>
        ))}
      </ul>
    </div>
  );
}
