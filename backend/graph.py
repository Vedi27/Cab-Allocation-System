"""
Feature 1 - City map.
Builds a grid city as a weighted graph stored in an ADJACENCY LIST.

Node id = row * cols + col
adj[u] = list of (v, weight) pairs
"""
import random


def build_city(rows=8, cols=10, num_cabs=6, seed=42):
    random.seed(seed)

    nodes = []
    for r in range(rows):
        for c in range(cols):
            nodes.append({"id": r * cols + c, "row": r, "col": c})

    adj = {node["id"]: [] for node in nodes}
    edges = []

    for r in range(rows):
        for c in range(cols):
            u = r * cols + c
            # connect to the right neighbour and the neighbour below
            neighbours = []
            if c + 1 < cols:
                neighbours.append(u + 1)
            if r + 1 < rows:
                neighbours.append(u + cols)
            for v in neighbours:
                w = random.randint(1, 9)        # road length / travel time
                adj[u].append((v, w))
                adj[v].append((u, w))           # roads are two-way
                edges.append({"u": u, "v": v, "w": w})

    cab_nodes = random.sample(range(rows * cols), num_cabs)
    cabs = [{"id": i + 1, "node": cab_nodes[i], "free": True} for i in range(num_cabs)]

    return {"rows": rows, "cols": cols, "nodes": nodes, "edges": edges, "adj": adj, "cabs": cabs}
