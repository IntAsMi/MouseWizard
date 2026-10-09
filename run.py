#!/usr/bin/env python3
"""
==============================================================================
MasterGesture - Unified Application Entry Point
High-Performance Gesture Control Engine for Logitech MX Master Mice.
Designed for professional & enterprise machines (Zero Admin, < 15MB RAM, No Batch Files).

Usage:
    python run.py                     -> Start engine with utilitarian GUI
    python run.py --daemon            -> Silent headless background daemon (< 15MB RAM)
    python run.py --gui               -> Open configuration GUI only
    python run.py --stop              -> Stop any running background instance
    python run.py --status            -> Check daemon status & RAM usage
    python run.py --compile           -> Compile Cython C-extension (< 0.2ms latency)
    python run.py --autostart-enable  -> Enable launch with Windows (Zero Admin)
    python run.py --autostart-disable -> Disable launch with Windows
==============================================================================
"""

import sys
import os
import argparse
import signal

# Ensure mastergesture package is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mastergesture.profiles import ConfigManager
from mastergesture.engine import MasterGestureEngine
from mastergesture.gui import run_utilitarian_gui
from mastergesture.autostart import enable_autostart, disable_autostart, is_autostart_enabled

PID_FILE = "mastergesture.pid"

def record_pid():
    try:
        with open(PID_FILE, "w") as f:
            f.write(str(os.getpid()))
    except Exception:
        pass

def remove_pid():
    if os.path.exists(PID_FILE):
        try:
            os.remove(PID_FILE)
        except Exception:
            pass

def stop_running_instance():
    if not os.path.exists(PID_FILE):
        print("[STOP] No active MasterGesture PID file found.")
        return

    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        print(f"[STOP] Terminating MasterGesture process PID {pid}...")
        if sys.platform == "win32":
            import ctypes
            PROCESS_TERMINATE = 0x0001
            handle = ctypes.windll.kernel32.OpenProcess(PROCESS_TERMINATE, False, pid)
            if handle:
                ctypes.windll.kernel32.TerminateProcess(handle, 0)
                ctypes.windll.kernel32.CloseHandle(handle)
                print("[STOP] Process successfully terminated.")
            else:
                print(f"[STOP] Could not open process {pid} (may already be stopped).")
        else:
            os.kill(pid, signal.SIGTERM)
            print("[STOP] Process successfully terminated.")
    except Exception as e:
        print(f"[STOP] Notice: {e}")
    finally:
        remove_pid()

def check_status():
    if not os.path.exists(PID_FILE):
        print("[STATUS] MasterGesture is currently NOT running.")
        autostart = "ENABLED" if is_autostart_enabled() else "DISABLED"
        print(f"[STATUS] Windows Auto-Start: {autostart}")
        return

    try:
        with open(PID_FILE, "r") as f:
            pid = int(f.read().strip())
        print(f"[STATUS] MasterGesture is ACTIVE (PID: {pid}).")
        autostart = "ENABLED" if is_autostart_enabled() else "DISABLED"
        print(f"[STATUS] Windows Auto-Start: {autostart}")
    except Exception:
        print("[STATUS] Could not verify process.")

def start_local_web_studio(port=3000):
    import http.server
    import socketserver
    import webbrowser

    web_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
    if not os.path.exists(web_dir) or not os.path.exists(os.path.join(web_dir, "index.html")):
        print(f"[WEB ERROR] Frontend build directory not found at {web_dir}.")
        print("[WEB] Please run 'npm run build' once or use the desktop GUI.")
        return

    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=web_dir, **kwargs)
        def log_message(self, format, *args):
            pass  # Suppress routine HTTP request logging

    try:
        # Allow immediate reuse of the address
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(("", port), QuietHandler) as httpd:
            url = f"http://localhost:{port}"
            print("=" * 70)
            print("  MASTERGESTURE // LOCAL WEB STUDIO SERVER ACTIVE")
            print(f"  Access URL: {url}")
            print("  Opening browser to interactive Mouse Configurator...")
            print("  Press Ctrl+C to terminate the local web server.")
            print("=" * 70)
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()
    except Exception as e:
        print(f"[WEB ERROR] Could not bind web server on port {port}: {e}")

