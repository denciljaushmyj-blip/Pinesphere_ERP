"""
PINESPHERE ERP
Module      : Frontend Platform
File        : warnings_and_errors.py
Purpose     : Provides Warnings And Errors backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

import numpy.exceptions as ex

ex.AxisError("test")
ex.AxisError(1, ndim=2)
ex.AxisError(1, ndim=2, msg_prefix="error")
ex.AxisError(1, ndim=2, msg_prefix=None)
