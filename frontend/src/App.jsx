import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import CityMap from "./components/CityMap";
import RoutePanel from "./components/RoutePanel";
import KthPanel from "./components/KthPanel";
import SimPanel from "./components/SimPanel";
import BookingPanel from "./components/BookingPanel";
import ComplexityPanel from "./components/ComplexityPanel";
import "./App.css";

const TABS = ["Simulation", "Route", "k-th nearest", "Complexity"];

export default function App() {
  const [city, setCity] = useState(null);
  const [status, setStatus] = useState({});
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("Simulation");
  const [selected, setSelected] = useState({ a: null, b: null });
  const [waiting, setWaiting] = useState([]);

  // simulation (lives here so it keeps running when you switch tabs)
  const [sim, setSim] = useState(null);
  const [speed, setSpeed] = useState(1);              // 1x = 4 ticks per second
  const [draft, setDraft] = useState(null);           // ride being created: {pickup, drop}
  const [lastRide, setLastRide] = useState(null);
  const [hover, setHover] = useState(null);           // node under the mouse while choosing a drop
  const [quote, setQuote] = useState(null);           // preview of the ride being created
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

  // runs by itself while any cab is busy (or riders wait for one), and rests when idle
  const active = !!sim && (sim.cabs.some((c) => !c.free) || (sim.auto_assign && sim.waiting.length > 0));
  useEffect(() => {
    if (!active) return;
    const t = setInterval(async () => {
      if (ticking.current) return;                    // previous tick still in flight
      ticking.current = true;
      try { applySim(await api.simTick(1)); } finally { ticking.current = false; }
    }, 1000 / (4 * speed));
    return () => clearInterval(t);
  }, [active, speed]);

  // live preview: route, trip time and nearest cab for the hovered (or chosen) drop
  const target = draft ? (draft.drop ?? hover) : null;
  useEffect(() => {
    if (tab !== "Simulation" || !draft || target === null || target === draft.pickup) { setQuote(null); return; }
    let stale = false;
    const t = setTimeout(async () => {
      const q = await api.simQuote(draft.pickup, target);
      if (!stale && !q.detail) setQuote({ drop: target, ...q });
    }, 60);
    return () => { stale = true; clearTimeout(t); };
  }, [tab, draft?.pickup, target]);

  // path-finding preview: reveal Dijkstra's visited nodes one by one, then show the shortest path
  const [previewShown, setPreviewShown] = useState(0);
  useEffect(() => {
    setPreviewShown(0);
    if (!quote) return;
    const total = quote.visited.length;
    const step = Math.max(1, Math.ceil(total / 60));   // whole search takes ~0.3s
    const t = setInterval(() => setPreviewShown((n) => (n + step >= total ? (clearInterval(t), total) : n + step)), 25);
    return () => clearInterval(t);
  }, [quote]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDraft(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function requestRide(pickup, drop, priority) {
    const r = await api.simRide(pickup, drop, priority);
    if (r.detail) { setLastRide({ error: r.detail }); return; }
    applySim(r);
    setLastRide(r);
    setDraft(null);
    setHover(null);
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
  // riders to ring on the map: still waiting, or assigned but not yet picked up
  const riders = [...waiting, ...city.cabs.filter((c) => c.status === "to_pickup").map((c) => c.request)];

  return (
    <div className="app">
      <header>
        <h1>Cab Allocation System</h1>
        
      </header>

      <main className={tab === "Simulation" ? "with-booking" : ""}>
        {tab === "Simulation" && (
          <BookingPanel draft={draft} setDraft={setDraft} quote={quote} onSubmit={requestRide}
                        lastRide={lastRide} dismissLast={() => setLastRide(null)} error={lastRide?.error} />
        )}
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
              visited={tab === "Simulation" ? (quote ? quote.visited.slice(0, previewShown) : []) : visited.slice(0, shownCount)}
              path={tab === "Simulation" ? [] : animationDone ? path : []}
              riders={riders}
              draft={tab === "Simulation" ? draft : null}
              onNodeHover={setHover}
              preview={tab === "Simulation" && draft && quote && previewShown >= quote.visited.length ? quote.path : []}
              showPlans={tab === "Simulation"}
            />
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
          {tab === "Simulation" && <SimPanel sim={sim} applySim={applySim} speed={speed} setSpeed={setSpeed} lastRide={lastRide} />}
          {tab === "k-th nearest" && <KthPanel selected={selected} />}
          {tab === "Complexity" && <ComplexityPanel />}
        </section>
      </main>
    </div>
  );
}
