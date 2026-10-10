// Time-based simulation: a clock ticks, cabs drive their routes, riders appear and get assigned.
// 1 time unit = 1 unit of road weight (the number written on each road).
import { useEffect, useRef, useState } from "react";
import { api } from "../api";

export default function SimPanel({ setCabs, setWaiting }) {
  const [sim, setSim] = useState(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(4);            // time units per second
  const [auto, setAuto] = useState(true);
  const [spawn, setSpawn] = useState(0.1);
  const busy = useRef(false);

  function apply(s) {
    setSim(s);
    setCabs(s.cabs);
    setWaiting(s.waiting);
  }

  useEffect(() => {
    api.simConfig(true, 0.1).then(apply).catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(async () => {
      if (busy.current) return;                     // skip if the last tick has not returned
      busy.current = true;
      try { apply(await api.simTick(1)); } finally { busy.current = false; }
    }, 1000 / speed);
    return () => clearInterval(t);
  }, [running, speed]);

  const changeConfig = (a, s) => { setAuto(a); setSpawn(s); api.simConfig(a, s).then(apply); };
  const step = async () => apply(await api.simTick(1));

  if (!sim) return <p>Loading...</p>;
  const st = sim.stats;

  return (
    <div>
      <h3>Simulation</h3>
      <p className="hint">Each road number is its travel time. The clock counts those units, so a cab needs 5 ticks to cross a road marked 5.</p>
      <p><b>Clock: {sim.clock}</b></p>
      <button onClick={() => setRunning(!running)}>{running ? "Pause" : "Play"}</button>
      <button className="secondary" disabled={running} onClick={step}>Step +1</button>
      <p>Speed: {speed} ticks/sec <input type="range" min="1" max="20" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></p>
      <p>New riders: {Math.round(spawn * 100)}% chance per tick
        <input type="range" min="0" max="0.5" step="0.05" value={spawn} onChange={(e) => changeConfig(auto, Number(e.target.value))} />
      </p>
      <label><input type="checkbox" checked={auto} onChange={(e) => changeConfig(e.target.checked, spawn)} /> Auto-assign waiting riders to free cabs</label>

      <h4>Stats</h4>
      <p>Waiting: {sim.waiting.length} &nbsp; Completed: {st.completed} &nbsp; Busy cabs: {st.busy_cabs}/{sim.cabs.length} ({st.utilisation}%)</p>
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
