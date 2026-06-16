"""
PINESPHERE ERP
Module      : Role Dashboards
File        : role_dashboards.py
Purpose     : Provides role-based dashboard API endpoints.
Author      : Pinesphere Development Team
Last Updated: Auto Generated
=====================================================
"""

from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import require_roles
from app.core.roles import UserRole
from app.db.database import get_db
from app.models.attendance import AttendanceRecord, AttendanceSession
from app.models.crm import Lead
from app.models.finance import Invoice, Payment
from app.models.hr import Employee, LeaveRequest, Payroll, StaffTask
from app.models.lms import Course, Enrollment, Lesson, LessonProgress, Quiz
from app.models.user import User

router = APIRouter(prefix="/api", tags=["Role Dashboards"])

ROLE_MODULES = {
    UserRole.SUPER_ADMIN: [
        "branches",
        "users",
        "students",
        "finance",
        "hr",
        "franchise",
        "reports",
        "security",
        "settings",
    ],
    UserRole.BRANCH_ADMIN: [
        "admissions",
        "students",
        "attendance",
        "fees",
        "lms",
        "staff_overview",
        "branch_reports",
        "communication",
    ],
    UserRole.COUNSELLOR: [
        "leads",
        "follow_ups",
        "admissions",
        "student_enquiry",
        "tasks",
        "calendar",
        "communication",
        "conversion_reports",
    ],
    UserRole.TRAINER: [
        "my_batches",
        "students",
        "attendance",
        "lms",
        "assignments",
        "tests_exams",
        "reports",
        "calendar",
        "messages",
    ],
    UserRole.HR: [
        "employees",
        "payroll",
        "leave",
        "attendance",
        "performance",
        "recruitment",
        "training",
        "reports",
    ],
    UserRole.PARENT: [
        "child_profile",
        "attendance",
        "fees",
        "academics",
        "exams_results",
        "assignments",
        "notices",
        "messages",
        "calendar",
    ],
    UserRole.STUDENT: [
        "profile",
        "courses_lms",
        "attendance",
        "assignments",
        "exams",
        "certificates",
        "fees",
        "notifications",
        "messages",
        "calendar",
    ],
    UserRole.FINANCE: [
        "fees",
        "invoices",
        "payments",
        "salary",
        "reports",
        "settings",
    ],
    UserRole.FRANCHISE_OWNER: [
        "franchise",
        "branches",
        "reports",
        "settings",
    ],
    UserRole.COMPANY_HR: [
        "placement",
        "students",
        "reports",
        "settings",
    ],
}

ROLE_LABELS = {
    UserRole.BRANCH_ADMIN: "Branch Admin Dashboard",
    UserRole.COUNSELLOR: "Counsellor Dashboard",
    UserRole.TRAINER: "Trainer Dashboard",
    UserRole.HR: "HR Dashboard",
    UserRole.PARENT: "Parent Dashboard",
    UserRole.STUDENT: "Student Dashboard",
    UserRole.SUPER_ADMIN: "Super Admin Overview",
    UserRole.FINANCE: "Finance Dashboard",
    UserRole.FRANCHISE_OWNER: "Franchise Owner Dashboard",
    UserRole.COMPANY_HR: "Company HR Dashboard",
}


def _role_guard(current_user: User, allowed_role: UserRole):
    if current_user.role != allowed_role:
        raise HTTPException(status_code=403, detail="Insufficient permissions")


def _branch_id(current_user: User):
    return None if current_user.role == UserRole.SUPER_ADMIN else current_user.branch_id


def _user_query(db: Session, branch_id: str | None = None):
    query = db.query(User)
    if branch_id:
        query = query.filter(User.branch_id == branch_id)
    return query


def _lead_query(db: Session, branch_id: str | None = None, counsellor_id: str | None = None):
    query = db.query(Lead)
    if branch_id:
        query = query.filter(Lead.branch_id == branch_id)
    if counsellor_id:
        query = query.filter(Lead.counsellor_id == counsellor_id)
    return query