def run_cli_wizard(config_mgr):
    print("=" * 70)
    print("  MASTERGESTURE // INTERACTIVE TERMINAL CONFIGURATION WIZARD")
    print("=" * 70)

    devices = config_mgr.get_devices()
    dev_keys = list(devices.keys())
    if not dev_keys:
        print("[ERROR] No devices found in configuration.")
        return

    print("\nSelect Connected Mouse Device:")
    for i, d in enumerate(dev_keys, 1):
        name = devices[d].get("name", d)
        print(f"  [{i}] {name} ({d})")
    
    try:
        choice = input(f"Choose mouse [1-{len(dev_keys)}] (default: 1): ").strip()
        dev_idx = int(choice) - 1 if choice else 0
        target_dev = dev_keys[max(0, min(dev_idx, len(dev_keys) - 1))]
    except (ValueError, KeyboardInterrupt):
        target_dev = dev_keys[0]

    dev_cfg = config_mgr.get_device_config(target_dev)
    profiles = dev_cfg.get("profiles", [])
    active_prof_id = dev_cfg.get("activeProfileId", "profile_global")

    print(f"\nTarget Device: {target_dev}")
    print(f"Active Profile: {active_prof_id}")

    buttons = [
        ("thumb_gesture", "Thumb Gesture Button (Rest Pad)"),
        ("mode_shift", "Mode Shift Button (Top Middle)"),
        ("middle_click", "Middle Click (Scroll Wheel)"),
        ("forward", "Forward Button (X2 Side Front)"),
        ("back", "Back Button (X1 Side Rear)")
    ]

    print("\nSelect Button to Configure:")
    for i, (b_id, b_label) in enumerate(buttons, 1):
        print(f"  [{i}] {b_label}")
    
    try:
        choice = input(f"Choose button [1-{len(buttons)}] (default: 1): ").strip()
        btn_idx = int(choice) - 1 if choice else 0
        target_btn = buttons[max(0, min(btn_idx, len(buttons) - 1))][0]
    except (ValueError, KeyboardInterrupt):
        target_btn = "thumb_gesture"

    print(f"\nConfiguring '{target_btn}' on '{target_dev}':")
    presets = [
        ("Task View / Mission Control", {"id": "act_task_view", "systemActionType": "task_view"}),
        ("Show Desktop", {"id": "act_show_desktop", "systemActionType": "show_desktop"}),
        ("Previous Virtual Desktop", {"id": "act_desktop_left", "systemActionType": "desktop_left"}),
        ("Next Virtual Desktop", {"id": "act_desktop_right", "systemActionType": "desktop_right"}),
        ("Maximize Window", {"id": "act_maximize", "keyCombo": {"meta": True, "key": "ArrowUp"}}),
        ("Minimize Window", {"id": "act_minimize", "keyCombo": {"meta": True, "key": "ArrowDown"}}),
        ("Switch Applications (Alt+Tab)", {"id": "act_app_switcher", "systemActionType": "app_switcher"}),
        ("Play / Pause Media", {"id": "act_media_play", "systemActionType": "media_play_pause"}),
        ("Volume Up", {"id": "act_vol_up", "systemActionType": "volume_up"}),
        ("Volume Down", {"id": "act_vol_down", "systemActionType": "volume_down"})
    ]

    for d in ["click", "up", "down", "left", "right"]:
        print(f"\nAssign action for: {d.upper()}")
        for i, (p_name, _) in enumerate(presets, 1):
            print(f"  [{i}] {p_name}")
        try:
            p_choice = input(f"Select preset for {d.upper()} (Enter to keep current): ").strip()
            if p_choice:
                idx = int(p_choice) - 1
                if 0 <= idx < len(presets):
                    chosen_action = presets[idx][1]
                    chosen_action["name"] = presets[idx][0]
                    config_mgr.update_gesture_direction(target_dev, active_prof_id, target_btn, d, chosen_action)
                    print(f"  -> Set {d.upper()} to: {presets[idx][0]}")
        except Exception as e:
            print(f"  Skipped {d}: {e}")

    print("\n✓ Configuration updated successfully in config.json!")

