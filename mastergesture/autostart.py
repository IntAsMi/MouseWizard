"""
Zero-Admin Windows Startup Manager
Manages non-elevated user startup via HKCU registry.
Complies with corporate EDR and IT SASE rules (no .bat, .cmd, or .vbs scripts).
"""

import sys
import os

IS_WINDOWS = sys.platform == "win32"
RUN_KEY_PATH = r"Software\Microsoft\Windows\CurrentVersion\Run"
APP_NAME = "MasterGesture"

def get_launch_command():
    """Generates the silent launch command using pythonw or python."""
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "run.py"))
    
    # Check for pythonw (windowless Python on Windows)
    pythonw_path = os.path.join(os.path.dirname(sys.executable), "pythonw.exe")
    if os.path.exists(pythonw_path):
        executable = pythonw_path
    else:
        executable = sys.executable

    return f'"{executable}" "{script_path}" --daemon'

def is_autostart_enabled():
    """Checks whether MasterGesture is registered in HKCU Run."""
    if not IS_WINDOWS:
        return False

    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY_PATH, 0, winreg.KEY_READ) as key:
            val, _ = winreg.QueryValueEx(key, APP_NAME)
            return bool(val)
    except (FileNotFoundError, OSError, Exception):
        return False

def enable_autostart():
    """Registers MasterGesture to start on Windows login without admin rights."""
    if not IS_WINDOWS:
        return False, "Auto-start registry is only applicable to Windows systems."

    try:
        import winreg
        cmd = get_launch_command()
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY_PATH, 0, winreg.KEY_SET_VALUE) as key:
            winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, cmd)
        return True, f"Registered in HKCU\\{RUN_KEY_PATH} for current user."
    except Exception as e:
        return False, f"Failed to enable auto-start: {e}"

def disable_autostart():
    """Removes MasterGesture from HKCU Run."""
    if not IS_WINDOWS:
        return False, "Auto-start registry is only applicable to Windows systems."

    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, RUN_KEY_PATH, 0, winreg.KEY_SET_VALUE) as key:
            try:
                winreg.DeleteValue(key, APP_NAME)
            except FileNotFoundError:
                pass
        return True, "Removed from HKCU startup."
    except Exception as e:
        return False, f"Failed to disable auto-start: {e}"
