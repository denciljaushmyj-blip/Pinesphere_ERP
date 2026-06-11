"""
PINESPHERE ERP
Module      : Frontend Platform
File        : setup.py
Purpose     : Provides Setup backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

"""
Build an example package using the limited Python C API.
"""

import os

from setuptools import Extension, setup

import numpy as np

macros = [("NPY_NO_DEPRECATED_API", 0), ("Py_LIMITED_API", "0x03060000")]

limited_api = Extension(
    "limited_api",
    sources=[os.path.join('.', "limited_api.c")],
    include_dirs=[np.get_include()],
    define_macros=macros,
)

extensions = [limited_api]

setup(
    ext_modules=extensions
)
