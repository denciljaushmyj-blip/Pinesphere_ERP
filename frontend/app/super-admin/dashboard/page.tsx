import { RoleDashboardPage } from "@/components/role-dashboard"

export default function SuperAdminDashboard() {
  return <RoleDashboardPage expectedRole="super_admin" endpoint="/api/dashboard/super-admin" />
}
