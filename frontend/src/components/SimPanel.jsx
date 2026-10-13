// Simulation side panel: speed, active rides and stats. The tick loop itself lives in App.jsx.
// 1 time unit = 1 unit of road weight (the number written on each road).
import { api } from "../api";
import FeatureInfo from "./FeatureInfo";
import { Stats } from "./PointPicker";

const STATUS = { to_pickup: "heading to rider", on_trip: "on trip" };

export default function SimPanel({ sim, applySim, speed, setSpeed, lastRide }) {
  if (!sim) return <FeatureInfo id="sim" />;
  const st = sim.stats;
  const changeConfig = (auto, spawn) => api.simConfig(auto, spawn).then(applySim);
  const busy = sim.cabs.filter((c) => !c.free);

  return (
    <>
      <FeatureInfo id="sim" />
      <section className="try">
        <h3>Simulation speed</h3>
        <div className="speed">
          <input type="range" min="0.5" max="5" step="0.5" value={speed}
                 style={{ "--fill": `${((speed - 0.5) / 4.5) * 100}%` }}
                 onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Simulation speed" />
          <div className="speed-scale"><span>Slow</span><span>Fast</span></div>
        </div>

        {lastRide && !lastRide.error && (
          <p className={lastRide.status === "assigned" ? "result-line ok" : "result-line"}>
            {lastRide.status === "assigned"
              ? `Rider #${lastRide.ride.id}: cab ${lastRide.cab} on its way. Pickup in ${lastRide.pickup_eta} min, arrives in ${lastRide.trip_eta} min.`
              : `Rider #${lastRide.ride.id}: all cabs busy, queued at position ${lastRide.position}.`}
          </p>
        )}

        <label className="check">
          <input type="checkbox" checked={sim.auto_assign} onChange={(e) => changeConfig(e.target.checked, 0)} />
          Auto-assign waiting riders when a cab frees up
        </label>

        <h3>Ride queue ({sim.waiting.length} waiting)</h3>
        <p className="note small">Min-heap order: priority riders first, then whoever booked earliest.</p>
        {sim.waiting.length === 0 ? (
          <p className="note">No one is waiting. Riders queue here when every cab is busy.</p>
        ) : (
          <ol className="ride-list queue-order">
            {sim.waiting.map((r, i) => (
              <li key={r.id}>
                <span className="queue-pos">{i + 1}</span>
                <span>Rider #{r.id} <span className="muted">{r.pickup} → {r.drop}</span></span>
                {r.priority === 0 && <span className="urgent">Priority</span>}
                <span className="muted right">waiting {sim.clock - r.created} min{i === 0 ? ", next to be served" : ""}</span>
              </li>
            ))}
          </ol>
        )}

        <h3>Active rides ({busy.length})</h3>
        {busy.length === 0 ? (
          <p className="note">No cab is on a trip. Book a ride to send one out.</p>
        ) : (
          <ul className="ride-list">
            {busy.map((c) => (
              <li key={c.id}>
                <span className={c.status === "on_trip" ? "cab-chip trip" : "cab-chip pickup"}>Cab {c.id}</span>
                <span>Rider #{c.request.id} <span className="muted">{c.request.pickup} → {c.request.drop}</span></span>
                <span className="muted right">{STATUS[c.status]}, {c.end_time - sim.clock} min left</span>
              </li>
            ))}
          </ul>
        )}

        <h3>Fleet</h3>
        <Stats items={[
          ["Waiting riders", sim.waiting.length],
          ["Completed trips", st.completed],
          ["Busy cabs", `${st.busy_cabs} of ${sim.cabs.length} (${st.utilisation}%)`],
          ["Avg wait", st.avg_wait === null ? "-" : `${st.avg_wait} min`],
          ["Max wait", st.max_wait === null ? "-" : `${st.max_wait} min`],
          ["Avg trip", st.avg_trip === null ? "-" : `${st.avg_trip} min`],
        ]} />

        <h3>Recent trips</h3>
        {sim.trips.length === 0 ? (
          <p className="note">Finished trips will appear here.</p>
        ) : (
          <ul className="ride-list">
            {sim.trips.map((t) => (
              <li key={t.request}>
                <span>#{t.request} cab {t.cab}</span>
                <span className="muted">waited {t.wait} min, drove {t.trip_time} min</span>
                {t.priority === 0 && <span className="urgent right">Priority</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
