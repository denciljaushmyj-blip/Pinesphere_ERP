"""
PINESPHERE ERP
Module      : Frontend Platform
File        : _shape.py
Purpose     : Provides Shape backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

from collections.abc import Sequence
from typing import Any, SupportsIndex, TypeAlias

_Shape: TypeAlias = tuple[int, ...]
_AnyShape: TypeAlias = tuple[Any, ...]

# Anything that can be coerced to a shape tuple
_ShapeLike: TypeAlias = SupportsIndex | Sequence[SupportsIndex]
