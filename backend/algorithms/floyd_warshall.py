"""
Feature 3 - Instant distance lookup (precompute mode)
Algorithm: Floyd-Warshall (Dynamic Programming)      Unit IV
Time: O(V^3)     Space: O(V^2)

INPUT
    adj : adjacency list, adj[u] = [(v, weight), ...]
    n   : number of nodes (ids are 0 .. n-1)

OUTPUT (keep these exact keys)
    {
        "dist":       n x n list of lists, dist[i][j] = shortest distance,
        "operations": number of times the triple loop body ran (should be n^3),
        "implemented": True
    }

TODO: replace the placeholder.
Hint: start with dist[i][i] = 0, dist[u][v] = w for every edge, everything else = float('inf').
      Then: for k: for i: for j: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
"""

IMPLEMENTED = False


def floyd_warshall(adj, n):
    # ---- PLACEHOLDER: unknown distances everywhere ----
    dist = [[None] * n for _ in range(n)]
    return {"dist": dist, "operations": 0, "implemented": IMPLEMENTED}
