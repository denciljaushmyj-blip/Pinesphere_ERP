"""
PINESPHERE ERP
Module      : Frontend Platform
File        : numeric.py
Purpose     : Provides Numeric backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

def __getattr__(attr_name):
    from numpy._core import numeric

    from ._utils import _raise_warning

    sentinel = object()
    ret = getattr(numeric, attr_name, sentinel)
    if ret is sentinel:
        raise AttributeError(
            f"module 'numpy.core.numeric' has no attribute {attr_name}")
    _raise_warning(attr_name, "numeric")
    return ret