def _invoice_query(db: Session, branch_id: str | None = None, student_id: str | None = None):
    query = db.query(Invoice)
    if branch_id:
        query = query.filter(Invoice.branch_id == branch_id)
    if student_id:
        query = query.filter(Invoice.student_id == student_id)
    return query


def _payment_sum(db: Session, branch_id: str | None = None, student_id: str | None = None):
    query = db.query(func.coalesce(func.sum(Payment.amount), 0)).join(Invoice, Payment.invoice_id == Invoice.id)
    if branch_id:
        query = query.filter(Invoice.branch_id == branch_id)
    if student_id:
        query = query.filter(Payment.student_id == student_id)
    return float(query.scalar() or 0)


def _attendance_summary(db: Session, branch_id: str | None = None, student_id: str | None = None, trainer_id: str | None = None):
    query = db.query(AttendanceRecord).join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
    if branch_id:
        query = query.join(User, AttendanceRecord.student_id == User.id).filter(User.branch_id == branch_id)
    if student_id:
        query = query.filter(AttendanceRecord.student_id == student_id)
    if trainer_id:
        query = query.filter(AttendanceSession.trainer_id == trainer_id)

    total = query.count()
    present = query.filter(AttendanceRecord.status.in_(["present", "late", "Present", "Late"])).count()
    rate = round((present / total) * 100, 2) if total else 0
    today = date.today()

    series = []
    for offset in range(5, -1, -1):
        day = today - timedelta(days=offset)
        day_query = query.filter(AttendanceSession.session_date == day)
        day_total = day_query.count()
        day_present = day_query.filter(AttendanceRecord.status.in_(["present", "late", "Present", "Late"])).count()
        series.append({
            "label": day.strftime("%d %b"),
            "rate": round((day_present / day_total) * 100, 2) if day_total else 0,
        })

    return {"rate": rate, "present": present, "total": total, "series": series}


def _lms_summary(db: Session, trainer_id: str | None = None, student_id: str | None = None):
    course_query = db.query(Course)
    if trainer_id:
        course_query = course_query.filter(Course.trainer_id == trainer_id)

    enrollment_query = db.query(Enrollment)
    if student_id:
        enrollment_query = enrollment_query.filter(Enrollment.student_id == student_id)
    if trainer_id:
        enrollment_query = enrollment_query.join(Course, Enrollment.course_id == Course.id).filter(Course.trainer_id == trainer_id)

    courses = course_query.order_by(Course.updated_at.desc()).limit(5).all()
    return {
        "total_courses": course_query.count(),
        "published_courses": course_query.filter(Course.status == "published").count(),
        "lessons": db.query(Lesson).join(Course, Lesson.course_id == Course.id).filter(Course.trainer_id == trainer_id).count() if trainer_id else db.query(Lesson).count(),
        "enrollments": enrollment_query.count(),
        "quizzes": db.query(Quiz).count(),
        "items": [
            {
                "id": course.id,
                "title": course.title,
                "status": course.status,
                "difficulty": course.difficulty_level,
            }
            for course in courses
        ],
    }


def _profile_completion(user: User) -> int:
    fields = [
        user.full_name,
        user.email,
        user.phone,
        user.profile_photo,
        user.date_of_birth,
        user.gender,
        user.address,
        user.parent_name,
        user.parent_phone,
        user.emergency_contact,
        user.course_enrolled,
        user.batch_name,
        user.document_status,
    ]
    completed = sum(1 for value in fields if value is not None and str(value).strip())
    return round((completed / len(fields)) * 100) if fields else 0


