"""
Action Execution & Input Simulation
Uses pure Win32 SendInput API via ctypes on Windows to synthesize native keystrokes & mouse clicks.
Includes cross-platform fallbacks and requires zero administrative privileges.
"""

import sys
import time

IS_WINDOWS = sys.platform == "win32"

if IS_WINDOWS:
    import ctypes
    from ctypes import wintypes

    INPUT_KEYBOARD = 1
    INPUT_MOUSE = 0
    KEYEVENTF_KEYUP = 0x0002
    KEYEVENTF_EXTENDEDKEY = 0x0001
    MOUSEEVENTF_MIDDLEDOWN = 0x0020
    MOUSEEVENTF_MIDDLEUP = 0x0040
    MOUSEEVENTF_WHEEL = 0x0800
    MOUSEEVENTF_HWHEEL = 0x1000

    class KEYBDINPUT(ctypes.Structure):
        _fields_ = [
            ("wVk", wintypes.WORD),
            ("wScan", wintypes.WORD),
            ("dwFlags", wintypes.DWORD),
            ("time", wintypes.DWORD),
            ("dwExtraInfo", ctypes.c_ulonglong)
        ]

    class MOUSEINPUT(ctypes.Structure):
        _fields_ = [
            ("dx", wintypes.LONG),
            ("dy", wintypes.LONG),
            ("mouseData", wintypes.DWORD),
            ("dwFlags", wintypes.DWORD),
            ("time", wintypes.DWORD),
            ("dwExtraInfo", ctypes.c_ulonglong)
        ]

    class _INPUT_U(ctypes.Union):
        _fields_ = [("ki", KEYBDINPUT), ("mi", MOUSEINPUT)]

    class INPUT(ctypes.Structure):
        _fields_ = [("type", wintypes.DWORD), ("u", _INPUT_U)]

# Virtual Key Code Mapping (Standard Win32 VKs)
VK_MAP = {
    "ctrl": 0x11, "control": 0x11,
    "shift": 0x10,
    "alt": 0x12,
    "win": 0x5B, "meta": 0x5B, "cmd": 0x5B,
    "tab": 0x09, "space": 0x20, "enter": 0x0D, "escape": 0x1B,
    "left": 0x25, "arrowleft": 0x25,
    "up": 0x26, "arrowup": 0x26,
    "right": 0x27, "arrowright": 0x27,
    "down": 0x28, "arrowdown": 0x28,
    "delete": 0x2E, "del": 0x2E, "backspace": 0x08,
    "f1": 0x70, "f2": 0x71, "f3": 0x72, "f4": 0x73, "f5": 0x74, "f6": 0x75,
    "f7": 0x76, "f8": 0x77, "f9": 0x78, "f10": 0x79, "f11": 0x7A, "f12": 0x7B,
    "volume_up": 0xAF, "volume_down": 0xAE, "volume_mute": 0xAD,
    "media_next": 0xB0, "media_prev": 0xB1, "media_play_pause": 0xB3,
}

# Alphanumeric keys
for c in "abcdefghijklmnopqrstuvwxyz0123456789":
    VK_MAP[c] = ord(c.upper())


