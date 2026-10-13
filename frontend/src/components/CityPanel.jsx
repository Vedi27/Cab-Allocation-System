// Feature 1 - City Network: shows the graph size and a node's adjacency list
import FeatureInfo from "./FeatureInfo";
import PointPicker, { Stats } from "./PointPicker";

export default function CityPanel({ city, selected, waiting }) {
  const node = selected.a;
  const neighbours = node === null ? [] : city.edges
    .filter((e) => e.u === node || e.v === node)
    .map((e) => ({ to: e.u === node ? e.v : e.u, w: e.w }));
  const free = city.cabs.filter((c) => c.free).length;

  return (
    <>
      <FeatureInfo id="city" />
      <section className="try">
        <h3>Explore the graph</h3>
        <Stats items={[
          ["Intersections (V)", city.nodes.length],
          ["Roads (E)", city.edges.length],
          ["Free cabs", `${free} of ${city.cabs.length}`],
          ["Waiting riders", waiting.length],
        ]} />

        <PointPicker selected={selected} labels={["Intersection"]} single />
        {node !== null && (
          <div className="adj">
            <span className="adj-head">adj[{node}]</span>
            {neighbours.map((n) => (
              <span key={n.to} className="adj-item">→ {n.to} <small>weight {n.w}</small></span>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
