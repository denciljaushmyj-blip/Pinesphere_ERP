/* =====================================================
PINESPHERE ERP
Module      : Student Module
Component   : Data
Purpose     : Provides Data frontend logic and shared types
Author      : Pinesphere Development Team
Last Updated: Auto Generated
===================================================== */

import { apiRequest, getStoredSessionValue } from "@/app/shared/api"

/* =====================================================
   SECTION: TYPES AND INTERFACES
   PURPOSE:
   This section describes the shape of data used by the code.
   Clear types make component props, API payloads, and state easier to understand.
===================================================== */

export type StudentCourse = {
  id: string
  title: string
  track: string
  trainer: string
  trainerInitials: string
  progress: number
  remainingLessons: number
  nextClass: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  accent: string
}

export type StudentAssignment = {
  id: string
  title: string
  course: string
  due: string
  priority: "High" | "Medium" | "Low"
}

export type StudentCertificate = {
  id: string
  name: string
  issueDate: string
}

export type PlacementReadiness = {
  resumeScore: number
  interviewReadiness: number
  projectsCompleted: number
  projectsRequired: number
  eligible: boolean
}

export type StudentDashboardData = {
  profileCompletion: number
  learningStreak: number
  enrolledCourseCount: number
  assignmentsCompleted: number
  enrolledCourses: StudentCourse[]
  assignmentsDue: StudentAssignment[]
  certificates: StudentCertificate[]
  placementReadiness: PlacementReadiness
  glance: {
    attendance: number
    pendingTasks: number
    certificatesEarned: number
  }
}

export const studentDashboardApiEndpoints = {
  dashboard: "/api/student/dashboard",
  profile: "/profile/me",
  enrolledCourses: "/student/courses",
  assignments: "/student/assignments",
  certificates: "/student/certificates",
  placementReadiness: "/student/placement-readiness",
}

export const mockStudentDashboardData: StudentDashboardData = {
  profileCompletion: 78,
  learningStreak: 7,
  enrolledCourseCount: 8,
  assignmentsCompleted: 12,
  enrolledCourses: [
    {
      id: "ai-foundation",
      title: "AI Foundation Program",
      track: "Tech Pack",
      trainer: "Nisha Raman",
      trainerInitials: "NR",
      progress: 68,
      remainingLessons: 9,
      nextClass: "Tomorrow, 6:00 PM",
      difficulty: "Beginner",
      accent: "var(--pinesphere-green)",
    },
    {
      id: "prompt-engineering",
      title: "Prompt Engineering Lab",
      track: "Business Pack",
      trainer: "Arun Mathew",
      trainerInitials: "AM",
      progress: 52,
      remainingLessons: 16,
      nextClass: "07 Jun, 7:30 PM",
      difficulty: "Intermediate",
      accent: "#7C3AED",
    },
    {
      id: "python-ml",
      title: "Machine Learning Basics",
      track: "Tech Pack",
      trainer: "Meera Joseph",
      trainerInitials: "MJ",
      progress: 34,
      remainingLessons: 24,
      nextClass: "09 Jun, 5:00 PM",
      difficulty: "Advanced",
      accent: "#F97316",
    },
  ],
  assignmentsDue: [
    { id: "as-1", title: "AI Foundation Worksheet", course: "AI Foundation Program", due: "Today, 11:59 PM", priority: "High" },
    { id: "as-2", title: "Prompt Engineering Project", course: "Prompt Engineering Lab", due: "07 Jun, 11:59 PM", priority: "Medium" },
    { id: "as-3", title: "ML Basics Lab Report", course: "Machine Learning Basics", due: "10 Jun, 11:59 PM", priority: "Low" },
  ],
  certificates: [
    { id: "cert-1", name: "AI Foundation Completion", issueDate: "20 May 2026" },
    { id: "cert-2", name: "Prompt Engineering Explorer", issueDate: "29 May 2026" },
  ],
  placementReadiness: {
    resumeScore: 85,
    interviewReadiness: 72,
    projectsCompleted: 4,
    projectsRequired: 5,
    eligible: true,
  },
  glance: {
    attendance: 86,
    pendingTasks: 3,
    certificatesEarned: 2,
  },
}

/* =====================================================
   SECTION: HELPER FUNCTIONS
   PURPOSE:
   This section contains small reusable utilities used by the file.
   Helpers keep repeated logic in one clear place.
===================================================== */

export async function loadStudentDashboardData(): Promise<StudentDashboardData> {
  const accessToken = getStoredSessionValue("pinesphere_access_token")
  if (!accessToken) return mockStudentDashboardData

  try {
    return await apiRequest<StudentDashboardData>(studentDashboardApiEndpoints.dashboard, accessToken)
  } catch {
    return mockStudentDashboardData
  }
}
