"""
Multi-Mouse Configuration & Profile Router
Loads, validates, and routes gestures per connected mouse device from config.json.
Allows copying and pasting the entire JSON config for each mouse independently.
"""

import json
import os
import shutil

DEFAULT_CONFIG_PATH = "config.json"

class ConfigManager:
    def __init__(self, config_path=DEFAULT_CONFIG_PATH):
        self.config_path = config_path
        self.data = self.load_config()

    def load_config(self):
        if not os.path.exists(self.config_path):
            fallback = self.get_empty_fallback()
            try:
                with open(self.config_path, "w", encoding="utf-8") as f:
                    json.dump(fallback, f, indent=2)
            except Exception:
                pass
            return fallback

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[CONFIG] Error loading {self.config_path}: {e}. Using fallback defaults.")
            return self.get_empty_fallback()

    def save_config(self):
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2)
            print(f"[CONFIG] Configuration successfully saved to {self.config_path}")
        except Exception as e:
            print(f"[CONFIG] Error saving configuration: {e}")

    def get_devices(self):
        return self.data.get("devices", {})

    def get_active_device_id(self):
        return self.data.get("activeDeviceId", "device_mx_master_3s_desk")

    def set_active_device_id(self, device_id):
        self.data["activeDeviceId"] = device_id
        self.save_config()

    def get_device_config(self, device_id):
        devices = self.get_devices()
        if device_id in devices:
            return devices[device_id]
        if devices:
            return next(iter(devices.values()))
        return {}

    def get_active_profile(self, device_cfg):
        profiles = device_cfg.get("profiles", [])
        active_id = device_cfg.get("activeProfileId")
        for p in profiles:
            if p.get("id") == active_id:
                return p
        return profiles[0] if profiles else {}

    def update_device_json(self, device_id, raw_json_str):
        """Allows direct copy-pasting of JSON configuration for a specific mouse."""
        parsed = json.loads(raw_json_str)
        if "devices" not in self.data:
            self.data["devices"] = {}
        self.data["devices"][device_id] = parsed
        self.save_config()

    def get_empty_fallback(self):
        return {
            "version": "1.0.0",
            "activeDeviceId": "device_mx_master_3s_desk",
            "engineSettings": {
                "pollingRateHz": 1000,
                "globalThresholdPx": 35,
                "hudEnabled": True,
                "hudDurationMs": 900,
                "hudTheme": "neon",
                "audioFeedbackEnabled": True,
                "suppressNativeHardwareEvent": True,
                "targetPlatform": "windows",
                "startWithWindows": True,
                "portableMode": True,
                "startMinimizedToTray": True,
                "aggressiveRamTrimming": True,
                "closeToTray": True
            },
            "devices": {
                "device_mx_master_3s_desk": {
                    "id": "device_mx_master_3s_desk",
                    "name": "Logitech MX Master 3S (Office Desk)",
                    "hardwareModel": "Logitech MX Master 3S",
                    "vendorId": "0x046D",
                    "productId": "0xB023",
                    "connectionType": "logi_bolt",
                    "activeProfileId": "profile_global",
                    "profiles": [
                        {
                            "id": "profile_global",
                            "name": "Global (Default OS)",
                            "processNames": ["*"],
                            "icon": "Globe",
                            "color": "#9ca3af",
                            "description": "Primary desktop configuration for MX Master 3S",
                            "buttons": {
                                "thumb_gesture": {
                                    "buttonId": "thumb_gesture",
                                    "mode": "gesture",
                                    "thresholdPx": 35,
                                    "showHUD": True,
                                    "gestures": {
                                        "click": {
                                            "enabled": True,
                                            "action": {
                                                "id": "act_task_view",
                                                "category": "os_navigation",
                                                "name": "Task View / Mission Control",
                                                "systemActionType": "task_view"
                                            }
                                        },
                                        "up": {
                                            "enabled": True,
                                            "action": {
                                                "id": "act_maximize",
                                                "category": "os_navigation",
                                                "name": "Maximize Window",
                                                "keyCombo": {"meta": True, "key": "ArrowUp", "displayName": "Win + Up"}
                                            }
                                        },
                                        "down": {
                                            "enabled": True,
                                            "action": {
                                                "id": "act_show_desktop",
                                                "category": "os_navigation",
                                                "name": "Show Desktop",
                                                "systemActionType": "show_desktop"
                                            }
                                        },
                                        "left": {
                                            "enabled": True,
                                            "action": {
                                                "id": "act_desktop_left",
                                                "category": "os_navigation",
                                                "name": "Previous Desktop",
                                                "systemActionType": "desktop_left"
                                            }
                                        },
                                        "right": {
                                            "enabled": True,
                                            "action": {
                                                "id": "act_desktop_right",
                                                "category": "os_navigation",
                                                "name": "Next Desktop",
                                                "systemActionType": "desktop_right"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
