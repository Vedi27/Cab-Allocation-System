"""
Time-based simulation (not one of the graded algorithms - it only uses them).

TIME MODEL
    One time unit = one unit of road weight. A road with w = 5 takes 5 time units
    to drive, so the weights from graph.py double as travel times. The clock is an
    integer and advances one unit per tick.

CAB LIFECYCLE
    free --assign--> to_pickup --(reaches pickup)--> on_trip --(reaches drop)--> free
    On assignment the cab gets a PLAN: [[node, arrival_time], ...] covering
    cab -> pickup -> drop. Its position at any clock value is read off that plan.
"""
import random

rng = random.Random(7)          # separate generator so graph.py's seed is untouched


def new_state():
    return {"clock": 0, "trips": [], "auto_assign": True, "spawn_prob": 0.0}


def start_trip(cab, request, to_pickup, trip, clock, adj):
    """Give a freshly assigned cab its plan. Called once per assignment."""
    plan, t = [[to_pickup["path"][0], clock]], clock
    for path in (to_pickup["path"], trip["path"]):
        for a, b in zip(path, path[1:]):
            t += _edge_weight(adj, a, b)
            plan.append([b, t])
    pickup_time = clock + to_pickup["distance"]
    cab.update(
        free=False, status="to_pickup", plan=plan, pickup_time=pickup_time,
        end_time=plan[-1][1], request=request, assigned_at=clock,
        next=None, progress=0.0,
    )


def _edge_weight(adj, a, b):
    return next(w for v, w in adj[a] if v == b)


def release(cab):
    cab.update(free=True, status="free", plan=None, request=None, next=None, progress=0.0)


def advance_cabs(cabs, clock, trips):
    """Move every busy cab to where the plan says it is at `clock`."""
    for cab in cabs:
        plan = cab.get("plan")
        if not plan:
            continue
        if clock >= cab["end_time"]:
            req = cab["request"]
            trips.append({
                "request": req["id"], "cab": cab["id"], "priority": req["priority"],
                "requested_at": req["created"], "assigned_at": cab["assigned_at"],
                "pickup_at": cab["pickup_time"], "dropped_at": cab["end_time"],
                "wait": cab["pickup_time"] - req["created"],
                "trip_time": cab["end_time"] - cab["pickup_time"],
            })
            cab["node"] = plan[-1][0]
            release(cab)
            continue
        i = max(k for k, (_, t) in enumerate(plan) if t <= clock)
        (node, t0), (nxt, t1) = plan[i], plan[i + 1]
        cab["node"], cab["next"] = node, nxt
        cab["progress"] = round((clock - t0) / (t1 - t0), 3)
        cab["status"] = "on_trip" if clock >= cab["pickup_time"] else "to_pickup"


def spawn_request(n_nodes, clock):
    pickup = rng.randrange(n_nodes)
    drop = rng.randrange(n_nodes - 1)
    if drop >= pickup:
        drop += 1                                   # guarantees drop != pickup
    return {"pickup": pickup, "drop": drop,
            "priority": 0 if rng.random() < 0.2 else 1, "created": clock}


def stats(sim, cabs):
    trips = sim["trips"]
    n = len(trips)
    busy = sum(1 for c in cabs if not c["free"])
    return {
        "completed": n,
        "avg_wait": round(sum(t["wait"] for t in trips) / n, 2) if n else None,
        "max_wait": max((t["wait"] for t in trips), default=None),
        "avg_trip": round(sum(t["trip_time"] for t in trips) / n, 2) if n else None,
        "busy_cabs": busy,
        "utilisation": round(100 * busy / len(cabs)) if cabs else 0,
    }
