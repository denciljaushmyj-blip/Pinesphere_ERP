# Pinesphere ERP - Project Context

## Project Overview

Pinesphere ERP is an AI Training Institute ERP platform.

## Tech Stack

### Frontend
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand / Redux store

### Backend
- FastAPI
- SQLAlchemy
- Alembic

### Database
- PostgreSQL

### Authentication
- JWT authentication
- Refresh tokens
- Role Based Access Control

## Active Roles

- Super Admin
- Branch Admin
- Trainer
- Student
- Parent
- Counsellor
- HR
- Finance
- Franchise Owner
- Company HR

## Current Development Focus

The current focus is the Trainer Portal.

Trainer Portal must remain completely isolated from:

- Super Admin
- Branch Admin
- Student
- Other existing portals

All trainer frontend work must remain under:

```text
/trainer/*
```

All trainer backend work must remain under:

```text
/api/v1/trainer/*
```

No existing role functionality should be modified while developing Trainer Portal.

## Trainer Portal Routes

### Existing Routes

- `/trainer/dashboard`
- `/trainer/batches`
- `/trainer/students`
- `/trainer/lms`
- `/trainer/assignments`
- `/trainer/tests`
- `/trainer/calendar`
- `/trainer/messages`
- `/trainer/settings`

### Required Routes

- `/trainer/batches/[id]`
- `/trainer/students/[id]`
- `/trainer/lms/[courseId]`
- `/trainer/assignments/create`
- `/trainer/assignments/[id]`
- `/trainer/tests/create`
- `/trainer/tests/[id]`
- `/trainer/attendance`
- `/trainer/attendance/mark`
- `/trainer/attendance/history`

## Trainer Portal Architecture Rules

### Frontend

Create reusable trainer-only components:

- TrainerLayout
- TrainerSidebar
- TrainerTopbar
- TrainerStatCard
- TrainerTable
- TrainerFilters
- TrainerCharts

All trainer pages should use the same layout and visual language.

### Backend

Trainer APIs should be isolated under:

```text
api/v1/trainer/
```

Example APIs:

- `GET /api/v1/trainer/dashboard/stats`
- `GET /api/v1/trainer/dashboard/attendance-chart`
- `GET /api/v1/trainer/batches`
- `GET /api/v1/trainer/batches/{id}`
- `GET /api/v1/trainer/students`
- `GET /api/v1/trainer/students/{id}`
- `GET /api/v1/trainer/attendance/sessions`
- `POST /api/v1/trainer/attendance/mark`
- `GET /api/v1/trainer/lms/courses`
- `GET /api/v1/trainer/assignments`

## Existing Database Tables

- users
- branches
- courses
- lessons
- enrollments
- lesson_progress
- quizzes
- quiz_questions
- quiz_attempts
- attendance_sessions
- attendance_records
- refresh_tokens
- auth_action_tokens
- audit_logs

## Required Trainer Tables

- batches
- batch_trainer_assignments
- batch_student_enrollments
- assignments
- assignment_submissions
- trainer_lesson_materials
- calendar_events
- message_threads
- messages
- trainer_tasks

## Critical Development Rules

1. Do not use mock data.
2. Do not hardcode statistics.
3. All KPI cards must come from backend APIs.
4. All trainer pages must be API-driven.
5. Keep Trainer Portal isolated.
6. Keep UI consistent across all trainer pages.
7. Follow production-ready architecture.
8. Never modify Super Admin or Branch Admin functionality while building Trainer Portal.
