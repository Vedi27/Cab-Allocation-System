# Cab Allocation System — Backend and Algorithm Documentation

## 1. System overview

This project is a lightweight FastAPI backend for a city-based cab allocation simulator. The backend does not use a database; it keeps the live city, waiting ride requests, and simulation state in memory while the server is running.

The core components are:

- `backend/graph.py`: builds the city graph as a weighted adjacency list
- `backend/main.py`: exposes the API and orchestrates route generation, requests, assignment, and simulation
- `backend/simulation.py`: advances cab motion over time and tracks trip metrics
- `backend/algorithms/`: contains the algorithm implementations used by the frontend and backend routes

### Runtime architecture

The backend follows a simple event-driven pattern:

1. The city is created as a grid graph.
2. Requests are queued with priority and arrival order.
3. A free cab is selected for a rider using shortest-path information.
4. The assigned cab follows a route to the rider and then to the destination.
5. Simulation time advances in ticks and cabs move along their plan.

### Main API responsibilities

The FastAPI app in `backend/main.py` provides routes for:

- city generation and reset
- shortest path queries
- all-pairs distance precomputation
- request enqueueing
- assignment of riders to cabs
- real-time simulation configuration and tick updates
- k-th nearest cab lookup
- benchmark/empirical analysis

## 2. Backend architecture in detail

### 2.1 City model

The graph is represented as an adjacency list:

- each node corresponds to a map cell `(row, col)`
- node id is `row * cols + col`
- edges are undirected and weighted
- weight represents distance/time cost

This is created by `build_city()` in `backend/graph.py`.

Important design properties:

- city is a grid, not a general graph
- each road has random weight between 1 and 9
- cabs are randomly placed across the city
- the graph is used by all shortest-path algorithms

### 2.2 Request queue

Requests are stored in a custom binary min-heap (`RequestQueue`) implemented in `backend/algorithms/request_queue.py`.

Ordering is by:

1. `priority` (smaller value is served first)
2. `arrival` (older requests are served earlier)

This is a standard priority queue idea. It is used to ensure urgent riders are handled sooner than ordinary riders and that older waiting requests are not starved.

### 2.3 Assignment pipeline

When a ride is assigned:

1. The backend collects all free cabs.
2. For each free cab, it runs Dijkstra from the cab position to the rider pickup node.
3. It creates a ranking of cabs by route distance.
4. It sorts the ranking using merge sort.
5. The nearest available cab is chosen greedily.

This is implemented in `backend/algorithms/assignment.py`.

### 2.4 Simulation model

The simulation layer, `backend/simulation.py`, tracks:

- current clock
- in-progress trips
- completed trips
- cab status (`free`, `to_pickup`, `on_trip`)
- request metadata
- trip wait and trip duration statistics

A cab receives a full plan when assigned:

- cab -> pickup route
- pickup -> drop route

Then each time tick advances the cab position using the stored plan and `clock`.

### 2.5 In-memory state

`backend/main.py` keeps global in-memory objects:

- `city` = current graph + cabs + nodes + edges
- `queue` = waiting rider requests
- `precomputed` = all-pairs distance table
- `sim` = simulation state

That means the system is a single-server simulation, not a production multi-process distributed service. It is great for teaching algorithms and demonstrating how graph problems map to a ride-sharing flow.

## 3. Algorithm-by-algorithm explanation

## 3.1 Dijkstra's shortest path algorithm

File: `backend/algorithms/dijkstra.py`

### Problem
Given a weighted graph and a source node, find the shortest distance and path to a destination node.

### Why it is used here
It computes:

- route from cab to rider pickup
- route from rider pickup to drop destination
- ETA for the current trip
- path visualization on the frontend map

### Idea
Dijkstra works on the principle of expanding the least-cost node first.

The code maintains:

- `dist`: current best known distance to each node
- `parent`: predecessor used to reconstruct path
- `heap`: min-heap ordered by distance
- `visited`: nodes popped from the heap
- `operations`: counts edge relaxation attempts

The algorithm repeatedly pops the node with the smallest tentative distance and relaxes its neighbors.

