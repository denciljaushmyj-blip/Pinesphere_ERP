import type { RoleSidebarModule } from "./types"

export const branchAdminSidebar: RoleSidebarModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/branch-admin/dashboard", icon: "dashboard" },
  { key: "students", label: "Students", href: "/students", icon: "students" },
  { key: "staff", label: "Staff", href: "/hr", icon: "staff" },
  { key: "finance", label: "Finance", href: "/finance", icon: "fees" },
  { key: "lms", label: "LMS", href: "/lms", icon: "lms" },
  { key: "reports", label: "Reports", href: "/reports", icon: "reports" },
  { key: "communication", label: "Communication", href: "/communication", icon: "communication" },
  { key: "settings", label: "Settings", href: "/branch-admin/settings", icon: "settings" },
]
