"""
PINESPHERE ERP
Module      : API V1 Package
File        : __init__.py
Purpose     : Centralizes registration for backend API routers.
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

from fastapi import FastAPI

from app.api.v1.ai import router as ai_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.auth import router as auth_router
from app.api.v1.auth import users_router, v1_auth_router
from app.api.v1.branch_admin import router as branch_admin_router
from app.api.v1.branches import router as branches_router
from app.api.v1.crm import router as crm_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.finance import router as finance_router
from app.api.v1.franchise import router as franchise_router
from app.api.v1.history import router as history_router
from app.api.v1.hr import router as hr_router
from app.api.v1.lms import router as lms_router
from app.api.v1.navigation import router as navigation_router
from app.api.v1.operations import router as operations_router
from app.api.v1.profile import router as profile_router
from app.api.v1.reports import router as reports_router
from app.api.v1.role_dashboards import router as role_dashboards_router
from app.api.v1.security import router as security_router
from app.api.v1.settings import router as settings_router
from app.api.v1.trainer import router as trainer_router


def include_v1_routers(app: FastAPI) -> None:
    """
    Register routers without changing their existing prefixes.
    """
    app.include_router(auth_router)
    app.include_router(v1_auth_router)
    app.include_router(users_router)
    app.include_router(dashboard_router)
    app.include_router(branches_router)
    app.include_router(branch_admin_router)
    app.include_router(lms_router)
    app.include_router(attendance_router)
    app.include_router(crm_router)
    app.include_router(finance_router)
    app.include_router(history_router)
    app.include_router(security_router)
    app.include_router(ai_router)
    app.include_router(settings_router)
    app.include_router(franchise_router)
    app.include_router(hr_router)
    app.include_router(navigation_router)
    app.include_router(operations_router)
    app.include_router(profile_router)
    app.include_router(reports_router)
    app.include_router(role_dashboards_router)
    app.include_router(trainer_router)
