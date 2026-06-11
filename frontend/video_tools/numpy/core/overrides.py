"""
PINESPHERE ERP
Module      : Frontend Platform
File        : overrides.py
Purpose     : Provides Overrides backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

def __getattr__(attr_name):
    from numpy._core import overrides

    from ._utils import _raise_warning
    ret = getattr(overrides, attr_name, None)
    if ret is None:
        raise AttributeError(
            f"module 'numpy.core.overrides' has no attribute {attr_name}")
    _raise_warning(attr_name, "overrides")
    return ret
