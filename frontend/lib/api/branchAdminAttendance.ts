import type { BranchScope } from "@/lib/api/branchAdminData"
import { getAttendanceOverview } from "@/lib/api/branchAdmin"

export type AttendanceTrendPoint = {
  day: string
  rate: number
}

export type BatchAttendance = {
  branch_id: string | null
  batch: string
  course: string
  attendance_rate: number
  students: number
}

export type TrainerCompliance = {
  branch_id: string | null
  trainer: string
  classes_assigned: number
  attendance_submitted: number
  status: "Compliant" | "Pending" | "At Risk"
}

export type AttendanceAlert = {
  title: string
  detail: string
  severity: "Critical" | "Warning" | "Info"
}

export type RiskStudent = {
  branch_id: string | null
  student: string
  course: string
  batch: string
  attendance_rate: number
  last_present: string
  risk_level: "High" | "Medium" | "Low"
}

export type HeatmapCell = {
  day: string
  slot: string
  rate: number
}

export type ActivityItem = {
  title: string
  detail: string
  time: string
}

export type BranchAttendanceDashboard = {
  branch_id: string | null
  kpis: {
    today_attendance_rate: number
    present_students: number
    absent_students: number
    late_checkins: number
    attendance_compliance: number
  }
  trend: AttendanceTrendPoint[]
  batches: BatchAttendance[]
  trainers: TrainerCompliance[]
  alerts: AttendanceAlert[]
  risk_students: RiskStudent[]
  heatmap: HeatmapCell[]
  activity: ActivityItem[]
}

export const mockBranchAttendance: BranchAttendanceDashboard = {
  branch_id: null,
  kpis: {
    today_attendance_rate: 0,
    present_students: 0,
    absent_students: 0,
    late_checkins: 0,
    attendance_compliance: 0,
  },
  trend: [],
  batches: [],
  trainers: [],
  alerts: [],
  risk_students: [],
  heatmap: [],
  activity: [],
}

export function getMockBranchAttendance(_scope: BranchScope) {
  return mockBranchAttendance
}

export async function fetchBranchAttendance() {
  return getAttendanceOverview()
}
