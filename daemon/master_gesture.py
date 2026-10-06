#!/usr/bin/env python3
"""
MasterGesture - Native Low-Level Mouse Hook & Gesture Interceptor
Zero-admin portable script for Logitech MX Master mice
"""

import sys
import os
import math
import time
import json

try:
    from pynput import mouse, keyboard
    import pyautogui
except ImportError:
    print("[ERROR] Required libraries missing. Please run 'pip install pynput pyautogui' or use the root 'python run.py'.")
    sys.exit(1)

THRESHOLD_PX = 35.0

class MasterGestureDaemon:
    def __init__(self):
        self.is_holding = False
        self.origin = (0, 0)
        self.has_triggered = False
        self.kb = keyboard.Controller()
        print("=" * 70)
        print("  MasterGesture Native Input Hook (Logitech MX Master)")
        print(f"  Trigger threshold: {THRESHOLD_PX} pixels")
        print("  Anchor button: XBUTTON2 (Thumb Gesture Switch)")
        print("=" * 70)

    def on_click(self, x, y, button, pressed):
        # Button.x2 corresponds to MX Master thumb/gesture rest button
        if button == mouse.Button.x2:
            if pressed:
                self.is_holding = True
                self.origin = (x, y)
                self.has_triggered = False
                print(f"[DOWN] Gesture anchor engaged at ({x}, {y})")
                return True
            else:
                if self.is_holding and not self.has_triggered:
                    dx = x - self.origin[0]
                    dy = y - self.origin[1]
                    if math.hypot(dx, dy) < THRESHOLD_PX:
                        self.execute_action("CLICK")
                self.is_holding = False
                self.has_triggered = False
                return True

    def on_move(self, x, y):
        if self.is_holding and not self.has_triggered:
            dx = x - self.origin[0]
            dy = y - self.origin[1]
            dist = math.hypot(dx, dy)

            if dist >= THRESHOLD_PX:
                self.has_triggered = True
                abs_x = abs(dx)
                abs_y = abs(dy)

                if abs_y >= abs_x:
                    direction = "UP" if dy < 0 else "DOWN"
                else:
                    direction = "LEFT" if dx < 0 else "RIGHT"

                self.execute_action(direction)

    def execute_action(self, direction):
        print(f"[TRIGGER] Fired Gesture: {direction}")
        try:
            if direction == "CLICK":
                # Win + Tab (Task View / Mission Control)
                pyautogui.hotkey('win', 'tab')
            elif direction == "LEFT":
                # Previous Virtual Desktop
                pyautogui.hotkey('ctrl', 'win', 'left')
            elif direction == "RIGHT":
                # Next Virtual Desktop
                pyautogui.hotkey('ctrl', 'win', 'right')
            elif direction == "UP":
                # Maximize Window
                pyautogui.hotkey('win', 'up')
            elif direction == "DOWN":
                # Show Desktop
                pyautogui.hotkey('win', 'd')
        except Exception as e:
            print(f"[ERROR] Failed to execute action: {e}")

if __name__ == "__main__":
    daemon = MasterGestureDaemon()
    print("Hook active. Test by holding your thumb button and moving your mouse!")
    with mouse.Listener(on_click=daemon.on_click, on_move=daemon.on_move) as listener:
        listener.join()
