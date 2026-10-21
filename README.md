# Cab Allocation System 

React frontend + FastAPI backend. Every algorithm in `backend/algorithms/` is implemented.
The left menu opens each feature; its explanation, steps and complexity show on the right.

| Menu item | What it shows | Algorithm | Unit |
| --- | --- | --- | --- |
| Live Ride Dispatch | Book rides (Standard / Priority fares), cabs move in real time | Min-heap queue, Dijkstra, merge sort, greedy nearest cab | III, V |
| Backup Cab Finder | k-th nearest free cab | Median of medians | III |
| Shortest Route Finder | Fastest route between two points, animated | Dijkstra with a min-heap | V |
| All-Pairs Distance Table | Precompute every distance, compare with Dijkstra | Floyd-Warshall | IV |
| City Network | Adjacency list of any intersection | Weighted graph | III |
| Algorithm Performance | Measured operations vs theoretical complexity | Empirical analysis | I, II |

## Folder structure

```
cab-allocation/
├── backend/
│   ├── main.py              routes only (calls the algorithms)
│   ├── graph.py             grid city as an adjacency list
│   ├── simulation.py        time-based simulation (clock, cab trips, stats)
│   ├── requirements.txt
│   └── algorithms/
│       ├── dijkstra.py        shortest route
│       ├── floyd_warshall.py  all-pairs distances
│       ├── request_queue.py   min-heap ride queue
│       ├── merge_sort.py      ranking cabs by distance
│       ├── assignment.py      greedy nearest-cab dispatch
│       └── kth_nearest.py     median of medians
└── frontend/
    └── src/
        ├── App.jsx            layout, simulation timer, map state
        ├── App.css            light theme (colours at the top)
        ├── features.js        names, explanations and complexity of every feature
        ├── api.js             all calls to the backend
        └── components/
            ├── Sidebar.jsx         left menu
            ├── FeatureInfo.jsx     explanation block at the top of each panel
            ├── PointPicker.jsx     selected points + result boxes
            ├── CityMap.jsx         the map
            ├── BookingPanel.jsx    Book a ride (Live Ride Dispatch)
            ├── SimPanel.jsx        speed, active rides, fleet stats
            ├── KthPanel.jsx        Backup Cab Finder
            ├── RoutePanel.jsx      Shortest Route Finder
            ├── PrecomputePanel.jsx All-Pairs Distance Table
            ├── CityPanel.jsx       City Network
            └── ComplexityPanel.jsx Algorithm Performance
```

## Run it (two terminals)

**Terminal 1 - backend**
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Open http://localhost:8000/docs to test every route without the frontend.

**Terminal 2 - frontend**
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173
