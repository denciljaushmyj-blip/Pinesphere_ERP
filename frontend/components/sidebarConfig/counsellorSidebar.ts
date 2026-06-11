import type { RoleSidebarModule } from "./types"

export const counsellorSidebar: RoleSidebarModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/counsellor/dashboard", icon: "dashboard" },
  { key: "leads", label: "Leads", href: "/crm", icon: "students" },
  { key: "follow-ups", label: "Follow Ups", href: "/crm", icon: "calendar" },
  { key: "admissions", label: "Admissions", href: "/crm", icon: "admissions" },
  { key: "students", label: "Students", href: "/students", icon: "students" },
  { key: "tasks", label: "Tasks", href: "/tasks", icon: "tasks" },
  { key: "calendar", label: "Calendar", href: "/calendar", icon: "calendar" },
  { key: "reports", label: "Reports", href: "/reports", icon: "reports" },
  { key: "communication", label: "Communication", href: "/communication", icon: "communication" },
  { key: "settings", label: "Settings", href: "/counsellor/settings", icon: "settings" },
]
