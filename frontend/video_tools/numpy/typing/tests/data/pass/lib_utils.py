"""
PINESPHERE ERP
Module      : Frontend Platform
File        : lib_utils.py
Purpose     : Provides Lib Utils backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

from __future__ import annotations

from io import StringIO

import numpy as np
import numpy.lib.array_utils as array_utils

FILE = StringIO()
AR = np.arange(10, dtype=np.float64)


def func(a: int) -> bool:
    return True


array_utils.byte_bounds(AR)
array_utils.byte_bounds(np.float64())

np.info(1, output=FILE)
