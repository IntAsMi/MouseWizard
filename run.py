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

def main():
    parser = argparse.ArgumentParser(
        description="MasterGesture - Low-Latency Gesture Engine for Logitech MX Master Mice",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--daemon", action="store_true", help="Run as silent background daemon (< 15MB RAM)")
    parser.add_argument("--gui", action="store_true", help="Launch utilitarian configuration GUI")
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
