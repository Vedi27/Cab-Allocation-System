import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import Sidebar from "./components/Sidebar";
import CityMap from "./components/CityMap";
import CityPanel from "./components/CityPanel";
import RoutePanel from "./components/RoutePanel";
import PrecomputePanel from "./components/PrecomputePanel";
import KthPanel from "./components/KthPanel";
import SimPanel from "./components/SimPanel";
import BookingPanel from "./components/BookingPanel";
import ComplexityPanel from "./components/ComplexityPanel";
import { FEATURES } from "./features";
import "./App.css";

// features where a map click picks ONE point (A) instead of A then B
const SINGLE_POINT = ["city", "backup"];

export default function App() {
  const [city, setCity] = useState(null);
  const [error, setError] = useState(false);
  const [feature, setFeature] = useState("sim");      // which sidebar item is open
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [selected, setSelected] = useState({ a: null, b: null });
  const [waiting, setWaiting] = useState([]);
  const isSim = feature === "sim";

  // simulation (lives here so it keeps running when you switch features)
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
    if (!isSim || !draft || target === null || target === draft.pickup) { setQuote(null); return; }
    let stale = false;
    const t = setTimeout(async () => {
      const q = await api.simQuote(draft.pickup, target);
      if (!stale && !q.detail) setQuote({ drop: target, ...q });
    }, 60);
    return () => { stale = true; clearTimeout(t); };
  }, [isSim, draft?.pickup, target]);

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

  // "Show algorithm" mode: reveal visited nodes one by one
  useEffect(() => {
    if (shownCount >= visited.length) return;
    const t = setTimeout(() => setShownCount(shownCount + 1), 60);
    return () => clearTimeout(t);
  }, [shownCount, visited]);

  function showResult(newVisited, newPath) {
    setVisited(newVisited);
    setPath(newPath);
    setShownCount(animate ? 0 : newVisited.length);
  }

  function handleNodeClick(id) {
    if (isSim) {                                      // click = create a rider
      if (!draft) setDraft({ pickup: id, drop: null });
      else if (id === draft.pickup) setDraft(null);
      else setDraft({ ...draft, drop: id });
      return;
    }
    if (SINGLE_POINT.includes(feature) || selected.a === null || selected.b !== null) setSelected({ a: id, b: null });
    else setSelected({ a: selected.a, b: id });
  }

  function changeFeature(id) {
    setFeature(id);
    setDraft(null);
    setSelected({ a: null, b: null });
    showResult([], []);
  }

  function clearMap() {
    setSelected({ a: null, b: null });
    setDraft(null);
    showResult([], []);
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

  if (error) {
    return (
      <div className="center-msg">
        <h2>The backend isn't running</h2>
        <p>Start it from the backend folder with <code>uvicorn main:app --reload --port 8000</code>, then refresh this page.</p>
      </div>
    );
  }
  if (!city) return <div className="center-msg"><p>Loading the city...</p></div>;

  const animationDone = shownCount >= visited.length;
  // riders to ring on the map: still waiting, or assigned but not yet picked up
  const riders = [...waiting, ...city.cabs.filter((c) => c.status === "to_pickup").map((c) => c.request)];
  const setCabs = (cabs) => setCity({ ...city, cabs });
  const freeCount = city.cabs.filter((c) => c.free).length;
  const props = { city, selected, showResult, waiting, setWaiting, setCabs, freeCount };

  const map = (
    <div className="map-frame">
      <CityMap
        city={city}
        selected={selected}
        onNodeClick={handleNodeClick}
        visited={isSim ? (quote ? quote.visited.slice(0, previewShown) : []) : visited.slice(0, shownCount)}
        path={isSim ? [] : animationDone ? path : []}
        riders={riders}
        draft={isSim ? draft : null}
        onNodeHover={setHover}
        preview={isSim && draft && quote && previewShown >= quote.visited.length ? quote.path : []}
        showPlans={isSim}
      />
    </div>
  );

  return (
    <div className={navCollapsed ? "layout nav-collapsed" : "layout"}>
      <Sidebar active={feature} onSelect={changeFeature} simRunning={active}
               collapsed={navCollapsed} onToggle={() => setNavCollapsed(!navCollapsed)} />

      <main className="map-area">
        <div className="map-toolbar">
          <div>
            <h1>City map</h1>
            <p className="muted">
              {isSim ? "Tap a pickup point, then a destination, to book a ride." : `Click intersections to choose points for ${FEATURES[feature].name}.`}
            </p>
          </div>
          <div className="toolbar-actions">
            <label className="toggle">
              <input type="checkbox" checked={animate} onChange={(e) => setAnimate(e.target.checked)} />
              Animate algorithm
            </label>
            <button className="ghost" onClick={clearMap}>Clear selection</button>
            <button className="ghost" onClick={resetCity}>Reset city</button>
          </div>
        </div>

        {isSim ? (
          <div className="sim-grid">
            <BookingPanel draft={draft} setDraft={setDraft} quote={quote} onSubmit={requestRide}
                          lastRide={lastRide} dismissLast={() => setLastRide(null)} error={lastRide?.error} />
            {map}
          </div>
        ) : map}

        <div className="legend">
          <span><i className="dot a" /> {isSim ? "Pickup" : "Point A"}</span>
          <span><i className="dot b" /> {isSim ? "Destination" : "Point B"}</span>
          <span><i className="dot visited" /> Explored by Dijkstra</span>
          <span><i className="line" /> Route</span>
          <span><i className="sq" /> Free cab</span>
          <span><i className="sq pickup" /> Cab heading to rider</span>
          <span><i className="sq busy" /> Cab on trip</span>
          <span><i className="ring" /> Waiting rider</span>
          <span className="muted">Road numbers = minutes of travel</span>
        </div>
      </main>

      <aside className="panel" key={feature}>
        {isSim && <SimPanel sim={sim} applySim={applySim} speed={speed} setSpeed={setSpeed} lastRide={lastRide} />}
        {feature === "backup" && <KthPanel {...props} />}
        {feature === "route" && <RoutePanel {...props} />}
        {feature === "table" && <PrecomputePanel {...props} />}
        {feature === "city" && <CityPanel {...props} />}
        {feature === "performance" && <ComplexityPanel />}
      </aside>
    </div>
  );
}
