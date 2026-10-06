"""
Vector mathematics and gesture discriminator.
Calculates displacement dx/dy, Euclidean distance, angular quadrants, and deadzones.
"""

import math
from enum import Enum

class GestureDirection(str, Enum):
    CLICK = "click"
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"

class GestureEngine:
    def __init__(self, threshold_px=35.0):
        self.threshold_px = float(threshold_px)
        self.is_holding = False
        self.origin = (0, 0)
        self.has_triggered = False
        self.press_time = 0.0

    def on_button_down(self, x, y):
        import time
        self.is_holding = True
        self.origin = (x, y)
        self.has_triggered = False
        self.press_time = time.perf_counter()

    def on_move(self, x, y):
        if not self.is_holding or self.has_triggered:
            return None

        dx = x - self.origin[0]
        dy = y - self.origin[1]
        distance = math.hypot(dx, dy)

        if distance >= self.threshold_px:
            self.has_triggered = True  # Lock until physical button is released
            abs_x = abs(dx)
            abs_y = abs(dy)

            if abs_y >= abs_x:
                return GestureDirection.UP if dy < 0 else GestureDirection.DOWN
            else:
                return GestureDirection.LEFT if dx < 0 else GestureDirection.RIGHT

        return None

    def on_button_up(self, x, y):
        if not self.is_holding:
            return None

        action = None
        if not self.has_triggered:
            dx = x - self.origin[0]
            dy = y - self.origin[1]
            if math.hypot(dx, dy) < self.threshold_px:
                action = GestureDirection.CLICK

        self.is_holding = False
        self.has_triggered = False
        return action
