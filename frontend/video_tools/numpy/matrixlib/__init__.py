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

"""Sub-package containing the matrix class and related functions.

"""
from . import defmatrix
from .defmatrix import *

__all__ = defmatrix.__all__

from numpy._pytesttester import PytestTester

test = PytestTester(__name__)
del PytestTester
