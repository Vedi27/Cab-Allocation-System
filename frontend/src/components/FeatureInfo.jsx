// Top of the right panel: name, algorithm, explanation, steps, complexity.
import { FEATURES } from "../features";

export default function FeatureInfo({ id }) {
  const f = FEATURES[id];
  return (
    <div className="feature-info">
      <h2>{f.name}</h2>
      <p className="feature-algo">
        {f.algorithm} <span className="unit-chip">{f.unit}</span>
      </p>
      <p className="feature-about">{f.about}</p>

      <ol className="feature-steps">
        {f.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>

      {f.time && (
        <div className="complexity">
          <div><span>Time</span><b>{f.time}</b></div>
          {f.space && <div><span>Space</span><b>{f.space}</b></div>}
        </div>
      )}
    </div>
  );
}
