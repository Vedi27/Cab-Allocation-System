"""
Feature 11 (optional) - k-th nearest cab
Algorithm: Median-of-medians selection (Divide and Conquer)    Unit III
Time: O(n) worst case     Space: O(n)

INPUT
    values : list of numbers (distances of free cabs)
    k      : 1-based rank (k = 1 means the smallest)

OUTPUT
    (kth_value, comparisons)

How it works:
      1. split values into groups of 5, find each group's median
      2. recursively find the median of those medians -> pivot
      3. partition into smaller / equal / larger than pivot
      4. recurse only into the part that contains the k-th value
"""

IMPLEMENTED = True


def kth_smallest(values, k):
    """Median-of-medians selection, worst-case O(n). Returns (value, comparisons)."""
    count = [0]

    def median_small(group):
        g = sorted(group)
        count[0] += max(len(g) - 1, 0) * 2        # rough cost of sorting <=5 items
        return g[len(g) // 2]

    def select(a, k):                             # k is 0-based
        if len(a) <= 5:
            count[0] += len(a)
            return sorted(a)[k]
        medians = [median_small(a[i:i + 5]) for i in range(0, len(a), 5)]
        pivot = select(medians, len(medians) // 2)
        lows, highs, equal = [], [], 0
        for x in a:
            count[0] += 1
            if x < pivot:
                lows.append(x)
            elif x > pivot:
                highs.append(x)
            else:
                equal += 1
        if k < len(lows):
            return select(lows, k)
        if k < len(lows) + equal:
            return pivot
        return select(highs, k - len(lows) - equal)

    return select(list(values), k - 1), count[0]
