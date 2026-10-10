# Cab Allocation System (DAA Innovative Assignment)

React frontend + FastAPI backend. The app already runs end to end.
Every algorithm is a **placeholder** in `backend/algorithms/` - you replace them one by one.
The badges at the top of the page turn green when a file has `IMPLEMENTED = True`.

## Folder structure

```
cab-allocation/
├── backend/
│   ├── main.py              routes only (calls the algorithms)  - done
│   ├── graph.py             Feature 1: grid city, adjacency list - done
│   ├── requirements.txt
│   └── algorithms/
│       ├── dijkstra.py        Feature 2   - TODO
│       ├── floyd_warshall.py  Feature 3   - TODO
│       ├── request_queue.py   Feature 4   - TODO (min-heap)
│       ├── merge_sort.py      Feature 5   - TODO
│       ├── assignment.py      Feature 5   - TODO (greedy)
│       └── kth_nearest.py     Feature 11  - TODO (median of medians)
└── frontend/
    └── src/
        ├── App.jsx            layout, tabs, animation
        ├── App.css            light theme colours
        ├── api.js             all calls to the backend
        └── components/
            ├── CityMap.jsx         Feature 1 (map)
            ├── RoutePanel.jsx      Feature 2
            ├── PrecomputePanel.jsx Feature 3
            ├── RequestsPanel.jsx   Features 4 + 5
            ├── KthPanel.jsx        Feature 11
            └── ComplexityPanel.jsx Feature 8
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

## The "black box" rule

Each file in `algorithms/` has a comment block at the top with the exact
INPUT and OUTPUT. As long as your function returns those keys, nothing else
in the app needs to change. When you finish one:

1. Replace the placeholder code with your algorithm.
2. Set `IMPLEMENTED = True` at the top of the file.
3. Refresh the page; its badge turns green and the map shows the real result.

Suggested order: dijkstra → merge_sort → assignment → request_queue → floyd_warshall → kth_nearest.

## Work split

| Person A (algorithms)                         | Person B (frontend + analysis)                        |
| --------------------------------------------- | ----------------------------------------------------- |
| dijkstra.py, floyd_warshall.py                | Improve the map animation and styling                 |
| request_queue.py, merge_sort.py               | Add a chart in ComplexityPanel.jsx                    |
| assignment.py, kth_nearest.py                 | Complexity analysis write-up for the report           |

Swap a couple of algorithms between you so both can explain them in the viva.

## Working together with Git

1. One person creates a GitHub repo, pushes this folder, adds the partner as collaborator.
2. Each person works on a separate branch, e.g. `git checkout -b dijkstra`.
3. Since each algorithm is its own file, two people rarely edit the same file,
   so merges stay clean. Push, open a pull request, merge into `main`.
4. `git pull` on `main` before starting new work.
