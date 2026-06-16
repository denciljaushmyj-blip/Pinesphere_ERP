# PROJECT_STRUCTURE.md

# Pinesphere ERP AI Training Institute

## Tech Stack

### Frontend

* Next.js 16
* TypeScript
* Tailwind CSS
* ShadCN UI
* Role-Based Routing

### Backend

* FastAPI
* SQLAlchemy
* Alembic
* PostgreSQL
* JWT Authentication

---

# Root Structure

```text
PINESPHERE_ERP_MAIN/
├── backend/
├── docs/
├── frontend/
├── .gitignore
├── CURRENT_STATUS.md
├── NEXT_TASK.md
├── PROJECT_CONTEXT.md
└── PROJECT_STRUCTURE.md
```

---

# Architecture Rules

## Frontend

```text
frontend/app/
```

Routing only. Route segments, layouts, and page entry points live here.

```text
frontend/modules/
```

Business logic, feature components, feature hooks, feature services, and feature types live here.

```text
frontend/lib/
```

Shared utilities, API clients, auth helpers, constants, permissions, and cross-feature helper functions live here.

```text
frontend/components/ui/
```

Reusable UI primitives live here.

## Backend

```text
backend/app/api/v1/
```

All backend routers live here.

```text
backend/app/api/v1/__init__.py
```

Central router aggregation lives here.

```text
backend/app/services/shared/
```

Shared backend services live here.

---

# Docs Structure

```text
docs/
├── 00-project-overview.md
├── 01-system-architecture.md
├── 03-development-rules.md
├── 07-module-template.md.md
├── 08-api-contracts.md.md
├── 09-agent-workflow.md
└── Responsive_UI.md
```

---

# Backend Structure

```text
backend/
├── alembic/
│   ├── versions/
│   ├── env.py
│   ├── script.py.mako
│   └── README
│
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── ai.py
│   │   │   ├── attendance.py
│   │   │   ├── auth.py
│   │   │   ├── branch_admin.py
│   │   │   ├── branches.py
│   │   │   ├── crm.py
│   │   │   ├── dashboard.py
│   │   │   ├── demo_otp.py
│   │   │   ├── finance.py
│   │   │   ├── franchise.py
│   │   │   ├── history.py
│   │   │   ├── hr.py
│   │   │   ├── lms.py
│   │   │   ├── navigation.py
│   │   │   ├── operations.py
│   │   │   ├── profile.py
│   │   │   ├── reports.py
│   │   │   ├── role_dashboards.py
│   │   │   ├── security.py
│   │   │   ├── settings.py
│   │   │   └── trainer.py
│   │   └── __init__.py
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── dependencies.py
│   │   └── service.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── permissions.py
│   │   ├── roles.py
│   │   └── security.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── attendance.py
│   │   ├── batch.py
│   │   ├── branch.py
│   │   ├── crm.py
│   │   ├── finance.py
│   │   ├── franchise.py
│   │   ├── history.py
│   │   ├── hr.py
│   │   ├── lms.py
│   │   ├── operations.py
│   │   ├── settings.py
│   │   ├── token.py
│   │   ├── trainer.py
│   │   └── user.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── ai.py
│   │   ├── attendance.py
│   │   ├── auth.py
│   │   ├── branch.py
│   │   ├── crm.py
│   │   ├── dashboard.py
│   │   ├── finance.py
│   │   ├── franchise.py
│   │   ├── history.py
│   │   ├── hr.py
│   │   ├── lms.py
│   │   ├── operations.py
│   │   ├── profile.py
│   │   ├── security.py
│   │   ├── settings.py
│   │   └── trainer.py
│   │
│   ├── services/
│   │   ├── shared/
│   │   │   ├── __init__.py
│   │   │   ├── email.py
│   │   │   └── history.py
│   │   ├── students/
│   │   │   ├── __init__.py
│   │   │   └── lms.py
│   │   └── trainers/
│   │       ├── __init__.py
│   │       ├── assignments.py
│   │       ├── attendance.py
│   │       ├── batches.py
│   │       ├── lms.py
│   │       └── students.py
│   │
│   ├── __init__.py
│   └── main.py
│
├── scripts/
│   └── seed_superadmin.py
│
├── uploads/
├── .env
├── .env.example
├── alembic.ini
├── DATABASE_TABLES.md
├── requirements.txt
├── RUN_BACKEND.md
└── run_backend.bat
```

