import type { RoleSidebarModule } from "./types"

export const trainerSidebar: RoleSidebarModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/trainer/dashboard", icon: "dashboard" },
  { key: "my-batches", label: "My Batches", href: "/trainer/batches", icon: "batches" },
  { key: "students", label: "Students", href: "/trainer/students", icon: "students" },
  { key: "attendance", label: "Attendance", href: "/trainer/attendance", icon: "attendance" },
  { key: "lms", label: "LMS", href: "/trainer/lms", icon: "lms" },
  { key: "assignments", label: "Assignments", href: "/trainer/assignments", icon: "assignments" },
  { key: "tests", label: "Tests", href: "/trainer/tests", icon: "tests" },
  { key: "calendar", label: "Calendar", href: "/trainer/calendar", icon: "calendar" },
  { key: "messages", label: "Messages", href: "/trainer/messages", icon: "messages" },
  { key: "settings", label: "Settings", href: "/trainer/settings", icon: "settings" },
]
