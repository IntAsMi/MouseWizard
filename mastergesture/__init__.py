"""
MasterGesture Python Library
High-performance, ultra-lightweight gesture control engine for Logitech MX Master mice.
Designed for professional & enterprise environments (zero-admin, < 15MB RAM, IT security compliant).
"""

__version__ = "1.0.0"
__author__ = "MasterGesture Open Source Engine"

from .profiles import ConfigManager
from .engine import MasterGestureEngine
from .gestures import GestureEngine, GestureDirection
from .actions import ActionExecutor

__all__ = [
    "ConfigManager",
    "MasterGestureEngine",
    "GestureEngine",
    "GestureDirection",
    "ActionExecutor",
]
