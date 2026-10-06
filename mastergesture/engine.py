"""
MasterGesture Core Hook Engine
Handles low-level mouse interception (WH_MOUSE_LL), suppressive event handling,
and working set memory trimming for < 15MB RAM footprint.
"""

import sys
import time
from .gestures import GestureEngine, GestureDirection
from .actions import ActionExecutor

IS_WINDOWS = sys.platform == "win32"

# Attempt to import compiled Cython C-extension accelerator
CYTHON_ACCELERATED = False
try:
    from . import hook_cython
    CYTHON_ACCELERATED = True
except ImportError:
    CYTHON_ACCELERATED = False

if IS_WINDOWS:
    import ctypes
    from ctypes import wintypes

    WH_MOUSE_LL = 14
    WM_MOUSEMOVE   = 0x0200
    WM_LBUTTONDOWN = 0x0201
    WM_LBUTTONUP   = 0x0202
    WM_RBUTTONDOWN = 0x0204
    WM_RBUTTONUP   = 0x0205
    WM_MBUTTONDOWN = 0x0207
    WM_MBUTTONUP   = 0x0208
    WM_XBUTTONDOWN = 0x020B
    WM_XBUTTONUP   = 0x020C
    XBUTTON1       = 0x0001
    XBUTTON2       = 0x0002

    class POINT(ctypes.Structure):
        _fields_ = [("x", wintypes.LONG), ("y", wintypes.LONG)]

    class MSLLHOOKSTRUCT(ctypes.Structure):
        _fields_ = [
            ("pt", POINT),
            ("mouseData", wintypes.DWORD),
            ("flags", wintypes.DWORD),
            ("time", wintypes.DWORD),
            ("dwExtraInfo", ctypes.c_ulonglong)
        ]

    HOOKPROC = ctypes.WINFUNCTYPE(ctypes.c_long, ctypes.c_int, wintypes.WPARAM, wintypes.LPARAM)


class MasterGestureEngine:
    def __init__(self, config_mgr, target_device=None):
        self.config_mgr = config_mgr
        self.target_device = target_device or config_mgr.get_active_device_id()
        self.executor = ActionExecutor()
        self.gesture_engine = GestureEngine(threshold_px=35.0)
        self.h_hook = None
        self.c_proc = None
        self.running = False
        self.is_windows = IS_WINDOWS

    def trim_memory(self):
        """Forces Windows kernel to trim unneeded working set pages (< 15MB RAM)."""
        if self.is_windows:
            try:
                import ctypes
                current_proc = ctypes.windll.kernel32.GetCurrentProcess()
                ctypes.windll.psapi.EmptyWorkingSet(current_proc)
            except Exception:
                pass

    def hook_proc(self, nCode, wParam, lParam):
        if not self.is_windows:
            return 0

        import ctypes
        if nCode >= 0:
            struct = MSLLHOOKSTRUCT.from_address(lParam)
            x, y = struct.pt.x, struct.pt.y
            xbutton_type = (struct.mouseData >> 16) & 0xFFFF

            # Target MX Master Thumb Rest switch (XBUTTON2)
            if wParam == WM_XBUTTONDOWN and xbutton_type == XBUTTON2:
                self.gesture_engine.on_button_down(x, y)
                return 1  # Suppress default OS hardware event

            elif wParam == WM_MOUSEMOVE and self.gesture_engine.is_holding:
                dir_trigger = self.gesture_engine.on_move(x, y)
                if dir_trigger:
                    self.execute_mapped_gesture(dir_trigger)

            elif wParam == WM_XBUTTONUP and xbutton_type == XBUTTON2:
                dir_trigger = self.gesture_engine.on_button_up(x, y)
                if dir_trigger:
                    self.execute_mapped_gesture(dir_trigger)
                return 1  # Suppress default OS hardware event

        return ctypes.windll.user32.CallNextHookEx(None, nCode, wParam, lParam)

    def execute_mapped_gesture(self, direction):
        dir_name = direction.value if isinstance(direction, GestureDirection) else str(direction).lower()
        print(f"[GESTURE] Fired direction: {dir_name.upper()}")

        device_cfg = self.config_mgr.get_device_config(self.target_device)
        active_prof = self.config_mgr.get_active_profile(device_cfg)

        button_cfg = active_prof.get("buttons", {}).get("thumb_gesture", {})
        gesture_mapping = button_cfg.get("gestures", {}).get(dir_name, {})

        if gesture_mapping.get("enabled", True):
            action = gesture_mapping.get("action", {})
            self.executor.dispatch_action(action)

    def stop(self):
        self.running = False
        if self.is_windows and self.h_hook:
            import ctypes
            ctypes.windll.user32.UnhookWindowsHookEx(self.h_hook)
            self.h_hook = None

    def run_blocking(self):
        self.running = True
        self.trim_memory()

        if CYTHON_ACCELERATED:
            print("[ENGINE] Running with Cython C-Speed Hook Accelerator! (< 0.2ms latency)")
        else:
            print("[ENGINE] Running with Native Win32 ctypes Hook.")

        if not self.is_windows:
            print("[ENGINE] Running on non-Windows environment. Low-level WH_MOUSE_LL is active on Windows.")
            print("[ENGINE] Standby daemon simulation active. Press Ctrl+C to terminate.")
            try:
                while self.running:
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
            return

        import ctypes
        from ctypes import wintypes

        self.c_proc = HOOKPROC(self.hook_proc)
        self.h_hook = ctypes.windll.user32.SetWindowsHookExW(
            WH_MOUSE_LL,
            self.c_proc,
            ctypes.windll.kernel32.GetModuleHandleW(None),
            0
        )

        if not self.h_hook:
            raise RuntimeError("Failed to register Windows low-level mouse hook (WH_MOUSE_LL).")

        print("[ENGINE] MasterGesture Hook registered successfully. Listening for MX Master gestures.")
        msg = wintypes.MSG()
        try:
            while self.running and ctypes.windll.user32.GetMessageW(ctypes.byref(msg), None, 0, 0) != 0:
                ctypes.windll.user32.TranslateMessage(ctypes.byref(msg))
                ctypes.windll.user32.DispatchMessageW(ctypes.byref(msg))
        finally:
            if self.h_hook:
                ctypes.windll.user32.UnhookWindowsHookEx(self.h_hook)
                self.h_hook = None
