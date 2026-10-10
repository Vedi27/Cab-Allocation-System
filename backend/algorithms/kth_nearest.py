"""
Feature 11 (optional) - k-th nearest cab
Algorithm: Median-of-medians selection (Divide and Conquer)    Unit III
Time: O(n) worst case     Space: O(n)

INPUT
    values : list of numbers (distances of free cabs)
    k      : 1-based rank (k = 1 means the smallest)

OUTPUT
    (kth_value, comparisons)

TODO: replace the placeholder with median-of-medians:
      1. split values into groups of 5, find each group's median
      2. recursively find the median of those medians -> pivot
      3. partition into smaller / equal / larger than pivot
      4. recurse only into the part that contains the k-th value
"""

IMPLEMENTED = False


def kth_smallest(values, k):
    # ---- PLACEHOLDER: sort everything, O(n log n) ----
    return sorted(values)[k - 1], 0
