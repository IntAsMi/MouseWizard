"""
MasterGesture Cython Build Setup
Compiles native C x86_64 accelerators for sub-0.2ms gesture vector calculation.

Usage:
    python setup.py build_ext --inplace
    or:
    python run.py --compile
"""

from setuptools import setup, Extension
import sys

ext_modules = []

try:
    from Cython.Build import cythonize
    ext_modules = cythonize(
        [
            Extension(
                "mastergesture.hook_cython",
                sources=["mastergesture/hook_cython.pyx"],
                extra_compile_args=["/O2"] if sys.platform == "win32" else ["-O3"]
            )
        ],
        compiler_directives={"language_level": "3", "boundscheck": False, "wraparound": False}
    )
except ImportError:
    print("[NOTICE] Cython is not installed. MasterGesture will fall back to high-speed ctypes.")
    print("To compile native C accelerators: pip install cython")

setup(
    name="mastergesture",
    version="1.0.0",
    description="High-speed gesture engine for Logitech MX Master mice",
    packages=["mastergesture"],
    ext_modules=ext_modules,
)