## Backend Notes

* `backend/app/api/v1/__init__.py` owns router aggregation.
* `backend/app/main.py` registers the v1 router aggregation.
* `backend/app/api/v1/demo_otp.py` exists but is not exposed as a production route.
* Trainer lesson material and trainer task models are consolidated in `backend/app/models/trainer.py`.
* No Phase 9A database schema migration was required.

---

# Frontend Structure

```text
frontend/
├── app/
├── components/
├── lib/
├── modules/
├── prisma/
│   └── schema.prisma
├── public/
├── store/
│   └── authModalStore.ts
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── components.json
├── eslint.config.mjs
├── frontend-rules.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts
└── tsconfig.json
```

---

# Frontend App Routing

```text
frontend/app/
├── [...path]/
├── _components/
│   └── RoleSettingsPage.tsx
├── accept-invite/
├── branch-admin/
├── company-hr/
├── counsellor/
├── finance/
├── franchise-owner/
├── hr/
├── parent/
├── profile/
├── settings/
├── student/
├── super-admin/
├── trainer/
├── globals.css
├── layout.tsx
└── page.tsx
```

## App Routing Notes

* `frontend/app/` is routing only.
* Route pages should delegate feature behavior to `frontend/modules/`, `frontend/lib/`, or colocated portal `_components/` where currently established.
* The old `frontend/app/modules/` naming collision has been resolved and removed.
* Duplicate `frontend/app/shared/api.ts` and `frontend/app/shared/auth.ts` have been removed in favor of `frontend/lib/api.ts` and `frontend/lib/auth.ts`.

---

# Role Portals

## Super Admin Portal

```text
frontend/app/super-admin/
├── _components/
│   ├── ReportsAnalyticsPanel.tsx
│   └── UserManagementPanel.tsx
├── dashboard/
│   └── page.tsx
├── settings/
│   └── page.tsx
└── layout.tsx
```

## Branch Admin Portal

```text
frontend/app/branch-admin/
├── _components/
│   ├── BranchAdminAdmissionsPage.tsx
│   ├── BranchAdminAttendancePage.tsx
│   ├── BranchAdminDashboardHome.tsx
│   ├── BranchAdminFeesPage.tsx
│   ├── BranchAdminPhaseOnePages.tsx
│   ├── BranchAdminPlaceholderPage.tsx
│   ├── BranchAdminSelect.tsx
│   ├── BranchAdminShell.tsx
│   ├── BranchAdminStudentsPage.tsx
│   ├── BranchAdminUsersPage.tsx
│   └── BranchManagementPanel.tsx
├── admissions/
│   └── page.tsx
├── attendance/
│   └── page.tsx
├── batch-management/
│   └── page.tsx
├── dashboard/
│   └── page.tsx
├── fees/
│   └── page.tsx
├── lms/
│   └── page.tsx
├── reports/
│   └── page.tsx
├── settings/
│   └── page.tsx
├── students/
│   └── page.tsx
├── users/
│   └── page.tsx
└── layout.tsx
```

## Trainer Portal

```text
frontend/app/trainer/
├── _components/
│   └── TrainerShell.tsx
├── assignments/
├── attendance/
├── batches/
├── calendar/
├── dashboard/
├── lms/
├── messages/
├── settings/
├── students/
├── tests/
└── layout.tsx
```

## Student Portal

```text
frontend/app/student/
├── attendance/
│   └── page.tsx
├── dashboard/
│   ├── data.ts
│   └── page.tsx
├── fees/
│   └── page.tsx
├── lms/
│   ├── [courseId]/
│   │   └── page.tsx
│   └── page.tsx
├── settings/
│   └── page.tsx
└── layout.tsx
```

