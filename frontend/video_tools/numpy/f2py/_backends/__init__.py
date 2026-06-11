"""
PINESPHERE ERP
Module      : Frontend Platform
File        : __init__.py
Purpose     : Provides Init backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

def f2py_build_generator(name):
    if name == "meson":
        from ._meson import MesonBackend
        return MesonBackend
    elif name == "distutils":
        from ._distutils import DistutilsBackend
        return DistutilsBackend
    else:
        raise ValueError(f"Unknown backend: {name}")
