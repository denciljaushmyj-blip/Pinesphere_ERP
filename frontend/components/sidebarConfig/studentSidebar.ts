import type { RoleSidebarModule } from "./types"

export const studentSidebar: RoleSidebarModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
  { key: "courses", label: "My Courses", href: "/student/dashboard#student-courses", icon: "lms" },
  { key: "attendance", label: "Attendance", href: "/attendance", icon: "attendance" },
  { key: "assignments", label: "Assignments", href: "/student/dashboard#student-assignments", icon: "assignments" },
  { key: "exams", label: "Exams", href: "/exams", icon: "tests" },
  { key: "certificates", label: "Certificates", href: "/student/dashboard#student-certificates", icon: "academics" },
  { key: "fees", label: "Fees", href: "/finance", icon: "fees" },
  { key: "messages", label: "Messages", href: "/messages", icon: "messages" },
  { key: "calendar", label: "Calendar", href: "/calendar", icon: "calendar" },
  { key: "settings", label: "Settings", href: "/student/settings", icon: "settings" },
]
