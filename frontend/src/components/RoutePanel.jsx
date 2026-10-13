// Feature 2 - Shortest Route Finder (Dijkstra)
import { useState } from "react";
import { api } from "../api";
import FeatureInfo from "./FeatureInfo";
import PointPicker, { Stats } from "./PointPicker";

export default function RoutePanel({ selected, showResult }) {
  const [result, setResult] = useState(null);
  const ready = selected.a !== null && selected.b !== null;

  async function findRoute() {
    const r = await api.route(selected.a, selected.b);
    setResult(r);
    showResult(r.visited, r.path);
  }

  return (
    <>
      <FeatureInfo id="route" />
      <section className="try">
        <h3>Find a route</h3>
        <PointPicker selected={selected} labels={["Start", "End"]} />
        <button className="primary" disabled={!ready} onClick={findRoute}>Find shortest route</button>

        {result && (
          <>
            <Stats items={[
              ["Travel time (ETA)", result.distance ?? "No route"],
              ["Intersections on route", result.path.length],
              ["Nodes explored", result.visited.length],
              ["Edge relaxations", result.operations],
              ["Time taken", `${result.time_ms} ms`],
            ]} />
            <p className="path-line">{result.path.join(" → ")}</p>
          </>
        )}
      </section>
    </>
  );
}
