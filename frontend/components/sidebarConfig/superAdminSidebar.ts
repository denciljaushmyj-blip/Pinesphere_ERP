import type { RoleSidebarModule } from "./types"

export const superAdminSidebar: RoleSidebarModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/super-admin/dashboard", icon: "dashboard" },
  { key: "branches", label: "Branches", href: "/branches", icon: "branches" },
  { key: "users", label: "Users", href: "/users", icon: "users" },
  { key: "students", label: "Students", href: "/students", icon: "students" },
  { key: "finance", label: "Finance", href: "/finance", icon: "fees" },
  { key: "hr", label: "HR", href: "/hr", icon: "staff" },
  { key: "franchise", label: "Franchise", href: "/franchise", icon: "franchise" },
  { key: "reports", label: "Reports", href: "/reports", icon: "reports" },
  { key: "security", label: "Security", href: "/security", icon: "security" },
  { key: "settings", label: "Settings", href: "/super-admin/settings", icon: "settings" },
]
