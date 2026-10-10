import { useEffect, useState } from "react";
import { api } from "./api";
import CityMap from "./components/CityMap";
import RoutePanel from "./components/RoutePanel";
import PrecomputePanel from "./components/PrecomputePanel";
import RequestsPanel from "./components/RequestsPanel";
import KthPanel from "./components/KthPanel";
import ComplexityPanel from "./components/ComplexityPanel";
import "./App.css";

const TABS = ["Route", "Precompute", "Requests", "k-th nearest", "Complexity"];

export default function App() {
  const [city, setCity] = useState(null);
  const [status, setStatus] = useState({});
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("Route");
  const [selected, setSelected] = useState({ a: null, b: null });
  const [waiting, setWaiting] = useState([]);

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
    if (selected.a === null || selected.b !== null) setSelected({ a: id, b: null });
    else setSelected({ a: selected.a, b: id });
  }

  async function resetCity() {
    setCity(await api.reset());
    setWaiting([]);
    setSelected({ a: null, b: null });
    showResult([], []);
  }

  if (error) return <p className="center">Cannot reach the backend. Start it with: uvicorn main:app --reload --port 8000</p>;
  if (!city) return <p className="center">Loading city...</p>;

  const animationDone = shownCount >= visited.length;
  const setCabs = (cabs) => setCity({ ...city, cabs });

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
          <CityMap
            city={city}
            selected={selected}
            onNodeClick={handleNodeClick}
            visited={visited.slice(0, shownCount)}
            path={animationDone ? path : []}
            riders={waiting}
          />
          <div className="legend">
            <span><i className="dot a" /> A</span>
            <span><i className="dot b" /> B</span>
            <span><i className="dot visited" /> visited</span>
            <span><i className="dot path" /> route</span>
            <span><i className="sq" /> free cab</span>
            <span><i className="sq busy" /> busy cab</span>
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
          {tab === "k-th nearest" && <KthPanel selected={selected} />}
          {tab === "Complexity" && <ComplexityPanel />}
        </section>
      </main>
    </div>
  );
}
