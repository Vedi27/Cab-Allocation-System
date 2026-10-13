// "Book a ride" panel (left column), laid out like a ride-hailing app:
// pickup / destination timeline, ride options with ETA and fare, one big Book button.
// Pickup and destination are set by clicking the map; hovering a node previews the trip.
import { useState } from "react";

const ICON = { standard: "🚕", priority: "⚡" };

export default function BookingPanel({ draft, setDraft, quote, onSubmit, lastRide, dismissLast, error }) {
  const [type, setType] = useState("standard");
  const chosen = draft && draft.drop !== null;
  const hasPickup = !!draft;
  const dest = chosen ? draft.drop : quote ? quote.drop : null;
  const q = quote && dest === quote.drop ? quote : null;

  const eta = (ride) => {
    if (!q) return "";
    if (ride === "priority") return q.cab ? `${q.pickup_eta} min away` : "Front of the queue";
    return q.cab ? `${q.pickup_eta} min away` : `Wait ~${q.next_free_in ?? "?"} min`;
  };
  const fare = q ? q.fares[type] : null;
  const book = () => onSubmit(draft.pickup, draft.drop, type === "priority" ? 0 : 1);

  return (
    <aside className="card booking">
      <h2>Book a ride</h2>
      <p className="sub">{!hasPickup ? "Tap a spot on the map to set your pickup." : !chosen ? "Now tap where you're going." : "Review and confirm."}</p>

      {/* pickup -> destination timeline */}
      <div className="trip-card">
        <div className="trip-line" />
        <button className={"trip-row" + (hasPickup ? " filled" : " active")} onClick={() => hasPickup && setDraft(null)} title={hasPickup ? "Clear" : ""}>
          <i className="pin pin-a" />
          <span className="trip-text"><small>Pickup</small>{hasPickup ? `Intersection ${draft.pickup}` : "Tap the map"}</span>
          {hasPickup && <span className="x">✕</span>}
        </button>
        <button className={"trip-row" + (chosen ? " filled" : hasPickup ? " active" : "")}
                onClick={() => chosen && setDraft({ ...draft, drop: null })} title={chosen ? "Change destination" : ""}>
          <i className="pin pin-b" />
          <span className="trip-text">
            <small>Destination</small>
            {dest !== null ? `Intersection ${dest}` : hasPickup ? "Hover & tap the map" : "-"}
            {dest !== null && !chosen && <em> (preview)</em>}
          </span>
          {chosen && <span className="x">✕</span>}
        </button>
      </div>

      {/* ride options */}
      {q && (
        <div className="rides">
          <div className="trip-meta">Trip time <b>{q.trip_time} min</b></div>
          <div className="trip-meta">Dijkstra searched <b>{q.visited.length} intersections</b></div>
          {["standard", "priority"].map((r) => (
            <button key={r} className={"ride-opt" + (type === r ? " sel" : "")} onClick={() => setType(r)}>
              <span className="ride-ico">{ICON[r]}</span>
              <span className="ride-info">
                <b>{r === "standard" ? "Standard" : "Priority"}</b>
                <small>{eta(r)}</small>
                <small>{r === "standard" ? "Nearest free cab" : "Served before standard riders"}</small>
              </span>
              <span className="ride-fare">₹{q.fares[r]}</span>
            </button>
          ))}
          {!q.cab && (
            <p className="notice">All cabs are busy. You'll join the queue{q.queued ? ` (${q.queued} waiting)` : ""} and get the next free cab.</p>
          )}
        </div>
      )}

      {error && <p className="err">{error}</p>}
      <button className="book-btn" disabled={!chosen || !q} onClick={book}>
        {chosen && q ? `Book ${type === "priority" ? "Priority" : "Standard"} · ₹${fare}` : hasPickup ? "Choose a destination" : "Choose a pickup"}
      </button>
      {hasPickup && <button className="link-btn" onClick={() => setDraft(null)}>Cancel (Esc)</button>}

      {/* why this cab: free cabs ranked by road distance (Dijkstra + merge sort), greedy takes the first */}
      {q && q.ranking && q.ranking.length > 0 && (
        <div className="why-cab">
          <div className="why-head">
            <b>Why cab {q.ranking[0].cab}?</b>
            <small>Free cabs ranked by road distance to your pickup. Merge sort: {q.sort_comparisons} comparisons. Greedy picks the nearest.</small>
          </div>
          <ol className="rank-list">
            {q.ranking.map((x, i) => (
              <li key={x.cab} className={i === 0 ? "chosen" : ""}>
                <span>Cab {x.cab}</span>
                <span className="bar" style={{ width: `${(x.distance / Math.max(q.ranking.at(-1).distance, 1)) * 100}%` }} />
                <b>{x.distance} min</b>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* confirmation of the last booking */}
      {!hasPickup && lastRide && !lastRide.error && (
        <div className="booked">
          <span className="tick">✓</span>
          <div>
            <b>Ride #{lastRide.ride.id} booked</b>
            {lastRide.status === "assigned"
              ? <p>Cab {lastRide.cab} is on its way. Pickup in {lastRide.pickup_eta} min, drop in {lastRide.trip_eta} min.</p>
              : <p>All cabs busy. You're #{lastRide.position} in the queue.</p>}
            <button className="link-btn" onClick={dismissLast}>Dismiss</button>
          </div>
        </div>
      )}
    </aside>
  );
}
