# cython: language_level=3
# cython: boundscheck=False
# cython: wraparound=False
"""
Cython C-extension implementation of vector distance & direction calculation.
Compiles to native C x86_64 assembly for zero Python overhead during 1000Hz drags.
"""

cimport cython
from libc.math cimport sqrt, fabs

cdef class CythonGestureMath:
    cdef double threshold_px

    def __init__(self, double threshold_px = 35.0):
        self.threshold_px = threshold_px

    cdef str evaluate_vector(self, int origin_x, int origin_y, int curr_x, int curr_y):
        cdef double dx = <double>(curr_x - origin_x)
        cdef double dy = <double>(curr_y - origin_y)
        cdef double distance = sqrt(dx * dx + dy * dy)

        if distance < self.threshold_px:
            return None

        cdef double abs_x = fabs(dx)
        cdef double abs_y = fabs(dy)

        if abs_y >= abs_x:
            return "UP" if dy < 0.0 else "DOWN"
        else:
            return "LEFT" if dx < 0.0 else "RIGHT"

    def compute(self, int ox, int oy, int cx, int cy):
        return self.evaluate_vector(ox, oy, cx, cy)