## Company HR Portal

```text
frontend/app/company-hr/
├── dashboard/
│   └── page.tsx
└── layout.tsx
```

## Franchise Owner Portal

```text
frontend/app/franchise-owner/
├── _components/
│   └── FranchiseOperationsPanel.tsx
├── dashboard/
│   └── page.tsx
└── layout.tsx
```

## HR Portal

```text
frontend/app/hr/
├── _components/
│   └── HRCommandCenter.tsx
```

---

# Shared Components

```text
frontend/components/
├── auth/
│   ├── AuthFooter.tsx
│   ├── AuthModal.tsx
│   ├── AuthParts.tsx
│   ├── ForgotPasswordView.tsx
│   ├── LoginView.tsx
│   ├── OTPInput.tsx
│   ├── OTPLoginForm.tsx
│   ├── OtpView.tsx
│   ├── PasswordLoginForm.tsx
│   ├── PasswordView.tsx
│   ├── RegisterView.tsx
│   ├── SetPasswordView.tsx
│   └── session.ts
├── profile/
│   └── ProfileAvatarDropdown.tsx
├── sidebarConfig/
│   ├── branchAdminSidebar.ts
│   ├── companyHrSidebar.ts
│   ├── counsellorSidebar.ts
│   ├── financeSidebar.ts
│   ├── franchiseOwnerSidebar.ts
│   ├── hrSidebar.ts
│   ├── parentSidebar.ts
│   ├── studentSidebar.ts
│   ├── superAdminSidebar.ts
│   ├── trainerSidebar.ts
│   └── types.ts
├── ui/
│   ├── alert-dialog.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── confirmation-dialog.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── input.tsx
│   ├── table.tsx
│   └── toast.tsx
├── role-dashboard-data.ts
└── role-dashboard.tsx
```

## Components Notes

* `frontend/components/ui/` owns reusable UI primitives.
* Role shell and portal-specific UI remain with their portal or feature module.

---

# Shared Libraries

```text
frontend/lib/
├── api/
│   ├── branchAdmin.ts
│   ├── branchAdminAdmissions.ts
│   ├── branchAdminAttendance.ts
│   ├── branchAdminData.ts
│   ├── branchAdminOptions.ts
│   ├── branchAdminUsers.ts
│   └── settingsProfile.ts
├── api.ts
├── auth.ts
├── constants.ts
├── permissions.ts
├── roleRoutes.ts
└── utils.ts
```

## Lib Notes

* `frontend/lib/api.ts` is the canonical shared API utility.
* `frontend/lib/auth.ts` is the canonical shared auth utility.
* Service files relocated from `frontend/app/` now live under `frontend/lib/api/`.

---

# Frontend Modules

```text
frontend/modules/
├── students/
│   ├── components/
│   │   └── .gitkeep
│   ├── hooks/
│   │   └── .gitkeep
│   ├── services/
│   │   └── .gitkeep
│   └── types.ts
└── trainers/
    ├── components/
    ├── hooks/
    ├── services/
    └── types.ts
```

## Student Module

```text
frontend/modules/students/
├── components/
├── hooks/
├── services/
└── types.ts
```

The student module skeleton exists for future student portal standardization. No student page logic was migrated during Phase 9B.

## Trainer Module

```text
frontend/modules/trainers/
├── components/
├── hooks/
├── services/
└── types.ts
```

Trainer module owns trainer business logic, feature components, hooks, API services, and trainer-specific types.

---

# Trainer Module Architecture

