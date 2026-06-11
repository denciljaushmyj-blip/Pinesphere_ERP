"""
PINESPHERE ERP
Module      : Frontend Platform
File        : function_base.py
Purpose     : Provides Function Base backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

def __getattr__(attr_name):
    from numpy._core import function_base

    from ._utils import _raise_warning
    ret = getattr(function_base, attr_name, None)
    if ret is None:
        raise AttributeError(
            f"module 'numpy.core.function_base' has no attribute {attr_name}")
    _raise_warning(attr_name, "function_base")
    return ret