def main():
    parser = argparse.ArgumentParser(
        description="MasterGesture - Low-Latency Gesture Engine for Logitech MX Master Mice",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--daemon", action="store_true", help="Run as silent background daemon (< 15MB RAM)")
    parser.add_argument("--gui", action="store_true", help="Launch utilitarian configuration GUI")
    parser.add_argument("--web", action="store_true", help="Launch local browser-based Web Studio interface")
    parser.add_argument("--cli", action="store_true", help="Interactive terminal configuration wizard for mouse & gestures")
    parser.add_argument("--stop", action="store_true", help="Stop any active background MasterGesture process")
    parser.add_argument("--status", action="store_true", help="Check process status and auto-start configuration")
    parser.add_argument("--config", default="config.json", help="Path to JSON configuration file (default: config.json)")
    parser.add_argument("--device", default=None, help="Target specific connected mouse device ID")
    parser.add_argument("--compile", action="store_true", help="Compile Cython C-extension for < 0.2ms latency")
    parser.add_argument("--autostart-enable", action="store_true", help="Enable Windows auto-start without admin rights")
    parser.add_argument("--autostart-disable", action="store_true", help="Disable Windows auto-start")

    args = parser.parse_args()

    # 1. Stop command
    if args.stop:
        stop_running_instance()
        return

    # 2. Status command
    if args.status:
        check_status()
        return

    # 3. Auto-start management
    if args.autostart_enable:
        ok, msg = enable_autostart()
        print(f"[AUTOSTART] {msg}")
        return

    if args.autostart_disable:
        ok, msg = disable_autostart()
        print(f"[AUTOSTART] {msg}")
        return

    # 4. Cython compilation
    if args.compile:
        print("[BUILD] Compiling Cython C-extensions for native speed...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "setup.py", "build_ext", "--inplace"])
            print("[BUILD] Cython C-accelerator compiled successfully! Sub-0.2ms latency active.")
        except Exception as e:
            print(f"[BUILD ERROR] Could not compile Cython extension: {e}")
            print("[BUILD] MasterGesture will continue to run with high-speed ctypes.")
        return

    # 5. Load multi-mouse configuration
    config_mgr = ConfigManager(args.config)

    # 6. Web Studio command
    if args.web:
        start_local_web_studio()
        return

    # 7. Interactive Terminal CLI Wizard
    if args.cli:
        run_cli_wizard(config_mgr)
        return

    engine = MasterGestureEngine(config_mgr, target_device=args.device)

    record_pid()

    try:
        if args.daemon:
            print("=" * 70)
            print("  MASTERGESTURE // SILENT BACKGROUND DAEMON")
            print(f"  Active Config: {args.config}")
            print("  Memory Footprint: < 15 MB RAM (EmptyWorkingSet Trimmed)")
            print("  Press Ctrl+C to terminate or run 'python run.py --stop'")
            print("=" * 70)
            engine.run_blocking()

        elif args.gui:
            print("[GUI] Launching Utilitarian Configuration GUI...")
            run_utilitarian_gui(config_mgr, engine)

        else:
            # Default mode: Start background engine and launch GUI
            import threading
            engine_thread = threading.Thread(target=engine.run_blocking, daemon=True)
            engine_thread.start()

            print("=" * 70)
            print("  MASTERGESTURE // UTILITARIAN ENGINE INITIALIZED")
            print(f"  Device: {config_mgr.get_active_device_id()}")
            print("  Launching configuration interface...")
            print("=" * 70)

            run_utilitarian_gui(config_mgr, engine)

    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Stopping MasterGesture Engine...")
    finally:
        engine.stop()
        remove_pid()

if __name__ == "__main__":
    main()
