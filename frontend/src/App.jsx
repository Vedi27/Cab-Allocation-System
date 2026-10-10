import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import CityMap from "./components/CityMap";
import RoutePanel from "./components/RoutePanel";
import PrecomputePanel from "./components/PrecomputePanel";
import RequestsPanel from "./components/RequestsPanel";
import KthPanel from "./components/KthPanel";
import SimPanel from "./components/SimPanel";
import RideDialog from "./components/RideDialog";
import ComplexityPanel from "./components/ComplexityPanel";
import "./App.css";

const TABS = ["Route", "Precompute", "Requests", "Simulation", "k-th nearest", "Complexity"];

export default function App() {
  const [city, setCity] = useState(null);
  const [status, setStatus] = useState({});
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("Route");
  const [selected, setSelected] = useState({ a: null, b: null });
  const [waiting, setWaiting] = useState([]);

  // simulation (lives here so the clock keeps running when you switch tabs)
  const [sim, setSim] = useState(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(4);              // ticks per second
  const [draft, setDraft] = useState(null);           // ride being created: {pickup, drop}
  const [lastRide, setLastRide] = useState(null);
  const ticking = useRef(false);

  // what the map highlights
  const [visited, setVisited] = useState([]);
  const [path, setPath] = useState([]);
  const [shownCount, setShownCount] = useState(0);   // for the animation
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    api.city().then(setCity).catch(() => setError(true));
    api.status().then(setStatus).catch(() => {});
    api.requests().then((r) => setWaiting(r.waiting)).catch(() => {});
  }, []);

  function applySim(s) {
    setSim(s);
    setCity((c) => (c ? { ...c, cabs: s.cabs } : c));
    setWaiting(s.waiting);
  }

  useEffect(() => {
    api.sim().then(applySim).catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(async () => {
      if (ticking.current) return;                    // previous tick still in flight
      ticking.current = true;
      try { applySim(await api.simTick(1)); } finally { ticking.current = false; }
    }, 1000 / speed);
    return () => clearInterval(t);
  }, [running, speed]);

  async function requestRide(pickup, drop, priority) {
    const r = await api.simRide(pickup, drop, priority);
    if (r.detail) { setLastRide({ error: r.detail }); return; }
    applySim(r);
    setLastRide(r);
    setDraft(null);
    setRunning(true);                                 // nothing moves unless the clock runs
  }

  // "Show Algorithm" mode: reveal visited nodes one by one
  useEffect(() => {
    if (shownCount >= visited.length) return;
    const t = setTimeout(() => setShownCount(shownCount + 1), 80);
    return () => clearTimeout(t);
  }, [shownCount, visited]);

  function showResult(newVisited, newPath) {
    setVisited(newVisited);
    setPath(newPath);
    setShownCount(animate ? 0 : newVisited.length);
  }

  function handleNodeClick(id) {
    if (tab === "Simulation") {                       // click = create a rider
      if (!draft) setDraft({ pickup: id, drop: null });
      else if (id === draft.pickup) setDraft(null);
      else setDraft({ ...draft, drop: id });
      return;
    }
    if (selected.a === null || selected.b !== null) setSelected({ a: id, b: null });
    else setSelected({ a: selected.a, b: id });
  }

  async function resetCity() {
    setCity(await api.reset());
    setWaiting([]);
    setDraft(null);
    setLastRide(null);
    api.sim().then(setSim);
    setSelected({ a: null, b: null });
    showResult([], []);
  }

  if (error) return <p className="center">Cannot reach the backend. Start it with: uvicorn main:app --reload --port 8000</p>;
  if (!city) return <p className="center">Loading city...</p>;

  const animationDone = shownCount >= visited.length;
  const setCabs = (cabs) => setCity((c) => ({ ...c, cabs }));
  // riders to ring on the map: still waiting, or assigned but not yet picked up
  const riders = [...waiting, ...city.cabs.filter((c) => c.status === "to_pickup").map((c) => c.request)];

  return (
    <div className="app">
      <header>
        <h1>Cab Allocation System</h1>
        <div className="badges">
          {Object.entries(status).map(([name, done]) => (
            <span key={name} className={done ? "badge done" : "badge todo"}>{name}</span>
          ))}
        </div>
      </header>

      <main>
        <section className="card map-card">
          <div className="map-toolbar">
            <label><input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} /> Show algorithm (animate)</label>
            <button className="secondary" onClick={() => { setSelected({ a: null, b: null }); showResult([], []); }}>Clear</button>
            <button className="secondary" onClick={resetCity}>Reset city</button>
          </div>
          <div className="map-wrap">
            <CityMap
              city={city}
              selected={selected}
              onNodeClick={handleNodeClick}
              visited={visited.slice(0, shownCount)}
              path={animationDone ? path : []}
              riders={riders}
              draft={tab === "Simulation" ? draft : null}
              showPlans={tab === "Simulation"}
            />
            {tab === "Simulation" && draft && (
              <RideDialog city={city} draft={draft} setDraft={setDraft} onSubmit={requestRide} error={lastRide?.error} />
            )}
          </div>
          <div className="legend">
            <span><i className="dot a" /> A</span>
            <span><i className="dot b" /> B</span>
            <span><i className="dot visited" /> visited</span>
            <span><i className="dot path" /> route</span>
            <span><i className="sq" /> free cab</span>
            <span><i className="sq pickup" /> cab heading to rider</span>
            <span><i className="sq busy" /> cab on trip</span>
            <span><i className="ring" /> waiting rider</span>
          </div>
        </section>

        <section className="card panel">
          <nav className="tabs">
            {TABS.map((t) => (
              <button key={t} className={t === tab ? "tab active" : "tab"} onClick={() => setTab(t)}>{t}</button>
            ))}
          </nav>

          {tab === "Route" && <RoutePanel selected={selected} showResult={showResult} />}
          {tab === "Precompute" && <PrecomputePanel selected={selected} />}
          {tab === "Requests" && (
            <RequestsPanel selected={selected} waiting={waiting} setWaiting={setWaiting} setCabs={setCabs} showResult={showResult} />
          )}
          {tab === "Simulation" && <SimPanel sim={sim} applySim={applySim} running={running} setRunning={setRunning} speed={speed} setSpeed={setSpeed} lastRide={lastRide} />}
          {tab === "k-th nearest" && <KthPanel selected={selected} />}
          {tab === "Complexity" && <ComplexityPanel />}
        </section>
      </main>
    </div>
  );
}