### Pseudocode

```
initialize dist[src] = 0
push (0, src) into heap
while heap not empty:
    u = pop minimum distance node
    if u is destination: stop
    for each edge (u, v, w):
        nd = dist[u] + w
        if nd < dist[v]:
            dist[v] = nd
            parent[v] = u
            push (nd, v)
```

### Correctness intuition
Because all edge weights are non-negative, once a node is popped from the min-heap with the minimum known distance, that distance is final. This guarantees the shortest path is discovered without revisiting nodes with worse cost.

### Complexity

For a graph with `V` vertices and `E` edges:

- Time: `O((V + E) log V)`
- Space: `O(V)`

This is efficient enough for route queries in a moderate-size city graph.

### Edge cases

- disconnected graph: destination unreachable -> `distance = None`
- multiple equal-length paths: algorithm still returns one shortest path
- zero-weight edges: still valid because weights are non-negative

## 3.2 Floyd-Warshall algorithm

File: `backend/algorithms/floyd_warshall.py`

### Problem
Compute the shortest path between every pair of nodes in the graph.

### Why it is used here
The backend exposes a precompute mode to calculate the whole distance matrix for the current city. This is useful for comparison with Dijkstra and for quick lookup after preprocessing.

### Idea
The algorithm considers every intermediate node `k` and checks whether going from `i` to `j` through `k` is shorter than the current best distance.

### Relational update

```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

### Correctness intuition
It builds shortest paths in increasing order of allowed intermediate nodes. By the time all `k` are processed, every shortest route using any intermediate nodes has been considered.

### Complexity

For `V` nodes:

- Time: `O(V^3)`
- Space: `O(V^2)`

### Trade-off vs Dijkstra

- Dijkstra is better when only a few source-destination queries are needed.
- Floyd-Warshall is superior when lots of pairwise distances must be queried repeatedly after one expensive preprocessing step.

### Edge cases

- Graph with no path: matrix entry remains `inf`
- Graph with self-loops: diagonal is kept as `0`

## 3.3 Request queue as a min-heap

File: `backend/algorithms/request_queue.py`

### Problem
Maintain waiting ride requests so that the most urgent and oldest requests are processed first.

### Why it is used here
This models a real dispatch queue. Urgent requests are prioritized over normal ones, and among same-priority requests, older ones are served earlier.

### Heap ordering
The queue orders requests by the tuple:

```
(priority, arrival)
```

where:

- smaller `priority` = more urgent
- smaller `arrival` = older request

### Operations

- `push`: insert request and sift upward
- `pop`: remove root and sift downward
- `size`: current queue length
- `all_items`: sorted copy for viewing waiting requests

### Complexity

For `n` requests:

- push: `O(log n)`
- pop: `O(log n)`
- space: `O(n)`

### Why it works
A binary heap maintains the smallest element at the root, and the heap property guarantees that parent nodes are never larger than their children when using the chosen comparator.

## 3.4 Merge sort for cab ranking

File: `backend/algorithms/merge_sort.py`

### Problem
Sort candidate cabs by distance to the rider pickup node.

### Why it is used here
After Dijkstra gives a distance for each free cab, the app ranks the candidates by nearest first.

### Idea
Merge sort splits the list into halves, recursively sorts both halves, then merges them while preserving order.

### Pseudocode

```
merge_sort(items):
    if len(items) <= 1: return items
    left = sort(items[:mid])
    right = sort(items[mid:])
    merge left and right in order