class ActionExecutor:
    def __init__(self):
        self.is_windows = IS_WINDOWS

    def send_keys_win32(self, vk_codes):
        """Simulate sequential keydown, then reverse keyup using Win32 SendInput."""
        if not self.is_windows:
            return

        import ctypes
        inputs = []
        for vk in vk_codes:
            inp = INPUT(type=INPUT_KEYBOARD)
            inp.u.ki = KEYBDINPUT(wVk=vk, wScan=0, dwFlags=KEYEVENTF_EXTENDEDKEY, time=0, dwExtraInfo=0)
            inputs.append(inp)

        for vk in reversed(vk_codes):
            inp = INPUT(type=INPUT_KEYBOARD)
            inp.u.ki = KEYBDINPUT(wVk=vk, wScan=0, dwFlags=KEYEVENTF_EXTENDEDKEY | KEYEVENTF_KEYUP, time=0, dwExtraInfo=0)
            inputs.append(inp)

        n = len(inputs)
        arr = (INPUT * n)(*inputs)
        ctypes.windll.user32.SendInput(n, ctypes.byref(arr), ctypes.sizeof(INPUT))

    def send_mouse_click_win32(self, mouse_action_type):
        """Simulate native mouse clicks (Middle click, scroll wheel, etc.)."""
        if not self.is_windows:
            return

        import ctypes
        if mouse_action_type == "middle_click":
            down = INPUT(type=INPUT_MOUSE)
            down.u.mi = MOUSEINPUT(dx=0, dy=0, mouseData=0, dwFlags=MOUSEEVENTF_MIDDLEDOWN, time=0, dwExtraInfo=0)
            up = INPUT(type=INPUT_MOUSE)
            up.u.mi = MOUSEINPUT(dx=0, dy=0, mouseData=0, dwFlags=MOUSEEVENTF_MIDDLEUP, time=0, dwExtraInfo=0)
            arr = (INPUT * 2)(down, up)
            ctypes.windll.user32.SendInput(2, ctypes.byref(arr), ctypes.sizeof(INPUT))

        elif mouse_action_type == "scroll_up":
            inp = INPUT(type=INPUT_MOUSE)
            inp.u.mi = MOUSEINPUT(dx=0, dy=0, mouseData=120, dwFlags=MOUSEEVENTF_WHEEL, time=0, dwExtraInfo=0)
            arr = (INPUT * 1)(inp)
            ctypes.windll.user32.SendInput(1, ctypes.byref(arr), ctypes.sizeof(INPUT))

        elif mouse_action_type == "scroll_down":
            inp = INPUT(type=INPUT_MOUSE)
            inp.u.mi = MOUSEINPUT(dx=0, dy=0, mouseData=-120, dwFlags=MOUSEEVENTF_WHEEL, time=0, dwExtraInfo=0)
            arr = (INPUT * 1)(inp)
            ctypes.windll.user32.SendInput(1, ctypes.byref(arr), ctypes.sizeof(INPUT))

    def dispatch_action(self, action_dict):
        """Dispatches an action payload from the configuration profile."""
        if not action_dict:
            return

        # 1. Custom Keyboard Shortcut
        if "keyCombo" in action_dict:
            combo = action_dict["keyCombo"]
            vks = []
            if combo.get("ctrl"): vks.append(VK_MAP["ctrl"])
            if combo.get("alt"): vks.append(VK_MAP["alt"])
            if combo.get("shift"): vks.append(VK_MAP["shift"])
            if combo.get("meta"): vks.append(VK_MAP["win"])

            key_name = combo.get("key", "").lower()
            if key_name in VK_MAP:
                vks.append(VK_MAP[key_name])
            if vks:
                if self.is_windows:
                    self.send_keys_win32(vks)
                else:
                    print(f"[ACTION] Triggered Key Combo: {combo.get('displayName', vks)}")
                return

        # 2. System / Navigation Shortcuts
        sys_type = action_dict.get("systemActionType")
        if sys_type == "task_view":
            self.dispatch_keys([VK_MAP["win"], VK_MAP["tab"]], "Task View (Win+Tab)")
        elif sys_type == "show_desktop":
            self.dispatch_keys([VK_MAP["win"], VK_MAP["d"]], "Show Desktop (Win+D)")
        elif sys_type == "desktop_left":
            self.dispatch_keys([VK_MAP["ctrl"], VK_MAP["win"], VK_MAP["left"]], "Virtual Desktop Left")
        elif sys_type == "desktop_right":
            self.dispatch_keys([VK_MAP["ctrl"], VK_MAP["win"], VK_MAP["right"]], "Virtual Desktop Right")
        elif sys_type == "app_switcher":
            self.dispatch_keys([VK_MAP["alt"], VK_MAP["tab"]], "App Switcher (Alt+Tab)")
        elif sys_type == "lock_pc":
            self.dispatch_keys([VK_MAP["win"], VK_MAP["l"]], "Lock Screen (Win+L)")
        elif sys_type == "volume_up":
            self.dispatch_keys([VK_MAP["volume_up"]], "Volume Up")
        elif sys_type == "volume_down":
            self.dispatch_keys([VK_MAP["volume_down"]], "Volume Down")
        elif sys_type == "media_play_pause":
            self.dispatch_keys([VK_MAP["media_play_pause"]], "Media Play/Pause")

        # 3. Mouse Action Type
        mouse_type = action_dict.get("mouseActionType")
        if mouse_type:
            if self.is_windows:
                self.send_mouse_click_win32(mouse_type)
            else:
                print(f"[ACTION] Triggered Mouse Action: {mouse_type}")

    def dispatch_keys(self, vks, desc=""):
        if self.is_windows:
            self.send_keys_win32(vks)
        else:
            print(f"[ACTION] Triggered {desc}")
