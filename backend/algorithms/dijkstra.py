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

TODO: replace the placeholder below with real Dijkstra.
Hint: import heapq; heap holds (distance, node); keep dist{} and parent{};
      append each popped node to visited; count every relaxation in operations;
      rebuild the path by following parent[] back from dst.
"""

IMPLEMENTED = False


def dijkstra(adj, src, dst):
    # ---- PLACEHOLDER: just a straight line, so the app runs ----
    return {
        "path": [src, dst],
        "distance": None,
        "visited": [],
        "operations": 0,
        "implemented": IMPLEMENTED,
    }
