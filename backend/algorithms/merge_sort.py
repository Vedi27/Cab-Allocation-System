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

How it works:
      (split in half, sort each half, merge while counting comparisons).
"""

IMPLEMENTED = True


def merge_sort(items, key):
    comparisons = [0]

    def sort(a):
        if len(a) <= 1:
            return a
        mid = len(a) // 2
        left, right = sort(a[:mid]), sort(a[mid:])
        out, i, j = [], 0, 0
        while i < len(left) and j < len(right):
            comparisons[0] += 1
            if left[i][key] <= right[j][key]:     # <= keeps the sort stable
                out.append(left[i]); i += 1
            else:
                out.append(right[j]); j += 1
        out.extend(left[i:])
        out.extend(right[j:])
        return out

    return sort(list(items)), comparisons[0]
