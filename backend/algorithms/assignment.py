"""
Feature 5 (part 2) - Cab assignment
Strategy: Greedy - give the rider the nearest free cab      Unit V
Time: k Dijkstra runs + one sort  ->  O(k (V + E) log V + k log k), k = free cabs

INPUT
    request : {"id", "pickup", "drop", ...}
    cabs    : list of {"id", "node", "free"}
    adj     : adjacency list

OUTPUT (keep these exact keys)
    {
        "cab_id":   chosen cab id (None if no cab is free),
        "ranking":  [{"cab": id, "distance": d}, ...] sorted nearest first,
        "route":    the Dijkstra result from the chosen cab to the pickup,
        "implemented": True
    }

TODO: replace the placeholder:
      1. for each FREE cab, run dijkstra(adj, cab["node"], request["pickup"])
      2. build ranking = [{"cab": cab id, "distance": result["distance"]}, ...]
      3. ranking, _ = merge_sort(ranking, "distance")
      4. greedy choice: the first cab in ranking
"""
from algorithms.dijkstra import dijkstra
from algorithms.merge_sort import merge_sort  # noqa: F401  (you will use it)

from algorithms.dijkstra import dijkstra
from algorithms.merge_sort import merge_sort

IMPLEMENTED = True


def assign_cab(request, cabs, adj):
    free = [c for c in cabs if c["free"]]
    ranking = []
    routes = {}
    for cab in free:
        res = dijkstra(adj, cab["node"], request["pickup"])
        if res["distance"] is None:
            continue                              # cannot reach the rider
        routes[cab["id"]] = res
        ranking.append({"cab": cab["id"], "distance": res["distance"]})

    if not ranking:
        return {"cab_id": None, "ranking": [], "route": None, "implemented": IMPLEMENTED}

    ranking, _ = merge_sort(ranking, "distance")
    chosen = ranking[0]["cab"]                    # greedy: nearest free cab
    return {"cab_id": chosen, "ranking": ranking, "route": routes[chosen],
            "implemented": IMPLEMENTED}
