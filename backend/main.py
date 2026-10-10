"""
FastAPI server - ONLY routes live here.
Every algorithm is in the algorithms/ folder. This file just calls them
and sends the results to React as JSON.

Run:  uvicorn main:app --reload --port 8000
Test: open http://localhost:8000/docs
"""
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from graph import build_city
from algorithms import dijkstra as dj, floyd_warshall as fw, request_queue as rq
from algorithms import merge_sort as ms, assignment as asg, kth_nearest as kn

app = FastAPI(title="Cab Allocation System")

# allow the React dev server (port 5173) to call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- app state (kept in memory while the server runs) ----------
city = build_city()
queue = rq.RequestQueue()
precomputed = {"dist": None}
counter = {"arrival": 0, "request_id": 0}


# ---------- request bodies ----------
class RouteIn(BaseModel):
    src: int
    dst: int


class RideIn(BaseModel):
    pickup: int
    drop: int
    priority: int = 1          # 0 = urgent, 1 = normal


class KthIn(BaseModel):
    node: int
    k: int


# ---------- helpers ----------
def public_city():
    """City without the adjacency list (React only needs nodes, edges, cabs)."""
    return {k: city[k] for k in ["rows", "cols", "nodes", "edges", "cabs"]}


def timed(fn, *args):
    start = time.perf_counter()
    result = fn(*args)
    return result, round((time.perf_counter() - start) * 1000, 3)


# ---------- routes ----------
@app.get("/status")
def status():
    """Which algorithms are real and which are still placeholders."""
    return {
        "dijkstra": dj.IMPLEMENTED,
        "floyd_warshall": fw.IMPLEMENTED,
        "request_queue": rq.IMPLEMENTED,
        "merge_sort": ms.IMPLEMENTED,
        "assignment": asg.IMPLEMENTED,
        "kth_nearest": kn.IMPLEMENTED,
    }


# Feature 1
@app.get("/city")
def get_city():
    return public_city()


@app.post("/reset")
def reset():
    global city, queue
    city = build_city()
    queue = rq.RequestQueue()
    precomputed["dist"] = None
    counter["arrival"] = counter["request_id"] = 0
    return public_city()


# Feature 2
@app.post("/route")
def route(body: RouteIn):
    result, ms_taken = timed(dj.dijkstra, city["adj"], body.src, body.dst)
    result["time_ms"] = ms_taken
    return result


# Feature 3
@app.post("/precompute")
def precompute():
    n = len(city["nodes"])
    result, ms_taken = timed(fw.floyd_warshall, city["adj"], n)
    precomputed["dist"] = result["dist"]
    return {"operations": result["operations"], "time_ms": ms_taken, "implemented": result["implemented"]}


@app.post("/distance")
def distance(body: RouteIn):
    if precomputed["dist"] is None:
        return {"distance": None, "message": "Run precompute first"}
    start = time.perf_counter()
    d = precomputed["dist"][body.src][body.dst]
    if d == float("inf"):
        d = None
    ms_taken = round((time.perf_counter() - start) * 1000, 4)
    return {"distance": d, "time_ms": ms_taken}


# Feature 4
@app.post("/requests")
def add_request(body: RideIn):
    counter["request_id"] += 1
    counter["arrival"] += 1
    req = {"id": counter["request_id"], "pickup": body.pickup, "drop": body.drop,
           "priority": body.priority, "arrival": counter["arrival"]}
    queue.push(req)
    return {"added": req, "waiting": queue.all_items()}


@app.get("/requests")
def list_requests():
    return {"waiting": queue.all_items(), "operations": queue.operations}


# Feature 5
@app.post("/assign")
def assign_next():
    req = queue.pop()
    if req is None:
        return {"message": "No waiting requests"}

    result = asg.assign_cab(req, city["cabs"], city["adj"])
    if result["cab_id"] is None:
        queue.push(req)                      # put the rider back
        return {"message": "No free cab right now", "request": req}

    for cab in city["cabs"]:
        if cab["id"] == result["cab_id"]:
            cab["free"] = False
    trip = dj.dijkstra(city["adj"], req["pickup"], req["drop"])
    return {"request": req, **result, "trip": trip, "cabs": city["cabs"], "waiting": queue.all_items()}


@app.post("/cabs/free-all")
def free_all_cabs():
    for cab in city["cabs"]:
        cab["free"] = True
    return {"cabs": city["cabs"]}


# Feature 11 (optional)
@app.post("/kth-nearest")
def kth_nearest(body: KthIn):
    free = [c for c in city["cabs"] if c["free"]]
    pairs = []
    for cab in free:
        d = dj.dijkstra(city["adj"], cab["node"], body.node)["distance"]
        if d is not None:
            pairs.append((d, cab["id"]))
    if not pairs:
        return {"message": "Dijkstra must return distances first"}
    if not 1 <= body.k <= len(pairs):
        return {"message": f"k must be between 1 and {len(pairs)}"}

    value, comparisons = kn.kth_smallest([d for d, _ in pairs], body.k)
    cab_id = next(cid for d, cid in pairs if d == value)
    return {"k": body.k, "distance": value, "cab_id": cab_id,
            "comparisons": comparisons, "implemented": kn.IMPLEMENTED}


# Feature 8 - empirical analysis: run the algorithms on bigger and bigger cities
@app.get("/benchmark")
def benchmark():
    rows = []
    for size in [4, 6, 8, 10, 12]:
        test_city = build_city(rows=size, cols=size, num_cabs=1)
        n = size * size
        d_res, d_ms = timed(dj.dijkstra, test_city["adj"], 0, n - 1)
        f_res, f_ms = timed(fw.floyd_warshall, test_city["adj"], n)
        rows.append({
            "n": n,
            "dijkstra_ms": d_ms, "dijkstra_ops": d_res["operations"],
            "floyd_ms": f_ms, "floyd_ops": f_res["operations"],
        })
    return {"results": rows}
