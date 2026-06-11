"""
PINESPHERE ERP
Module      : Frontend Platform
File        : numerictypes.py
Purpose     : Provides Numerictypes backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

import numpy as np

np.isdtype(np.float64, (np.int64, np.float64))
np.isdtype(np.int64, "signed integer")

np.issubdtype("S1", np.bytes_)
np.issubdtype(np.float64, np.float32)

np.ScalarType
np.ScalarType[0]
np.ScalarType[3]
np.ScalarType[8]
np.ScalarType[10]

np.typecodes["Character"]
np.typecodes["Complex"]
np.typecodes["All"]
