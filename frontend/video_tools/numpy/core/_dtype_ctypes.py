"""
PINESPHERE ERP
Module      : Frontend Platform
File        : _dtype_ctypes.py
Purpose     : Provides Dtype Ctypes backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

def __getattr__(attr_name):
    from numpy._core import _dtype_ctypes

    from ._utils import _raise_warning
    ret = getattr(_dtype_ctypes, attr_name, None)
    if ret is None:
        raise AttributeError(
            f"module 'numpy.core._dtype_ctypes' has no attribute {attr_name}")
    _raise_warning(attr_name, "_dtype_ctypes")
    return ret