def _module_cards(role: UserRole, modules: list[str], totals: dict):
    labels = {
        "admissions": "Admissions",
        "students": "Students",
        "attendance": "Attendance",
        "fees": "Fees & Payments",
        "lms": "LMS",
        "staff_overview": "Staff Overview",
        "branch_reports": "Branch Reports",
        "communication": "Communication",
        "leads": "Leads",
        "follow_ups": "Follow-ups",
        "student_enquiry": "Student Enquiry",
        "tasks": "Tasks",
        "calendar": "Calendar",
        "conversion_reports": "Conversion Reports",
        "my_batches": "My Batches",
        "assignments": "Assignments",
        "tests_exams": "Tests / Exams",
        "reports": "Reports",
        "messages": "Messages",
        "employees": "Employees",
        "payroll": "Payroll",
        "leave": "Leave Management",
        "performance": "Performance",
        "recruitment": "Recruitment",
        "training": "Training",
        "child_profile": "Child Profile",
        "academics": "Academics",
        "exams_results": "Exams & Results",
        "notices": "Notices",
        "profile": "Profile",
        "courses_lms": "Courses / LMS",
        "exams": "Exams",
        "certificates": "Certificates",
        "notifications": "Notifications",
        "branches": "Branches",
        "users": "Users",
        "finance": "Finance",
        "hr": "HR",
        "franchise": "Franchise",
        "security": "Security",
        "settings": "Settings",
        "invoices": "Invoices",
        "payments": "Payments",
        "salary": "Salary",
        "placement": "Placement",
    }

    return [
        {
            "key": module,
            "label": labels.get(module, module.replace("_", " ").title()),
            "href": f"/{role.value.replace('_', '-')}/dashboard#{module}",
            "summary": str(totals.get(module, "Connected")),
            "enabled": True,
            "description": "Connected to live dashboard aggregation where source tables exist.",
        }
        for module in modules
    ]


def _recent_activity(db: Session, branch_id: str | None = None):
    lead_rows = _lead_query(db, branch_id).order_by(Lead.created_at.desc()).limit(3).all()
    payment_rows = (
        db.query(Payment)
        .join(Invoice, Payment.invoice_id == Invoice.id)
        .filter(Invoice.branch_id == branch_id if branch_id else True)
        .order_by(Payment.paid_at.desc())
        .limit(3)
        .all()
    )

    activity = [
        {
            "title": f"Lead: {lead.student_name}",
            "detail": f"{lead.status.title()} - {lead.course_interest or 'Course not selected'}",
            "time": lead.created_at.isoformat() if lead.created_at else "",
            "module": "Admissions",
        }
        for lead in lead_rows
    ]
    activity.extend(
        {
            "title": f"Payment received: Rs {payment.amount:,.0f}",
            "detail": payment.payment_method.title(),
            "time": payment.paid_at.isoformat() if payment.paid_at else "",
            "module": "Fees",
        }
        for payment in payment_rows
    )
    return activity[:5]


