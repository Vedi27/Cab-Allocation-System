"""
Feature 4 - Ride request queue
Data structure: Min-heap / priority queue (write it yourselves, no heapq)   Unit III
push: O(log n)    pop: O(log n)    Space: O(n)

Each request is a dict:
    {"id": 3, "pickup": 12, "drop": 57, "priority": 1, "arrival": 3}
Smaller (priority, arrival) = served first.
    priority 0 = urgent / premium,  priority 1 = normal
    arrival    = a counter; smaller means the rider has waited longer

Keep the method names below - main.py calls them.

TODO: replace the placeholder list with a real array-based binary heap:
      push  -> append at the end, then sift UP
      pop   -> swap root with last, remove last, then sift DOWN
      count comparisons in self.operations
"""

IMPLEMENTED = False


class RequestQueue:
    def __init__(self):
        self.items = []
        self.operations = 0

    def push(self, request):
        # ---- PLACEHOLDER: plain list, O(1) push ----
        self.items.append(request)

    def pop(self):
        # ---- PLACEHOLDER: linear search for the minimum, O(n) ----
        if not self.items:
            return None
        best = min(self.items, key=lambda r: (r["priority"], r["arrival"]))
        self.items.remove(best)
        return best

    def size(self):
        return len(self.items)

    def all_items(self):
        """Return the waiting requests (any order is fine)."""
        return list(self.items)
