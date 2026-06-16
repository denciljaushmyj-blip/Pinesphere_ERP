# NEXT_TASK.md

## Current Phase

# Phase 10 - Production Readiness & Final QA

Status: Ready to Start

Phase 9A - Backend Refactor: ✅ Complete  
Phase 9B - Frontend Refactor: ✅ Complete

---

## Phase Objective

Prepare Pinesphere ERP for production by validating the completed MVP and post-refactor architecture across backend, frontend, role permissions, LMS, attendance, fees, dashboards, builds, and deployment readiness.

Do not start new architecture refactors during Phase 10 unless a production-readiness issue requires a narrowly scoped fix.

---

# Phase 10 Tasks

## Task 10.1

### Full Backend Smoke Test

Validate that the backend starts cleanly and core API groups remain reachable.

Checklist:

* [ ] Start backend server
* [ ] Verify OpenAPI loads
* [ ] Verify authentication endpoints
* [ ] Verify trainer endpoints
* [ ] Verify student LMS endpoints
* [ ] Verify attendance endpoints
* [ ] Verify fees endpoints
* [ ] Verify reports endpoints
* [ ] Confirm no duplicate `/api/v1` prefixes

---

## Task 10.2

### Full Frontend Route Test

Validate all major frontend routes compile and load.

Checklist:

* [ ] `/super-admin/dashboard`
* [ ] `/branch-admin/dashboard`
* [ ] `/trainer/dashboard`
* [ ] `/student/dashboard`
* [ ] `/student/lms`
* [ ] `/company-hr/dashboard`
* [ ] `/franchise-owner/dashboard`
* [ ] Fees routes
* [ ] Attendance routes
* [ ] Reports routes
* [ ] Settings/profile routes

---

## Task 10.3

### Role-Based Permission Verification

Validate that each role can access only the correct portal and features.

Checklist:

* [ ] Super Admin permissions
* [ ] Branch Admin permissions
* [ ] Trainer permissions
* [ ] Student permissions
* [ ] Company HR permissions
* [ ] Franchise Owner permissions
* [ ] Parent permissions
* [ ] Finance permissions
* [ ] Counsellor permissions
* [ ] Unauthorized route handling

---

## Task 10.4

### LMS Regression Testing

Validate LMS workflows after the Phase 9 architecture cleanup.

Checklist:

* [ ] Trainer course listing
* [ ] Trainer course details
* [ ] Lesson/material workflows
* [ ] Student course listing
* [ ] Student course detail page
* [ ] Student LMS progress display
* [ ] Uploaded material access

---

## Task 10.5

### Attendance Regression Testing

Validate attendance workflows.

Checklist:

* [ ] Trainer attendance sessions
* [ ] Trainer mark attendance flow
* [ ] Trainer attendance history
* [ ] Student attendance view
* [ ] Branch admin attendance view
* [ ] Attendance API consistency

---

## Task 10.6

### Fees Regression Testing

Validate fees workflows.

Checklist:

* [ ] Branch admin fees page
* [ ] Student fees page
* [ ] Payment/fee status display
* [ ] Outstanding fee calculations
* [ ] Fees API consistency

---

## Task 10.7

### Dashboard Synchronization Check

Validate that dashboards still show consistent data after the refactor.

Checklist:

* [ ] Super Admin dashboard
* [ ] Branch Admin dashboard
* [ ] Trainer dashboard
* [ ] Student dashboard
* [ ] Company HR dashboard
* [ ] Franchise Owner dashboard
* [ ] Role dashboard data consistency

---

## Task 10.8

### Build Verification

Validate production build readiness.

Checklist:

* [ ] Backend startup verification
* [ ] Alembic check
* [ ] Alembic history
* [ ] Frontend build
* [ ] TypeScript validation
* [ ] Static route generation
* [ ] Environment variable review

---

## Task 10.9

### Deployment Preparation

Prepare deployment documentation and production configuration.

Checklist:

* [ ] Backend deployment requirements
* [ ] Frontend deployment requirements
* [ ] Environment variable checklist
* [ ] Database migration checklist
* [ ] Upload/storage path checklist
* [ ] CORS and production domain checklist
* [ ] Admin seed checklist

---

## Task 10.10

### Final Bug Fixing

Resolve only issues found during Phase 10 validation.

Rules:

* [ ] Keep fixes narrowly scoped
* [ ] Do not redesign UI
* [ ] Do not change API contracts unless approved
* [ ] Do not change database schema unless approved
* [ ] Re-run affected validation after each fix

---

# Current Active Task

### START HERE

Phase 10 -> Task 10.1

Run the full backend smoke test first, then proceed through frontend route testing and role-based QA.