def _dashboard_payload(db: Session, current_user: User, role: UserRole):
    branch_id = _branch_id(current_user)
    counsellor_id = current_user.id if role == UserRole.COUNSELLOR and current_user.role != UserRole.SUPER_ADMIN else None
    trainer_id = current_user.id if role == UserRole.TRAINER and current_user.role != UserRole.SUPER_ADMIN else None

    student_query = _user_query(db, branch_id).filter(User.role == UserRole.STUDENT)
    if role == UserRole.PARENT:
        student_query = db.query(User).filter(
            User.role == UserRole.STUDENT,
            User.parent_phone == current_user.phone,
        )
    elif role == UserRole.FRANCHISE_OWNER and current_user.franchise_id:
        student_query = db.query(User).filter(
            User.role == UserRole.STUDENT,
            User.franchise_id == current_user.franchise_id,
        )
    leads = _lead_query(db, branch_id, counsellor_id)
    invoices = _invoice_query(db, branch_id)
    if role == UserRole.PARENT:
        parent_student_ids = [student.id for student in student_query.all()]
        invoices = db.query(Invoice).filter(Invoice.student_id.in_(parent_student_ids)) if parent_student_ids else db.query(Invoice).filter(False)
    attendance = _attendance_summary(db, branch_id=branch_id, trainer_id=trainer_id)
    if role == UserRole.PARENT:
        parent_student_ids = [student.id for student in student_query.all()]
        attendance = {"rate": 0, "present": 0, "total": 0, "series": []}
        if parent_student_ids:
            summaries = [_attendance_summary(db, student_id=student_id) for student_id in parent_student_ids]
            total = sum(summary["total"] for summary in summaries)
            present = sum(summary["present"] for summary in summaries)
            attendance = {
                "rate": round((present / total) * 100, 2) if total else 0,
                "present": present,
                "total": total,
                "series": summaries[0]["series"] if summaries else [],
            }
    lms = _lms_summary(db, trainer_id=trainer_id)
    employee_query = db.query(Employee)
    if branch_id:
        employee_query = employee_query.filter(Employee.branch_id == branch_id)

    # Compute trainer-scoped total students using distinct enrollments across trainer-owned courses
    if trainer_id:
        # Identify courses owned by this trainer
        trainer_course_ids = [c.id for c in db.query(Course.id).filter(Course.trainer_id == trainer_id).all()]
        total_students = (
            db.query(func.count(Enrollment.student_id.distinct()))
            .join(User, Enrollment.student_id == User.id)
            .filter(
                Enrollment.course_id.in_(trainer_course_ids) if trainer_course_ids else True,
                User.role == UserRole.STUDENT,
                User.is_active == True,  # noqa: E712
            )
            .scalar()
            or 0
        )
    else:
        total_students = student_query.count()
    converted = leads.filter(Lead.status == "converted").count()
    total_leads = leads.count()
    revenue = _payment_sum(db, branch_id)
    pending_fees = float(invoices.filter(Invoice.status != "paid").with_entities(func.coalesce(func.sum(Invoice.amount - Invoice.paid_amount), 0)).scalar() or 0)
    overdue = invoices.filter(Invoice.due_date < date.today(), Invoice.status != "paid").count()
    employees = employee_query.count()
    payroll_total = float(db.query(func.coalesce(func.sum(Payroll.net_salary), 0)).scalar() or 0)
    leave_pending = db.query(LeaveRequest).filter(LeaveRequest.status == "Pending").count()

    modules = ROLE_MODULES[role]
    totals = {
        "admissions": converted,
        "students": total_students,
        "attendance": f"{attendance['rate']:.0f}%",
        "fees": f"Rs {revenue:,.0f}",
        "lms": lms["total_courses"],
        "leads": total_leads,
        "follow_ups": leads.filter(Lead.next_follow_up_at != None).count(),  # noqa: E711
        "tasks": db.query(StaffTask).filter(StaffTask.status != "Done").count(),
        "my_batches": lms["enrollments"],
        "assignments": db.query(Lesson).filter(Lesson.content_type == "assignment").count(),
        "tests_exams": lms["quizzes"],
        "employees": employees,
        "payroll": f"Rs {payroll_total:,.0f}",
        "leave": leave_pending,
    }

    metrics = [
        {"key": "students", "label": "Students", "value": str(total_students), "helper": "Active student users in scope", "module": "Students"},
        {"key": "leads", "label": "Leads", "value": str(total_leads), "helper": f"{converted} converted to admission", "module": "Admissions"},
        {"key": "attendance", "label": "Attendance", "value": f"{attendance['rate']:.0f}%", "helper": f"{attendance['present']} present / {attendance['total']} marked", "module": "Attendance"},
        {"key": "fees", "label": "Collected Fees", "value": f"Rs {revenue:,.0f}", "helper": f"Rs {pending_fees:,.0f} pending", "module": "Fees"},
    ]

    if role == UserRole.HR:
        metrics = [
            {"key": "employees", "label": "Employees", "value": str(employees), "helper": "HR employee records", "module": "HR"},
            {"key": "payroll", "label": "Payroll", "value": f"Rs {payroll_total:,.0f}", "helper": "Net salary total", "module": "Payroll"},
            {"key": "leave", "label": "Pending Leave", "value": str(leave_pending), "helper": "Leave requests awaiting action", "module": "Leave"},
            {"key": "training", "label": "Training", "value": str(lms["published_courses"]), "helper": "Published LMS courses", "module": "Training"},
        ]
    elif role == UserRole.TRAINER:
        metrics = [
            {"key": "courses", "label": "My Courses", "value": str(lms["total_courses"]), "helper": "Courses assigned to trainer", "module": "LMS"},
            {"key": "enrollments", "label": "Students", "value": str(lms["enrollments"]), "helper": "Students in assigned courses", "module": "Students"},
            {"key": "attendance", "label": "Attendance", "value": f"{attendance['rate']:.0f}%", "helper": "Trainer session attendance", "module": "Attendance"},
            {"key": "assignments", "label": "Assignments", "value": str(totals["assignments"]), "helper": "Assignment lessons", "module": "Assignments"},
        ]
    elif role == UserRole.FINANCE:
        metrics = [
            {"key": "fees", "label": "Collected Fees", "value": f"Rs {revenue:,.0f}", "helper": "Payments in finance scope", "module": "Finance"},
            {"key": "outstanding", "label": "Outstanding", "value": f"Rs {pending_fees:,.0f}", "helper": "Pending invoice balance", "module": "Finance"},
            {"key": "invoices", "label": "Invoices", "value": str(invoices.count()), "helper": "Invoice records in scope", "module": "Finance"},
            {"key": "overdue", "label": "Overdue", "value": str(overdue), "helper": "Overdue invoices", "module": "Finance"},
        ]
    elif role == UserRole.FRANCHISE_OWNER:
        franchise_branch_ids = []
        if current_user.franchise_id:
            franchise_branch_ids = [
                branch_id
                for (branch_id,) in db.query(User.branch_id)
                .filter(User.franchise_id == current_user.franchise_id, User.branch_id != None)  # noqa: E711
                .distinct()
                .all()
            ]
        metrics = [
            {"key": "branches", "label": "Branches", "value": str(len(franchise_branch_ids)), "helper": "Assigned franchise branches", "module": "Franchise"},
            {"key": "students", "label": "Students", "value": str(total_students), "helper": "Students in franchise scope", "module": "Students"},
            {"key": "fees", "label": "Revenue", "value": f"Rs {revenue:,.0f}", "helper": "Collected payments in scope", "module": "Finance"},
            {"key": "reports", "label": "Reports", "value": "Live", "helper": "Franchise reporting enabled", "module": "Reports"},
        ]
    elif role == UserRole.COMPANY_HR:
        metrics = [
            {"key": "placement", "label": "Placement Pipeline", "value": str(total_students), "helper": "Eligible student records", "module": "Placement"},
            {"key": "students", "label": "Students", "value": str(total_students), "helper": "Students visible to Company HR", "module": "Students"},
            {"key": "reports", "label": "Reports", "value": "Live", "helper": "Placement reporting enabled", "module": "Reports"},
            {"key": "messages", "label": "Messages", "value": "0", "helper": "Placement communication", "module": "Messages"},
        ]

    # Trainer‑specific extra data for the dashboard UI
    # 1. Today’s classes – Attendance sessions linked to this trainer for today
    today = date.today()
    today_sessions = []
    if trainer_id:
        sessions_q = (
            db.query(AttendanceSession)
            .filter(
                AttendanceSession.trainer_id == trainer_id,
                AttendanceSession.session_date == today,
            )
            .order_by(AttendanceSession.start_time.asc())
        )
        for sess in sessions_q:
            # Count enrolled students for the session’s batch name across trainer courses
            student_cnt = (
                db.query(func.count(Enrollment.id))
                .join(Course, Enrollment.course_id == Course.id)
                .filter(
                    Enrollment.batch_name == sess.batch_name,
                    Course.trainer_id == trainer_id,
                )
                .scalar()
                or 0
            )
            # Compute attendance rate for this session
            att_q = (
                db.query(func.count(AttendanceRecord.id))
                .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
                .filter(
                    AttendanceRecord.session_id == sess.id,
                    AttendanceRecord.status.in_(["present", "late", "Present", "Late"]),
                )
            )
            present_cnt = att_q.scalar() or 0
            total_cnt = (
                db.query(func.count(AttendanceRecord.id))
                .filter(AttendanceRecord.session_id == sess.id)
                .scalar()
                or 0
            )
            rate = round((present_cnt / total_cnt) * 100, 2) if total_cnt else None
            today_sessions.append({
                "id": sess.id,
                "title": sess.title or "Class",
                "total_records": student_cnt,
                "attendance_rate": rate,
            })
    # 2. Assigned batches – reuse batch service logic simplified for dashboard view
    assigned_batches = []
    if trainer_id:
        # Gather batch info from enrollments (distinct batch names)
        batch_rows = (
            db.query(Enrollment.batch_name, func.count(Enrollment.id))
            .join(Course, Enrollment.course_id == Course.id)
            .filter(Course.trainer_id == trainer_id)
            .group_by(Enrollment.batch_name)
            .all()
        )
        for name, cnt in batch_rows:
            if not name:
                continue
            # Find a representative course for this batch
            course_row = (
                db.query(Course.title, Course.id)
                .join(Enrollment, Enrollment.course_id == Course.id)
                .filter(Course.trainer_id == trainer_id, Enrollment.batch_name == name)
                .first()
            )
            course_name = course_row.title if course_row else "Course"
            course_id = str(course_row.id) if course_row else ""
            assigned_batches.append({
                "id": f"enrollment:{name}",
                "title": name,
                "student_count": cnt,
                "course": course_name,
                "course_id": course_id,
                "status": "Active",
            })
    # 3. Recent assignments – latest 5 lessons with content_type='assignment' for trainer courses
    recent_assignments = []
    if trainer_id:
        assign_q = (
            db.query(Lesson)
            .join(Course, Lesson.course_id == Course.id)
            .filter(Course.trainer_id == trainer_id, Lesson.content_type == "assignment")
            .order_by(Lesson.created_at.desc())
            .limit(5)
            .all()
        )
        for a in assign_q:
            recent_assignments.append({
                "id": a.id,
                "title": a.title,
                "due_at": a.due_at.isoformat() if getattr(a, "due_at", None) else None,
                "max_marks": getattr(a, "max_marks", 0),
            })
    # 4. Recent test results – latest 5 quizzes for trainer courses
    recent_test_results = []
    if trainer_id:
        quiz_q = (
            db.query(Quiz)
            .join(Course, Quiz.course_id == Course.id)
            .filter(Course.trainer_id == trainer_id)
            .order_by(Quiz.created_at.desc())
            .limit(5)
            .all()
        )
        for q in quiz_q:
            recent_test_results.append({
                "id": q.id,
                "title": q.title,
                "status": q.status,
                "total_marks": q.total_marks,
                "passing_score": q.passing_score,
            })
    # 5. Pending tasks – tasks assigned to trainer that are not done (placeholder uses StaffTask for now)
    pending_tasks = []
    if trainer_id:
        task_q = (
            db.query(StaffTask)
            .filter(StaffTask.assignee_id == trainer_id, StaffTask.status != "Done")
            .order_by(StaffTask.created_at.asc())
            .limit(5)
            .all()
        )
        for t in task_q:
            pending_tasks.append({
                "id": t.id,
                "title": t.title,
                "status": t.status,
                "module": t.module,
            })
    
    return {
        "role": role.value,
        "title": ROLE_LABELS[role],
        "scope": "All branches" if current_user.role == UserRole.SUPER_ADMIN else "Assigned role scope",
        "metrics": metrics,
        "modules": _module_cards(role, modules, totals),
        "recent_activity": _recent_activity(db, branch_id),
        "notifications": [
            {"title": "Role permissions active", "message": f"{ROLE_LABELS[role]} modules are filtered by RBAC.", "tone": "success"},
            # TODO: Replace this placeholder notice after admissions, assignments, messages,
            # notifications, receipts, exams, and calendar_events tables are migrated.
            {"title": "Integration note", "message": "Missing source tables use clean placeholders until migrations are added.", "tone": "info"},
        ],
        "attendance": attendance,
        "fees": {"collected": revenue, "pending": pending_fees, "overdue": overdue},
        "courses": lms,
        "tasks": pending_tasks,
        "calendar": [],
        "reports": [],
        "permissions": {
            "allowed_modules": modules,
            "denied_modules": sorted(set().union(*ROLE_MODULES.values()) - set(modules)),
        },
        "updated_at": datetime.utcnow().isoformat(),
        # New trainer‑specific fields for UI
        "today_classes": today_sessions,
        "assigned_batches": assigned_batches,
        "recent_assignments": recent_assignments,
        "recent_test_results": recent_test_results,
        "pending_tasks": pending_tasks,
    }

