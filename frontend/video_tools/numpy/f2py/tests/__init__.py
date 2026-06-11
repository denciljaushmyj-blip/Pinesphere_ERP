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

import pytest

from numpy.testing import IS_EDITABLE, IS_WASM

if IS_WASM:
    pytest.skip(
        "WASM/Pyodide does not use or support Fortran",
        allow_module_level=True
    )


if IS_EDITABLE:
    pytest.skip(
        "Editable install doesn't support tests with a compile step",
        allow_module_level=True
    )
