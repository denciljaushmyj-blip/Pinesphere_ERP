"""
PINESPHERE ERP
Module      : Frontend Platform
File        : test_value_attrspec.py
Purpose     : Provides Test Value Attrspec backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

import pytest

from . import util


class TestValueAttr(util.F2PyTest):
    sources = [util.getpath("tests", "src", "value_attrspec", "gh21665.f90")]

    # gh-21665
    @pytest.mark.slow
    def test_gh21665(self):
        inp = 2
        out = self.module.fortfuncs.square(inp)
        exp_out = 4
        assert out == exp_out