```

### Complexity

- Time: `O(n log n)`
- Space: `O(n)`

### Why not a quicker sort?
This implementation is intentionally educational and counts comparisons explicitly for the complexity panel, which makes it useful for algorithm analysis.

### Edge cases

- equal distances: the implementation uses `<=`, which makes the sort stable
- empty list: returns empty list

## 3.5 Greedy cab assignment

File: `backend/algorithms/assignment.py`

### Problem
Choose the best free cab for a rider.

### Why it is used here
This is the core dispatch decision in the app: assign the rider to the nearest available cab.

### Approach
For every free cab:

1. Run Dijkstra from cab to pickup
2. Record distance
3. Add tuple `(cab_id, distance)`
4. Sort all tuples by distance
5. Take the first cab

### Why greedy works here
The algorithm chooses the current best local option — the nearest free cab. This matches the design objective of minimizing pickup response time, even though it does not consider future requests or global optimization across all riders.

### Complexity
If there are `k` free cabs:

- each Dijkstra run: `O((V + E) log V)`
- ranking sort: `O(k log k)`
- total: `O(k (V + E) log V + k log k)`

### Trade-offs

Advantages:

- simple
- fast enough in a small simulation
- easy to explain

Disadvantages:

- may not be globally optimal for many riders simultaneously
- ignores future demand and fairness across cabs
- can leave some cabs idle while another rider is assigned poorly

### Edge cases

- no free cabs -> returns `cab_id = None`
- rider unreachable from all cabs -> `ranking` remains empty or filtered out

## 3.6 k-th nearest free cab via median-of-medians

File: `backend/algorithms/kth_nearest.py`

### Problem
Find the `k`-th nearest free cab to a given node.

### Why it is used here
This is the “Backup Cab Finder” feature. It returns the nearest cab in rank order without fully sorting the entire list.

### Idea
Instead of sorting all distances, it uses the median-of-medians selection strategy:

1. split values into groups of size 5
2. find median of each group
3. recursively find the median of medians as pivot
4. partition values around the pivot
5. recurse only in the relevant partition

This avoids the full `O(n log n)` sort and gives worst-case `O(n)` selection time.

### Correctness intuition
The pivot is chosen from medians of medians, which keeps the partition approximately balanced. That ensures the search discards at least a constant fraction of elements each recursion, yielding worst-case linear time.

### Complexity

- Time: `O(n)` worst-case
- Space: `O(n)` recursion + grouping overhead

### Comparison with merge sort

- merge sort sorts all values completely
- median-of-medians selects only the needed rank

This makes it more efficient for “find the 7th nearest” than sorting all distances.

### Edge cases

- no free cabs -> return message
- invalid `k` -> reject request
- duplicate distances: selection still works because it compares numeric values

## 3.7 City simulation and trip lifecycle

File: `backend/simulation.py`

### Lifecycle
A cab moves through the following statuses:

1. `free`
2. assigned to pickup
3. `to_pickup`
4. `on_trip`
5. back to `free`

### How the plan is generated
When a trip is started, the backend builds a plan made of timestamped path points:

- cab -> pickup path
- pickup -> drop path

The route and time cost are derived from the graph edges. Each edge weight acts as travel time.

### Why this matters
This lets the frontend animate cabs moving along the road graph with realistic trip flow and ETA estimates.

### Metrics computed

- `wait`: time from ride request creation to pickup
- `trip_time`: time from pickup to drop
- `avg_wait`, `avg_trip`, `max_wait`, utilization

## 4. End-to-end request flow

### Example flow

1. A rider requests a trip from one node to another.
2. The request is inserted into the priority queue.
3. `assign_one()` pops the next request.
4. The system tests all free cabs.
5. Dijkstra calculates each cab’s distance to the pickup.
6. Merge sort ranks the cabs.
7. The nearest free cab is chosen.
8. A trip plan is built for cab movement over time.
9. Simulation ticks advance the cab until the trip is complete.

This is a classic dispatch cycle: queue -> ranking -> assignment -> simulation.

## 5. Backend technical FAQ

### Q1. Why is there no database in the backend?
Because this project is designed as a teaching/demo application. It stores state in memory, which is enough for a local simulation and makes the algorithm logic easier to observe.

### Q2. Why are all weights random in the city graph?
The map is synthetic. Random weights model roads of varying lengths or travel times, and they make the shortest path problem non-trivial.

### Q3. Why does the backend use a custom heap instead of Python's `heapq` in the request queue?
The project intentionally implements its own array-based binary heap to teach data structures and to count comparisons for demonstration in the complexity panel.

### Q4. Why is Dijkstra used instead of Floyd-Warshall for route requests?
Dijkstra is more efficient for single-source shortest-path queries. It is the correct choice when the app asks for one route at a time.

### Q5. Why is greedy assignment used instead of a global optimization algorithm?
Greedy is simple, deterministic, and educational. It matches the project’s objective of “nearest free cab” dispatch, though it is not globally optimal for large-scale fleet optimization.

### Q6. Why can a ride remain queued?
A request is reinserted into the queue when no free cab can currently reach it. The app keeps trying when cabs become free later.

### Q7. Is this production-grade dispatch logic?
Not by itself. It is a pedagogical simulation and a teaching platform for algorithm comparison. It does not include advanced features such as:

- multi-agent optimization
- real-time fleet balancing
- geographic clustering
- traffic prediction
- database-backed reservations
- distributed worker services

### Q8. How does the app know whether a cab is free?
The cab object includes fields like `free`, `status`, `plan`, `request`, and `end_time`. The simulation updates these as trips progress.

## 6. Theory FAQ

### Q1. Why does Dijkstra require non-negative weights?
With negative edge weights, a node could appear to have a better path later, which breaks the “once popped, final” property. Dijkstra relies on non-negative weights to guarantee correctness.

### Q2. Why does merge sort take `O(n log n)`?
The algorithm splits the list into halves repeatedly and then merges two sorted halves. Each level costs `O(n)`, and there are `O(log n)` levels.

### Q3. Why is median-of-medians better than full sorting when only `k`-th order is needed?
Sorting all values computes more information than is required. Selecting the `k`-th value only needs to narrow the search space, which is why a linear-time selection method can be more efficient.

### Q4. Is the greedy cab assignment always optimal?
No. It is optimal for the immediate goal of choosing the nearest free cab, but not necessarily for a global objective like minimizing total pickup time across all riders or maximizing fleet efficiency.

### Q5. When would Floyd-Warshall be a better choice than Dijkstra?
When the app repeatedly asks for many shortest path queries on the same graph, and precomputation cost can be amortized.

### Q6. Why does the city graph use an adjacency list instead of a matrix?
A sparse grid graph is naturally represented as adjacency lists. That saves memory and makes neighbor iteration straightforward.

### Q7. What makes this system a valid algorithm demonstration?
Each feature maps directly to a standard algorithmic concept:

- shortest path: Dijkstra
- all-pairs shortest paths: Floyd-Warshall
- waiting request prioritization: heap-based priority queue
- sorting: merge sort
- nearest dispatch: greedy selection
- rank selection: median-of-medians

## 7. Practical implications and possible improvements

This project is an excellent educational model, but real-world cab allocation systems usually add more sophisticated logic:

- dynamic pricing
- demand forecasting
- fairness constraints
- capacity of multiple passengers
- real-time traffic conditions
- driver shift and availability constraints
- optimization across entire fleet, not just nearest cab

A production-grade system would likely use a combination of:

- shortest path algorithms for routing
- assignment optimization (min-cost flow / bipartite matching / auction-based assignment)
- queueing theory for demand spikes
- distributed services for data, telemetry, and scheduling

## 8. Summary

The backend is a compact, in-memory cab dispatch simulator whose purpose is to demonstrate core algorithmic concepts in a visually engaging setting. The architecture is intentionally simple:

- graph model = city map + weighted roads
- queue = prioritized ride requests
- assignment = nearest free cab by shortest path
- ranking = merge sort
- simulation = time-based movement and trip tracking
- advanced selection = median-of-medians for kth nearest

This makes the project ideal for learning graph algorithms, data structures, and algorithmic trade-offs in a real-world application context.

## 9. Relevant project files

- `backend/main.py`
- `backend/graph.py`
- `backend/simulation.py`
- `backend/algorithms/dijkstra.py`
- `backend/algorithms/floyd_warshall.py`
- `backend/algorithms/request_queue.py`
- `backend/algorithms/merge_sort.py`
- `backend/algorithms/assignment.py`
- `backend/algorithms/kth_nearest.py`
- `backend/requirements.txt`
- `README.md`

This documentation reflects the implementation currently present in the repository.