```text
modules/trainers/
├── components/
│   ├── BatchAssignmentsPreview.tsx
│   ├── BatchAttendanceSummary.tsx
│   ├── BatchLmsProgress.tsx
│   ├── BatchOverviewCard.tsx
│   ├── BatchSchedulePreview.tsx
│   ├── BatchStudentsPreview.tsx
│   ├── StudentProgressCard.tsx
│   ├── StudentRiskCard.tsx
│   ├── TrainerAssignmentCard.tsx
│   ├── TrainerAssignmentCreatePage.tsx
│   ├── TrainerAssignmentDetailsPage.tsx
│   ├── TrainerAssignmentEmptyState.tsx
│   ├── TrainerAssignmentForm.tsx
│   ├── TrainerAssignmentGithubPanel.tsx
│   ├── TrainerAssignmentOverviewCard.tsx
│   ├── TrainerAssignmentSubmissionTable.tsx
│   ├── TrainerAssignmentTable.tsx
│   ├── TrainerAssignmentValidation.tsx
│   ├── TrainerAssignmentsPage.tsx
│   ├── TrainerAttendanceHistoryPage.tsx
│   ├── TrainerAttendanceMarkPage.tsx
│   ├── TrainerAttendanceMarkTable.tsx
│   ├── TrainerAttendancePage.tsx
│   ├── TrainerAttendanceSessionCard.tsx
│   ├── TrainerAttendanceSessionsTable.tsx
│   ├── TrainerBatchCard.tsx
│   ├── TrainerBatchDetailsPage.tsx
│   ├── TrainerBatchEmptyState.tsx
│   ├── TrainerBatchTable.tsx
│   ├── TrainerBatchesPage.tsx
│   ├── TrainerCourseCard.tsx
│   ├── TrainerCourseList.tsx
│   ├── TrainerLessonForm.tsx
│   ├── TrainerLessonList.tsx
│   ├── TrainerLmsCourseDetailPage.tsx
│   ├── TrainerLmsEmptyState.tsx
│   ├── TrainerLmsPage.tsx
│   ├── TrainerMaterialUploadPanel.tsx
│   ├── TrainerStudentAIInsights.tsx
│   ├── TrainerStudentAttendanceSummary.tsx
│   ├── TrainerStudentCard.tsx
│   ├── TrainerStudentEmptyState.tsx
│   ├── TrainerStudentLmsProgress.tsx
│   ├── TrainerStudentOverviewCard.tsx
│   ├── TrainerStudentProfilePage.tsx
│   ├── TrainerStudentProjectsTracker.tsx
│   ├── TrainerStudentRiskAlerts.tsx
│   ├── TrainerStudentSkillProgress.tsx
│   ├── TrainerStudentsPage.tsx
│   └── TrainerStudentsTable.tsx
├── hooks/
│   ├── useTrainerAssignmentDetails.ts
│   ├── useTrainerAssignments.ts
│   ├── useTrainerAttendanceHistory.ts
│   ├── useTrainerAttendanceMark.ts
│   ├── useTrainerAttendanceSession.ts
│   ├── useTrainerAttendanceSessions.ts
│   ├── useTrainerBatchDetails.ts
│   ├── useTrainerBatches.ts
│   ├── useTrainerDashboard.ts
│   ├── useTrainerLms.ts
│   ├── useTrainerLmsCourse.ts
│   ├── useTrainerStudentDetails.ts
│   └── useTrainerStudents.ts
├── services/
│   ├── trainerAssignmentService.ts
│   ├── trainerAttendanceService.ts
│   ├── trainerBatchService.ts
│   ├── trainerLmsService.ts
│   ├── trainerService.ts
│   ├── trainerSettingsService.ts
│   └── trainerStudentService.ts
└── types.ts
```

---

# Portal Status

## Completed

```text
Authentication                ✅
Super Admin Portal            ✅
Branch Admin Portal           ✅
Trainer Portal                ✅
Student Portal                ✅
LMS Module                    ✅
Attendance Module             ✅
Fees Module                   ✅
Reports Module                ✅
ERP Integration               ✅
Phase 9A Backend Refactor     ✅
Phase 9B Frontend Refactor    ✅
```

## Next Phase

```text
Phase 10 Production Readiness & Final QA
```

Focus areas:

* Full backend smoke test
* Full frontend route test
* Role-based permission verification
* LMS regression testing
* Attendance regression testing
* Fees regression testing
* Dashboard synchronization check
* Build verification
* Deployment preparation
* Final bug fixing