def _student_payload(db: Session, current_user: User):
    # ── Identity guard ────────────────────────────────────────────────────────
    # Route is already protected by require_roles(STUDENT) + _role_guard.
    # student_id is always the authenticated user's own id.
    student_id = current_user.id

    # ── Enrollments (eager-load course + trainer to avoid N+1) ───────────────
    all_enrollment_count = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id)
        .count()
    )

    enrollments = (
        db.query(Enrollment)
        .options(
            joinedload(Enrollment.course).joinedload(Course.trainer)
        )
        .filter(Enrollment.student_id == student_id)
        .order_by(Enrollment.enrolled_at.desc())
        .limit(3)
        .all()
    )

    # ── Attendance ────────────────────────────────────────────────────────────
    attendance = _attendance_summary(db, student_id=student_id)

    # ── Fees ──────────────────────────────────────────────────────────────────
    # null-safe subtraction: coalesce paid_amount per row before summing
    invoices = _invoice_query(db, student_id=student_id)
    pending_fees = float(
        invoices.filter(Invoice.status != "paid")
        .with_entities(
            func.coalesce(
                func.sum(Invoice.amount - func.coalesce(Invoice.paid_amount, 0)),
                0,
            )
        )
        .scalar()
        or 0
    )

    # ── Assignments completed (scoped to this student only) ───────────────────
    assignments_completed = (
        db.query(LessonProgress)
        .join(Lesson, LessonProgress.lesson_id == Lesson.id)
        .filter(
            LessonProgress.student_id == student_id,
            LessonProgress.is_completed == True,  # noqa: E712
            Lesson.content_type == "assignment",
        )
        .count()
    )

    # ── Enrolled courses (with real remaining lessons) ────────────────────────
    courses = []
    for enrollment in enrollments:
        course = enrollment.course
        if not course:
            continue

        # Total lessons in this course
        total_lessons = (
            db.query(func.count(Lesson.id))
            .filter(Lesson.course_id == course.id)
            .scalar()
            or 0
        )

        # Lessons this student has completed in this course
        completed_lessons = (
            db.query(func.count(LessonProgress.id))
            .join(Lesson, LessonProgress.lesson_id == Lesson.id)
            .filter(
                LessonProgress.student_id == student_id,
                LessonProgress.is_completed == True,  # noqa: E712
                Lesson.course_id == course.id,
            )
            .scalar()
            or 0
        )

        remaining_lessons = max(0, total_lessons - completed_lessons)

        trainer_name = course.trainer.full_name if course.trainer else None
        trainer_initials = (
            "".join(part[:1] for part in trainer_name.split()[:2]).upper()
            if trainer_name
            else None
        )

        courses.append({
            "id": course.id,
            "title": course.title,
            "track": enrollment.batch_name or None,
            "trainer": trainer_name,
            "trainerInitials": trainer_initials,
            "progress": enrollment.progress_percent,
            "remainingLessons": remaining_lessons,
            "totalLessons": total_lessons,
            "nextClass": None,  # Phase 2: requires session scheduling table
            "difficulty": (
                course.difficulty_level
                if course.difficulty_level in ("Beginner", "Intermediate", "Advanced")
                else "Beginner"
            ),
            "accent": "var(--pinesphere-green)",
        })

    # ── Certificates ──────────────────────────────────────────────────────────
    # Phase 2: no certificates table exists yet
    certificates = []

    # ── Response ──────────────────────────────────────────────────────────────
    return {
        "profileCompletion": _profile_completion(current_user),
        "learningStreak": 0,             # Phase 2: requires daily activity log table
        "enrolledCourseCount": all_enrollment_count,
        "assignmentsCompleted": assignments_completed,
        "enrolledCourses": courses,
        "assignmentsDue": [],            # Phase 2: requires assignment submissions table
        "certificates": certificates,
        "placementReadiness": {
            "resumeScore": 0,
            "interviewReadiness": 0,
            "projectsCompleted": 0,
            "projectsRequired": 0,
            "eligible": False,
        },
        "glance": {
            "attendance": attendance["rate"],
            "pendingTasks": 0,           # Phase 2: requires tasks table
            "certificatesEarned": len(certificates),
        },
        "fees": {"pending": pending_fees},
        "notifications": [],             # Phase 2: requires notifications table
        "messages": [],                  # Phase 2: requires messages table
        "calendar": [],                  # Phase 2: requires calendar events table
    }


