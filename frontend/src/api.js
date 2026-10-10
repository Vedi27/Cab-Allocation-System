// All calls to the FastAPI server live here.
const BASE = "http://localhost:8000";

async function get(path) {
  const res = await fetch(BASE + path);
  return res.json();
}

async function post(path, body = {}) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const api = {
  status: () => get("/status"),
  city: () => get("/city"),
  reset: () => post("/reset"),
  route: (src, dst) => post("/route", { src, dst }),
  precompute: () => post("/precompute"),
  distance: (src, dst) => post("/distance", { src, dst }),
  addRequest: (pickup, drop, priority) => post("/requests", { pickup, drop, priority }),
  requests: () => get("/requests"),
  assign: () => post("/assign"),
  freeAllCabs: () => post("/cabs/free-all"),
  kthNearest: (node, k) => post("/kth-nearest", { node, k }),
  sim: () => get("/sim"),
  simConfig: (auto_assign, spawn_prob) => post("/sim/config", { auto_assign, spawn_prob }),
  simTick: (dt = 1) => post("/sim/tick", { dt }),
  simRide: (pickup, drop, priority) => post("/sim/ride", { pickup, drop, priority }),
  benchmark: () => get("/benchmark"),
};
