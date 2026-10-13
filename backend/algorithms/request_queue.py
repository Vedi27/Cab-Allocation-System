"""
Feature 4 - Ride request queue
Data structure: Min-heap / priority queue (own array-based binary heap, no heapq)   Unit III
push: O(log n)    pop: O(log n)    Space: O(n)

Each request is a dict:
    {"id": 3, "pickup": 12, "drop": 57, "priority": 1, "arrival": 3}
Smaller (priority, arrival) = served first.
    priority 0 = urgent / premium,  priority 1 = normal
    arrival    = a counter; smaller means the rider has waited longer

Keep the method names below - main.py calls them.

How it works:
      push  -> append at the end, then sift UP
      pop   -> swap root with last, remove last, then sift DOWN
      count comparisons in self.operations
"""

IMPLEMENTED = True


class RequestQueue:
    """Array-based binary min-heap ordered by (priority, arrival)."""

    def __init__(self):
        self.items = []
        self.operations = 0

    def _less(self, a, b):
        self.operations += 1
        return (a["priority"], a["arrival"]) < (b["priority"], b["arrival"])

    def push(self, request):
        h = self.items
        h.append(request)
        i = len(h) - 1
        while i > 0:                              # sift up
            p = (i - 1) // 2
            if self._less(h[i], h[p]):
                h[i], h[p] = h[p], h[i]
                i = p
            else:
                break

    def pop(self):
        h = self.items
        if not h:
            return None
        top = h[0]
        last = h.pop()
        if h:
            h[0] = last
            i, n = 0, len(h)
            while True:                           # sift down
                l, r, s = 2 * i + 1, 2 * i + 2, i
                if l < n and self._less(h[l], h[s]):
                    s = l
                if r < n and self._less(h[r], h[s]):
                    s = r
                if s == i:
                    break
                h[i], h[s] = h[s], h[i]
                i = s
        return top

    def size(self):
        return len(self.items)

    def all_items(self):
        """Waiting requests in service order (sorted copy; the heap is untouched)."""
        return sorted(self.items, key=lambda r: (r["priority"], r["arrival"]))
