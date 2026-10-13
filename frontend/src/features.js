// Names, explanations and complexity for every feature.
// The sidebar and the right-hand panel both read from this list.

export const GROUPS = [
  { title: "Dispatch", ids: ["sim", "backup"] },
  { title: "Routing", ids: ["route", "table"] },
  { title: "City", ids: ["city"] },
  { title: "Analysis", ids: ["performance"] },
];

export const FEATURES = {
  sim: {
    name: "Live Ride Dispatch",
    algorithm: "Min-heap queue + greedy nearest cab",
    unit: "Units III and V",
    icon: "cab",
    about:
      "Book rides on the map and watch the cabs serve them in real time. Every request joins a min-heap queue: priority riders first, then whoever has waited longest. When a cab is free, Dijkstra measures each free cab's road distance to the pickup, merge sort ranks them, and the greedy choice sends the nearest one.",
    steps: [
      "Tap a pickup point on the map, then hover to preview the route and tap a destination.",
      "Choose Standard or Priority (1.5× fare, served before standard riders). Below the button, see how every free cab ranked.",
      "If every cab is busy, the rider waits in the ride queue on the right, in min-heap order.",
      "The cab drives to the rider, then to the drop point. Road numbers are minutes of travel.",
    ],
    time: "Queue O(log n); dispatch O(k (V + E) log V + k log k), k = free cabs",
    space: "O(V + n)",
  },
  backup: {
    name: "Backup Cab Finder",
    algorithm: "Median-of-medians selection",
    unit: "Unit III, Divide & Conquer",
    icon: "backup",
    about:
      "If the nearest driver declines, find the 2nd or 3rd nearest free cab without sorting every cab. Median of medians picks a good pivot, so the search recurses into one side only and stays linear in the worst case.",
    steps: [
      "Pick the rider's location as point A and choose k.",
      "Road distances to all free cabs are measured with Dijkstra.",
      "Selection returns the k-th smallest distance, and that cab's route is drawn.",
    ],
    time: "O(n) worst case",
    space: "O(n)",
  },
  route: {
    name: "Shortest Route Finder",
    algorithm: "Dijkstra with a min-heap",
    unit: "Unit V, Greedy",
    icon: "route",
    about:
      "Finds the fastest route between two points and its travel time. Dijkstra greedily expands the closest unvisited intersection first, so each node's distance is final the moment it leaves the heap.",
    steps: [
      "Pick a start point A and an end point B on the map.",
      "Watch the explored intersections light up in the order Dijkstra settles them.",
      "The shortest route is then drawn, with its distance and the work done.",
    ],
    time: "O((V + E) log V)",
    space: "O(V)",
  },
  table: {
    name: "All-Pairs Distance Table",
    algorithm: "Floyd-Warshall",
    unit: "Unit IV, Dynamic Programming",
    icon: "table",
    about:
      "Computes the shortest distance between every pair of intersections once and stores it in a table. After that, any distance is a single lookup. Compare that with running Dijkstra every time.",
    steps: [
      "Build the table once (it tries every node k as a stop between every pair i, j).",
      "Pick two points A and B.",
      "Compare the instant table lookup with a fresh Dijkstra run.",
    ],
    time: "O(V³) to build, O(1) per lookup",
    space: "O(V²)",
  },
  city: {
    name: "City Network",
    algorithm: "Weighted graph, adjacency list",
    unit: "Unit III",
    icon: "grid",
    about:
      "The city is a graph. Every intersection is a node and every road is a weighted edge, where the weight is its travel time in minutes. Each node keeps a list of its neighbours, so finding the roads out of a junction is quick.",
    steps: [
      "Click any intersection on the map.",
      "Its adjacency list appears below: each neighbour and the road weight to reach it.",
    ],
    time: "O(deg(v)) to list neighbours",
    space: "O(V + E)",
  },
  performance: {
    name: "Algorithm Performance",
    algorithm: "Empirical and asymptotic analysis",
    unit: "Units I and II",
    icon: "chart",
    about:
      "Runs every algorithm on inputs of growing size and counts the operations. Dijkstra and Floyd-Warshall run on bigger and bigger cities; the heap, merge sort and median of medians run on longer and longer random lists. Each chart compares the measured work with the growth the theory predicts.",
    steps: [
      "Run the benchmark.",
      "Check that each bar chart follows its dashed theory line (n log n, n or n³).",
      "In the bottom table, each \"÷\" column stays roughly constant as n grows, which confirms the complexity.",
    ],
    time: "",
    space: "",
  },
};
