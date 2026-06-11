"""
PINESPHERE ERP
Module      : Frontend Platform
File        : getlimits.py
Purpose     : Provides Getlimits backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

def __getattr__(attr_name):
    from numpy._core import getlimits

    from ._utils import _raise_warning
    ret = getattr(getlimits, attr_name, None)
    if ret is None:
        raise AttributeError(
            f"module 'numpy.core.getlimits' has no attribute {attr_name}")
    _raise_warning(attr_name, "getlimits")
    return ret
