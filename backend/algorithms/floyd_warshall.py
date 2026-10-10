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

IMPLEMENTED = True


def floyd_warshall(adj, n):
    INF = float("inf")
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
        for v, w in adj[i]:
            if w < dist[i][v]:
                dist[i][v] = w

    operations = 0
    for k in range(n):
        dk = dist[k]
        for i in range(n):
            di = dist[i]
            dik = di[k]
            for j in range(n):
                operations += 1
                if dik + dk[j] < di[j]:
                    di[j] = dik + dk[j]
    return {"dist": dist, "operations": operations, "implemented": IMPLEMENTED}
