"""
PINESPHERE ERP
Module      : Frontend Platform
File        : lib_version.py
Purpose     : Provides Lib Version backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# IMPORTS
# =====================================================

from numpy.lib import NumpyVersion

version = NumpyVersion("1.8.0")

version.vstring
version.version
version.major
version.minor
version.bugfix
version.pre_release
version.is_devversion

version == version
version != version
version < "1.8.0"
version <= version
version > version
version >= "1.8.0"
