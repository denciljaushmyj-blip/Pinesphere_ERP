"""
PINESPHERE ERP
Module      : Backend Platform
File        : main.py
Purpose     : Provides Main backend functionality
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

# =====================================================
# SECTION: IMPORTS
# PURPOSE:
# This section loads external libraries, framework tools, and local helpers.
# Keeping imports together makes dependencies easy to review.
# =====================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings as app_settings
from app.db.database import Base, engine

# Import models before create_all so SQLAlchemy metadata is fully registered.
from app.models import attendance, branch, lms, token, trainer, user, crm, finance, history  # noqa: F401
from app.models import settings  # noqa: F401
from app.models import franchise, hr, operations  # noqa: F401

from app.api.v1 import include_v1_routers


# =====================================================
# SECTION: DATABASE INITIALIZATION
# PURPOSE:
# This initializes registered SQLAlchemy models.
# Existing database initialization is preserved.
# =====================================================

Base.metadata.create_all(bind=engine)


app = FastAPI(title="Pinesphere ERP", version="1.0.0")


# =====================================================
# SECTION: MIDDLEWARE
# PURPOSE:
# This section runs shared request or response logic.
# Middleware is useful for security, logging, sessions, and cross-cutting behavior.
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in app_settings.CORS_ALLOWED_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# SECTION: ROUTER REGISTRATION
# PURPOSE:
# This section registers all backend route groups once.
# Existing production routers are preserved and new routers are added safely.
# =====================================================

include_v1_routers(app)


# =====================================================
# SECTION: STATIC FILE SERVING
# PURPOSE:
# Serves locally uploaded LMS files (PDFs, videos) under /uploads.
# Files are written to backend/uploads/lms/ by the material upload service.
# The directory is created on startup if it does not already exist.
# No auth is enforced at the static layer — access is controlled by the
# API routes that return file URLs.
# =====================================================

# =====================================================
# SECTION: ROUTES AND ENDPOINTS
# PURPOSE:
# This section defines HTTP endpoints exposed by the backend.
# Routes receive requests, call services, and return API responses.
# =====================================================

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Pinesphere ERP API"}
