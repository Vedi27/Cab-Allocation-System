// Feature 1 - draws the grid city as an SVG.
// Click a node to select point A, click again to select point B.

const GAP = 60;      // pixels between intersections
const PAD = 30;

const pos = (node) => ({ x: PAD + node.col * GAP, y: PAD + node.row * GAP });

export default function CityMap({ city, selected, onNodeClick, visited, path, riders, draft, showPlans, onNodeHover, preview = [] }) {
  const width = PAD * 2 + (city.cols - 1) * GAP;
  const height = PAD * 2 + (city.rows - 1) * GAP;
  const byId = (id) => city.nodes[id];

  // edges that are part of the highlighted path
  const pathEdges = new Set();
  for (let i = 0; i + 1 < path.length; i++) {
    pathEdges.add(`${path[i]}-${path[i + 1]}`);
    pathEdges.add(`${path[i + 1]}-${path[i]}`);
  }
  const previewEdges = new Set();
  for (let i = 0; i + 1 < preview.length; i++) {
    previewEdges.add(`${preview[i]}-${preview[i + 1]}`);
    previewEdges.add(`${preview[i + 1]}-${preview[i]}`);
  }
  const visitedSet = new Set(visited);
  const riderPickups = new Set(riders.map((r) => r.pickup));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="city-map">
      {/* roads */}
      {city.edges.map((e) => {
        const a = pos(byId(e.u));
        const b = pos(byId(e.v));
        const onPath = pathEdges.has(`${e.u}-${e.v}`);
        const onPreview = previewEdges.has(`${e.u}-${e.v}`);
        return (
          <g key={`${e.u}-${e.v}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={onPreview ? "road road-preview" : onPath ? "road road-path" : "road"} />
            <text x={(a.x + b.x) / 2 + 4} y={(a.y + b.y) / 2 - 4} className="road-weight">{e.w}</text>
          </g>
        );
      })}

      {/* planned routes of busy cabs (Simulation tab) */}
      {showPlans && city.cabs.filter((c) => c.plan).map((cab) => {
        const end = pos(byId(cab.plan[cab.plan.length - 1][0]));
        return (
          <g key={`plan${cab.id}`}>
            <polyline
              points={cab.plan.map(([id]) => `${pos(byId(id)).x},${pos(byId(id)).y}`).join(" ")}
              className={cab.status === "on_trip" ? "plan plan-trip" : "plan"}
            />
            <rect x={end.x - 5} y={end.y - 5} width={10} height={10} className="drop-mark" />
          </g>
        );
      })}

      {/* intersections */}
      {city.nodes.map((n) => {
        const p = pos(n);
        let cls = "node";
        if (visitedSet.has(n.id)) cls += " node-visited";
        if (path.includes(n.id)) cls += " node-path";
        const a = draft ? draft.pickup : selected.a;
        const b = draft ? draft.drop : selected.b;
        if (n.id === a) cls += " node-a";
        if (n.id === b) cls += " node-b";
        return (
          <g key={n.id} onClick={() => onNodeClick(n.id)} className="node-group"
             onMouseEnter={() => onNodeHover && onNodeHover(n.id)} onMouseLeave={() => onNodeHover && onNodeHover(null)}>
            <circle cx={p.x} cy={p.y} r={9} className={cls} />
            <text x={p.x} y={p.y + 3} className="node-label">{n.id}</text>
          </g>
        );
      })}

      {/* ride being created: pulsing pickup and a flag on the destination */}
      {draft && (() => {
        const a = pos(byId(draft.pickup));
        const d = draft.drop === null ? null : pos(byId(draft.drop));
        return (
          <g pointerEvents="none">
            <circle cx={a.x} cy={a.y} r={14} className="pickup-pulse" />
            {d && <circle cx={d.x} cy={d.y} r={14} className="drop-ring" />}
          </g>
        );
      })()}

      {/* waiting riders */}
      {city.nodes.filter((n) => riderPickups.has(n.id)).map((n) => {
        const p = pos(n);
        return <circle key={`r${n.id}`} cx={p.x} cy={p.y} r={14} className="rider" />;
      })}

      {/* cabs */}
      {city.cabs.map((cab) => {
        let p = pos(byId(cab.node));
        if (cab.next != null) {                       // mid-road: slide towards the next node
          const q = pos(byId(cab.next));
          p = { x: p.x + (q.x - p.x) * cab.progress, y: p.y + (q.y - p.y) * cab.progress };
        }
        const cls = cab.free ? "cab" : cab.status === "on_trip" ? "cab cab-busy" : "cab cab-pickup";
        return (
          <g key={`cab${cab.id}`} className="cab-g" transform={`translate(${p.x + 6}, ${p.y - 22})`}>
            <rect width={20} height={14} rx={3} className={cls} />
            <text x={10} y={10.5} className="cab-label">{cab.id}</text>
          </g>
        );
      })}
    </svg>
  );
}
