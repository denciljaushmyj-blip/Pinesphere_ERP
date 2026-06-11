"""
PINESPHERE ERP
Module      : Frontend Platform
File        : test__all__.py
Purpose     : Provides Test All backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

import collections

import numpy as np


def test_no_duplicates_in_np__all__():
    # Regression test for gh-10198.
    dups = {k: v for k, v in collections.Counter(np.__all__).items() if v > 1}
    assert len(dups) == 0
