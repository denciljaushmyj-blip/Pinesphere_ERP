"""
PINESPHERE ERP
Module      : Frontend Platform
File        : _extended_precision.py
Purpose     : Provides Extended Precision backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

"""A module with platform-specific extended precision
`numpy.number` subclasses.

The subclasses are defined here (instead of ``__init__.pyi``) such
that they can be imported conditionally via the numpy's mypy plugin.
"""

import numpy as np

from . import _96Bit, _128Bit

float96 = np.floating[_96Bit]
float128 = np.floating[_128Bit]
complex192 = np.complexfloating[_96Bit, _96Bit]
complex256 = np.complexfloating[_128Bit, _128Bit]
