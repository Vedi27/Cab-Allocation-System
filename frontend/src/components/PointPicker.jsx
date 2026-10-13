// Shows which map points are selected. labels = ["Start", "End"] etc.
export default function PointPicker({ selected, labels, single = false }) {
  return (
    <div className="picker">
      <div className="pick">
        <span className="pick-dot a" />
        <span className="pick-label">{labels[0]}</span>
        <b>{selected.a ?? "Click the map"}</b>
      </div>
      {!single && (
        <div className="pick">
          <span className="pick-dot b" />
          <span className="pick-label">{labels[1]}</span>
          <b>{selected.b ?? (selected.a === null ? "-" : "Click a second point")}</b>
        </div>
      )}
    </div>
  );
}

// Small label + value boxes for results
export function Stats({ items }) {
  return (
    <div className="stats">
      {items.map(([label, value]) => (
        <div key={label} className="stat">
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </div>
  );
}
