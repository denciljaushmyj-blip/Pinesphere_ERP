"""
PINESPHERE ERP
Module      : Backend Platform
File        : seed_superadmin.py
Purpose     : Provides Seed Superadmin backend functionality
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

import os
import sys
import uuid

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.roles import UserRole, role_abbreviation
from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.crm import Lead, AdmissionDocument
from app.models.finance import Invoice, Payment
from app.models.franchise import Franchise, FranchiseAgreement, FranchiseRoyaltyLedger, FranchiseComplianceCheck, FranchiseNotification
from app.models.history import HistoryEvent
from app.models.hr import Employee, EmployeeDocument, StaffAttendance, LeaveRequest, Payroll, TrainerWorkload, PerformanceReview, StaffTask
from app.models.lms import Course, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizAttempt
from app.models.operations import OperationRecord
from app.models.token import RefreshToken, AuthActionToken, AuditLog, SecurityEvent

# =====================================================
# SECTION: CONSTANTS
# PURPOSE:
# This section stores fixed values used by the file.
# Centralizing these values helps avoid repeated magic strings or numbers.
# =====================================================

DEMO_PASSWORD = "Admin@123"

DEMO_USERS = [
    ("sa@pinesphere.com", "Super Admin", UserRole.SUPER_ADMIN, None),
    ("ba@pinesphere.com", "Branch Admin", UserRole.BRANCH_ADMIN, "main"),
]

db = SessionLocal()

try:
    demo_password_hash = hash_password(DEMO_PASSWORD)

    existing_users = db.query(User).all()
    for user in existing_users:
        user.hashed_password = demo_password_hash
        print(f"Reset password for existing user: {user.email}")

    for email, full_name, role, branch_id in DEMO_USERS:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Skipped existing demo user: {email}")
        else:
            db.add(
                User(
                    id=str(uuid.uuid4()),
                    full_name=full_name,
                    email=email,
                    hashed_password=demo_password_hash,
                    role=role,
                    role_abbreviation=role_abbreviation(role),
                    branch_id=branch_id,
                    is_active=True,
                    student_status="active" if role == UserRole.STUDENT else "active",
                    document_status="verified" if role == UserRole.STUDENT else "pending",
                    course_enrolled="Java" if role == UserRole.STUDENT else None,
                    batch_name="Batch 1" if role == UserRole.STUDENT else None,
                )
            )
            print(f"Created demo user: {email}")
    db.commit()
finally:
    db.close()
