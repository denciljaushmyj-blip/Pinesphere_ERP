"""
PINESPHERE ERP
Module      : AI Module
File        : __main__.py
Purpose     : Provides Main backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

from __future__ import annotations

import sys

from .features import pilinfo

pilinfo(supported_formats="--report" not in sys.argv)
