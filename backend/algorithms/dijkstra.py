"""
Feature 2 - Route finding and ETA
Algorithm: Dijkstra with a min-heap          Unit V
Time: O((V + E) log V)     Space: O(V)

INPUT
    adj  : adjacency list, adj[u] = [(v, weight), ...]
    src  : start node id
    dst  : end node id

OUTPUT (keep these exact keys, the frontend depends on them)
    {
        "path":       [src, ..., dst],   # nodes on the shortest route
        "distance":   total weight,      # None if unreachable
        "visited":    [nodes in the order they were popped from the heap],
        "operations": number of edge relaxations (for the complexity panel),
        "implemented": True
    }

DONE.
Hint: import heapq; heap holds (distance, node); keep dist{} and parent{};
      append each popped node to visited; count every relaxation in operations;
      rebuild the path by following parent[] back from dst.
"""

import heapq

IMPLEMENTED = True


def dijkstra(adj, src, dst):
    dist = {src: 0}
    parent = {}
    visited = []
    done = set()
    operations = 0
    heap = [(0, src)]

    while heap:
        d, u = heapq.heappop(heap)
        if u in done:
            continue                      # stale heap entry
        done.add(u)
        visited.append(u)
        if u == dst:
            break
        for v, w in adj[u]:
            operations += 1               # one edge relaxation attempt
            nd = d + w
            if nd < dist.get(v, float("inf")):
                dist[v] = nd
                parent[v] = u
                heapq.heappush(heap, (nd, v))

    if dst not in done:
        return {"path": [], "distance": None, "visited": visited,
                "operations": operations, "implemented": IMPLEMENTED}

    path = [dst]
    while path[-1] != src:
        path.append(parent[path[-1]])
    path.reverse()
    return {"path": path, "distance": dist[dst], "visited": visited,
            "operations": operations, "implemented": IMPLEMENTED}