@router.get("/branch-admin/dashboard")
def branch_admin_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.BRANCH_ADMIN))):
    _role_guard(current_user, UserRole.BRANCH_ADMIN)
    return _dashboard_payload(db, current_user, UserRole.BRANCH_ADMIN)


@router.get("/counsellor/dashboard")
def counsellor_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.COUNSELLOR))):
    _role_guard(current_user, UserRole.COUNSELLOR)
    return _dashboard_payload(db, current_user, UserRole.COUNSELLOR)


@router.get("/trainer/dashboard")
def trainer_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.TRAINER))):
    _role_guard(current_user, UserRole.TRAINER)
    return _dashboard_payload(db, current_user, UserRole.TRAINER)


@router.get("/hr/dashboard")
def hr_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.HR))):
    _role_guard(current_user, UserRole.HR)
    return _dashboard_payload(db, current_user, UserRole.HR)


@router.get("/parent/dashboard")
def parent_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.PARENT))):
    _role_guard(current_user, UserRole.PARENT)
    return _dashboard_payload(db, current_user, UserRole.PARENT)


@router.get("/student/dashboard")
def student_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.STUDENT))):
    _role_guard(current_user, UserRole.STUDENT)
    return _student_payload(db, current_user)


@router.get("/super-admin/overview")
def super_admin_overview(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.SUPER_ADMIN))):
    payload = _dashboard_payload(db, current_user, UserRole.SUPER_ADMIN)
    payload["permissions"] = {"allowed_modules": ROLE_MODULES[UserRole.SUPER_ADMIN], "denied_modules": []}
    payload["notifications"][0]["message"] = "Super Admin can monitor and control every role dashboard."
    return payload


@router.get("/super-admin/dashboard")
def super_admin_dashboard_alias(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.SUPER_ADMIN))):
    return super_admin_overview(db, current_user)


@router.get("/finance/dashboard")
def finance_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.FINANCE))):
    _role_guard(current_user, UserRole.FINANCE)
    return _dashboard_payload(db, current_user, UserRole.FINANCE)


@router.get("/franchise-owner/dashboard")
def franchise_owner_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.FRANCHISE_OWNER))):
    _role_guard(current_user, UserRole.FRANCHISE_OWNER)
    return _dashboard_payload(db, current_user, UserRole.FRANCHISE_OWNER)


@router.get("/company-hr/dashboard")
def company_hr_dashboard(db: Session = Depends(get_db), current_user=Depends(require_roles(UserRole.COMPANY_HR))):
    _role_guard(current_user, UserRole.COMPANY_HR)
    return _dashboard_payload(db, current_user, UserRole.COMPANY_HR)
