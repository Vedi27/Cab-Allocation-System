"""
Feature 5 (part 1) - Ranking cabs by distance
Algorithm: Merge sort (Divide and Conquer)     Unit III
Time: O(n log n)     Space: O(n)

INPUT
    items : list of dicts, e.g. [{"cab": 2, "distance": 14}, ...]
    key   : the dict key to sort by, e.g. "distance"

OUTPUT
    (sorted_list, comparisons)
    sorted_list : new list sorted in ascending order of item[key]
    comparisons : number of comparisons made (for the complexity panel)

TODO: replace the placeholder with your own recursive merge sort
      (split in half, sort each half, merge while counting comparisons).
"""

IMPLEMENTED = False


def merge_sort(items, key):
    # ---- PLACEHOLDER: Python's built-in sort ----
    return sorted(items, key=lambda x: x[key]), 0
