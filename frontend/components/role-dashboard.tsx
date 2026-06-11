"use client"

import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Headphones,
  Home,
  LayoutDashboard,
  Library,
  Menu,
  MessageSquare,
  Network,
  Settings,
  ShieldCheck,
  TestTube2,
  UserRound,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { apiRequest, getStoredSessionValue } from "@/app/shared/api"
import { getRoleDashboardPath, getStoredSession, normalizeUserRole, type UserProfile, type UserRole } from "@/app/shared/auth"
import { ProfileAvatarDropdown } from "@/components/profile/ProfileAvatarDropdown"
import {
  dashboardColors,
  getRoleDashboardMock,
  type CommunicationStat,
  type DashboardIconKey,
  type DashboardMetric,
  type DonutDatum,
  type EventItem,
  type FunnelDatum,
  type LineDatum,
  type MetricTone,
  type ProgressDatum,
  type QuickAction,
  type RecentItem,
  type RoleDashboardKey,
  type RoleDashboardMock,
  type SidebarModule,
  type SummaryStat,
  type TaskItem,
} from "@/components/role-dashboard-data"

type ApiMetric = {
  key: string
  label: string
  value: string
  helper: string
  module: string
}

type ApiDashboardData = {
  role: UserRole | "super_admin"
  title: string
  scope: string
  metrics: ApiMetric[]
  modules: Array<{ key: string; label: string; href: string; enabled: boolean }>
  recent_activity: Array<{ title: string; detail: string; time?: string; module: string }>
  notifications: Array<{ title: string; message: string; tone: "success" | "info" | "warning" }>
  attendance: { rate: number; present: number; total: number; series: Array<{ label: string; rate: number }> }
  fees: { collected: number; pending: number; overdue: number }
  courses: { total_courses: number; published_courses: number; enrollments: number }
  tasks: Array<{ title: string; status: string; module: string }>
  calendar: Array<{ title: string; date: string; module: string }>
  reports: Array<{ title: string; value: string; module: string }>
  permissions: { allowed_modules: string[]; denied_modules: string[] }
  updated_at: string
}

type RoleSession = {
  accessToken: string
  user: UserProfile
}

const iconByKey: Record<DashboardIconKey, LucideIcon> = {
  academics: GraduationCap,
  admissions: FileText,
  assignments: ClipboardList,
  attendance: CalendarDays,
  batches: Users,
  branches: Network,
  calendar: CalendarDays,
  communication: MessageSquare,
  dashboard: Home,
  exams: TestTube2,
  fees: CreditCard,
  franchise: Network,
  library: Library,
  lms: BookOpen,
  messages: MessageSquare,
  notices: Bell,
  payroll: WalletCards,
  placement: GraduationCap,
  profile: UserRound,
  reports: BarChart3,
  security: ShieldCheck,
  settings: Settings,
  staff: Users,
  students: Users,
  tasks: CheckSquare,
  tests: TestTube2,
  users: Users,
  wallet: WalletCards,
}

const toneStyles: Record<MetricTone, { text: string; bg: string; border: string; chip: string }> = {
  green: { text: "#0B7A5A", bg: "#E8F6F0", border: "#CFE8DF", chip: "#E0F3E9" },
  blue: { text: "#2563EB", bg: "#EAF1FF", border: "#D7E4FF", chip: "#E8F0FF" },
  purple: { text: "#7C3AED", bg: "#F3EAFE", border: "#E8D8FB", chip: "#F1E8FF" },
  orange: { text: "#F97316", bg: "#FFF3E8", border: "#FEDFC2", chip: "#FFF0DC" },
  red: { text: "#EF4444", bg: "#FFF0F0", border: "#FBD1D1", chip: "#FFE8E8" },
}

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function isRoleDashboardKey(role?: string | null): role is RoleDashboardKey {
  return (
    role === "super_admin"
    || role === "branch_admin"
    || role === "counsellor"
    || role === "trainer"
    || role === "parent"
    || role === "hr"
    || role === "finance"
    || role === "franchise_owner"
    || role === "company_hr"
  )
}

function assertRoleAccess(expectedRole: UserRole | "super_admin", userRole: string) {
  return normalizeUserRole(userRole) === normalizeUserRole(expectedRole)
}

function roleFromEndpoint(endpoint: string): RoleDashboardKey {
  if (endpoint.includes("counsellor")) return "counsellor"
  if (endpoint.includes("trainer")) return "trainer"
  if (endpoint.includes("parent")) return "parent"
  return "branch_admin"
}

function parseLegacyProfile(): UserProfile | null {
  const raw = getStoredSessionValue("pinesphere_profile")
  if (!raw) return null
  try {
    const profile = JSON.parse(raw) as Partial<UserProfile>
    const role = normalizeUserRole(profile.role) ?? normalizeUserRole(profile.role_abbreviation)
    if (!role || !profile.full_name) return null
    return {
      id: profile.id ?? "",
      email: profile.email ?? "",
      full_name: profile.full_name,
      role,
      role_abbreviation: profile.role_abbreviation ?? "",
      branch_id: profile.branch_id,
      is_active: profile.is_active ?? true,
      display_code: profile.display_code,
      phone: profile.phone,
      profile_photo: profile.profile_photo,
    }
  } catch {
    return null
  }
}

function readRoleSession(): RoleSession | null {
  const session = getStoredSession()
  if (session) return { accessToken: session.accessToken, user: session.user }
  const accessToken = getStoredSessionValue("pinesphere_access_token")
  const profile = parseLegacyProfile()
  if (!accessToken || !profile) return null
  return { accessToken, user: profile }
}

function mergeWithApi(base: RoleDashboardMock, api?: ApiDashboardData | null): RoleDashboardMock {
  if (!api) return base

  const metricByKey = new Map(api.metrics.map((metric) => [metric.key, metric]))
  const metrics = base.metrics.map((metric) => {
    if (metric.key === "students") {
      const live = metricByKey.get("students")
      return live ? { ...metric, value: live.value, helper: live.helper } : metric
    }
    if (metric.key === "leads") {
      const live = metricByKey.get("leads")
      return live ? { ...metric, value: live.value, helper: live.helper } : metric
    }
    if (metric.key === "attendance") {
      const value = api.attendance ? `${api.attendance.rate.toFixed(1)}%` : metric.value
      const helper = api.attendance?.total ? `${api.attendance.present} present / ${api.attendance.total} marked` : metric.helper
      return { ...metric, value, helper }
    }
    if (metric.key === "fees" || metric.key === "paid") {
      return api.fees ? { ...metric, value: formatMoney(api.fees.collected), helper: metric.helper } : metric
    }
    if (metric.key === "outstanding") {
      return api.fees ? { ...metric, value: formatMoney(api.fees.pending), helper: api.fees.overdue ? `${api.fees.overdue} overdue invoice(s)` : metric.helper } : metric
    }
    if (metric.key === "batches") {
      return api.courses ? { ...metric, value: String(api.courses.total_courses || metric.value), helper: `${api.courses.published_courses} published courses` } : metric
    }
    return metric
  })

  const apiActivity: RecentItem[] = api.recent_activity.slice(0, 5).map((item) => ({
    title: item.title,
    detail: item.detail,
    meta: item.time ? new Date(item.time).toLocaleDateString("en-IN") : item.module,
    href: "/reports",
    tone: "green",
  }))

  const lists = base.lists.map((list) => {
    if (list.key === "notifications" && api.notifications.length) {
      return {
        ...list,
        items: api.notifications.map((item) => ({
          title: item.title,
          detail: item.message,
          meta: "Live",
          href: "/communication",
          tone: (item.tone === "warning" ? "orange" : item.tone === "success" ? "green" : "blue") as MetricTone,
        })),
      }
    }
    if ((list.key === "recent-admissions" || list.key === "recent-leads") && apiActivity.length) {
      return { ...list, items: apiActivity }
    }
    return list
  })

  return {
    ...base,
    metrics,
    lists,
    dateLabel: api.updated_at
      ? new Date(api.updated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", weekday: "long" })
      : base.dateLabel,
  }
}

export function RoleDashboardPage({ expectedRole, endpoint }: { expectedRole: UserRole | "super_admin"; endpoint: string }) {
  const roleKey = isRoleDashboardKey(expectedRole) ? expectedRole : roleFromEndpoint(endpoint)
  const [apiDashboard, setApiDashboard] = useState<ApiDashboardData | null>(null)
  const [error, setError] = useState("")
  const [session, setSession] = useState<RoleSession | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const nextSession = readRoleSession()

      if (!nextSession) {
        window.location.href = "/login"
        return
      }

      const role = normalizeUserRole(nextSession.user.role) ?? normalizeUserRole(nextSession.user.role_abbreviation)
      if (!role || !assertRoleAccess(expectedRole, role)) {
        window.location.href = getRoleDashboardPath(role)
        return
      }

      const normalizedSession = { ...nextSession, user: { ...nextSession.user, role } }
      setSession(normalizedSession)
      setSessionReady(true)
      setError("")

      apiRequest<ApiDashboardData>(endpoint, normalizedSession.accessToken)
        .then((data) => {
          if (!cancelled) setApiDashboard(data)
        })
        .catch((err: Error) => {
          if (cancelled) return
          setError(err.message)
          setApiDashboard(null)
        })
    })

    return () => {
      cancelled = true
    }
  }, [endpoint, expectedRole])

  const dashboard = useMemo(() => mergeWithApi(getRoleDashboardMock(roleKey), apiDashboard), [apiDashboard, roleKey])

  if (!sessionReady || !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F8FAF8]">
        <div className="rounded-lg border border-[#DDE9E4] bg-white px-5 py-4 text-sm font-black text-[#071B4A] shadow">
          Loading role dashboard...
        </div>
      </main>
    )
  }

  return (
    <RoleDashboardLayout dashboard={dashboard} user={session.user} apiWarning={error}>
      <RoleDashboardContent dashboard={dashboard} />
    </RoleDashboardLayout>
  )
}

export function RoleDashboardLayout({
  dashboard,
  user,
  apiWarning,
  children,
}: {
  dashboard: RoleDashboardMock
  user: UserProfile
  apiWarning?: string
  children: ReactNode
}) {
  const displayName = user.full_name || dashboard.userName
  return (
    <main className="min-h-screen bg-[#F8FAF8] text-[#071B4A]">
      <div className="grid min-h-screen lg:grid-cols-[292px_minmax(0,1fr)]">
        <RoleSidebar dashboard={dashboard} userName={displayName} />
        <section className="min-w-0">
          <RoleTopbar dashboard={dashboard} user={user} userName={displayName} />
          <div className="mx-auto max-w-[1540px] px-4 py-5 sm:px-6 lg:px-8">
            <section className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-normal text-[#020617] sm:text-3xl">Welcome back, {displayName}!</h2>
                <p className="mt-1.5 text-sm font-semibold text-[#475569]">{dashboard.welcome}</p>
              </div>
              <div className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#DDE9E4] bg-white px-4 text-sm font-black text-[#0F172A] shadow-sm">
                <CalendarDays size={17} className="text-[#0B7A5A]" />
                {dashboard.dateLabel}
              </div>
            </section>
            {apiWarning ? (
              <div className="mb-4 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-xs font-bold text-[#9A3412]">
                Live dashboard data is unavailable, so structured role data is being shown: {apiWarning}
              </div>
            ) : null}
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export function RoleSidebar({ dashboard, userName }: { dashboard: RoleDashboardMock; userName: string }) {
  return (
    <aside className="bg-[linear-gradient(165deg,#063D36_0%,#004235_48%,#002F2D_100%)] text-white">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link href="/" className="flex items-center gap-3 px-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-black text-[#0B7A5A]">P</span>
          <div className="min-w-0">
            <span className="block truncate text-xl font-black leading-tight">Pinesphere ERP</span>
            <span className="text-xs font-semibold text-white/75">{dashboard.portalLabel}</span>
          </div>
        </Link>
        <div className="mt-7 flex items-center gap-3 rounded-lg bg-white/10 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <Avatar label={dashboard.avatar} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{userName}</p>
            <p className="text-xs font-semibold text-white/75">{dashboard.roleLabel}</p>
            <p className="truncate text-xs font-semibold text-white/75">{dashboard.userSubtitle}</p>
          </div>
          <ChevronDown size={15} className="ml-auto text-white/75" />
        </div>
        <nav className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {dashboard.modules.map((module, index) => (
            <SidebarLink key={module.key} module={module} active={index === 0} />
          ))}
        </nav>
        <div className="mt-4 rounded-lg bg-white/10 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <p className="text-sm font-black">Need Help?</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-white/75">We&apos;re here to support you</p>
          <Link href="/messages" className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/35 text-xs font-black text-white transition hover:bg-white/10">
            <Headphones size={15} />
            Contact Support
          </Link>
        </div>
        <div className="mt-5 text-xs font-semibold text-white/70">© 2026 Pinesphere ERP</div>
      </div>
    </aside>
  )
}

function SidebarLink({ module, active }: { module: SidebarModule; active: boolean }) {
  const Icon = iconByKey[module.icon] ?? LayoutDashboard
  return (
    <Link
      href={module.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${
        active ? "bg-[#0B7A5A] text-white shadow-[0_8px_20px_rgba(0,0,0,0.14)]" : "text-white/90 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={17} />
      <span className="truncate">{module.label}</span>
      {module.badge ? <span className="ml-auto rounded-full bg-[#EF4444] px-1.5 py-0.5 text-[10px] font-black text-white">{module.badge}</span> : null}
    </Link>
  )
}

export function RoleTopbar({ dashboard, user, userName }: { dashboard: RoleDashboardMock; user: UserProfile; userName: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-h-12 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Menu size={22} className="shrink-0 text-[#071B4A]" />
          <h1 className="truncate text-base font-black text-[#0F172A] sm:text-lg">{dashboard.title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <button type="button" className="hidden h-10 items-center gap-2 rounded-lg border border-[#DDE9E4] bg-white px-4 text-sm font-black text-[#0F172A] shadow-sm md:flex">
            <Home size={17} />
            Pinesphere Kochi
            <ChevronDown size={15} />
          </button>
          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#071B4A]">
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
              {dashboard.notificationCount}
            </span>
          </button>
          <div className="min-w-0 text-right">
            <p className="hidden max-w-40 truncate text-sm font-black leading-tight text-[#0F172A] sm:block">{userName}</p>
            <p className="whitespace-nowrap text-xs font-semibold text-[#64748B]">{dashboard.roleLabel}</p>
          </div>
          <ProfileAvatarDropdown user={user} compact />
        </div>
      </div>
    </header>
  )
}

function RoleDashboardContent({ dashboard }: { dashboard: RoleDashboardMock }) {
  if (dashboard.role === "branch_admin") return <BranchAdminDashboard dashboard={dashboard} />
  if (dashboard.role === "counsellor") return <CounsellorDashboard dashboard={dashboard} />
  if (dashboard.role === "trainer") return <TrainerDashboard dashboard={dashboard} />
  if (dashboard.role === "parent") return <ParentDashboard dashboard={dashboard} />
  return <GenericRoleDashboard dashboard={dashboard} />
}

function GenericRoleDashboard({ dashboard }: { dashboard: RoleDashboardMock }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={dashboard.metrics} />
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <QuickActionGrid title="Role Modules" actions={dashboard.keyModules ?? []} columns="grid-cols-2" />
        <RecentListCard title={dashboard.lists[0]?.title ?? "Role Activity"} items={dashboard.lists[0]?.items ?? []} href={dashboard.lists[0]?.href ?? "/reports"} linkLabel={dashboard.lists[0]?.linkLabel} />
      </section>
      {dashboard.summaryStats?.length ? <SummaryStatsCard title="Role Scope" stats={dashboard.summaryStats} /> : null}
    </div>
  )
}

function BranchAdminDashboard({ dashboard }: { dashboard: RoleDashboardMock }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={dashboard.metrics} />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr_1.25fr]">
        <ChartCard title={dashboard.donutCards[0].title} href={dashboard.donutCards[0].href} linkLabel={dashboard.donutCards[0].linkLabel}>
          <DonutChart data={dashboard.donutCards[0].data} centerValue={dashboard.donutCards[0].centerValue} centerLabel={dashboard.donutCards[0].centerLabel} />
        </ChartCard>
        <FunnelCard funnel={dashboard.funnels[0]} />
        <ChartCard title={dashboard.lineCards[0].title} href={dashboard.lineCards[0].href} linkLabel={dashboard.lineCards[0].linkLabel}>
          <LineChart data={dashboard.lineCards[0].data} currency={dashboard.lineCards[0].currency} />
        </ChartCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1fr_1.25fr]">
        <QuickActionGrid title="Key Modules" actions={dashboard.keyModules ?? []} columns="grid-cols-2" />
        <RecentListCard title={dashboard.lists[0].title} items={dashboard.lists[0].items} href={dashboard.lists[0].href} linkLabel={dashboard.lists[0].linkLabel} />
        {dashboard.events ? <EventListCard events={dashboard.events.items} title={dashboard.events.title} href={dashboard.events.href} linkLabel={dashboard.events.linkLabel} /> : null}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <SummaryStatsCard title="Quick Stats" stats={dashboard.summaryStats ?? []} />
        <RecentListCard title={dashboard.lists[1].title} items={dashboard.lists[1].items} href={dashboard.lists[1].href} linkLabel={dashboard.lists[1].linkLabel} compact />
      </section>
    </div>
  )
}

function CounsellorDashboard({ dashboard }: { dashboard: RoleDashboardMock }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={dashboard.metrics} />
      <section className="grid gap-4 xl:grid-cols-[1.05fr_1fr_1.25fr]">
        <ChartCard title={dashboard.donutCards[0].title} href={dashboard.donutCards[0].href} linkLabel={dashboard.donutCards[0].linkLabel}>
          <DonutChart data={dashboard.donutCards[0].data} centerValue={dashboard.donutCards[0].centerValue} centerLabel={dashboard.donutCards[0].centerLabel} />
        </ChartCard>
        <FunnelCard funnel={dashboard.funnels[0]} />
        <ChartCard title={dashboard.lineCards[0].title} href={dashboard.lineCards[0].href} linkLabel={dashboard.lineCards[0].linkLabel}>
          <LineChart data={dashboard.lineCards[0].data} />
        </ChartCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_1fr]">
        <RecentListCard title={dashboard.lists[0].title} items={dashboard.lists[0].items} href={dashboard.lists[0].href} linkLabel={dashboard.lists[0].linkLabel} />
        <RecentListCard title={dashboard.lists[1].title} items={dashboard.lists[1].items} href={dashboard.lists[1].href} linkLabel={dashboard.lists[1].linkLabel} />
        <div className="grid gap-4">
          {dashboard.tasks ? <TaskListCard title={dashboard.tasks.title} tasks={dashboard.tasks.items} href={dashboard.tasks.href} linkLabel={dashboard.tasks.linkLabel} /> : null}
          <CommunicationSummary stats={dashboard.communicationStats ?? []} />
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <SummaryStatsCard title="Conversion Overview" stats={dashboard.summaryStats ?? []} />
        <ProgressCard title={dashboard.progressCards[0].title} data={dashboard.progressCards[0].data} href={dashboard.progressCards[0].href} linkLabel={dashboard.progressCards[0].linkLabel} />
      </section>
    </div>
  )
}

function TrainerDashboard({ dashboard }: { dashboard: RoleDashboardMock }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={dashboard.metrics} />
      <section className="grid gap-4 xl:grid-cols-[1.05fr_1fr_1.05fr]">
        <RecentListCard title={dashboard.lists[0].title} items={dashboard.lists[0].items} href={dashboard.lists[0].href} linkLabel={dashboard.lists[0].linkLabel} timeAsBadge />
        <ChartCard title={dashboard.lineCards[0].title} href={dashboard.lineCards[0].href} linkLabel={dashboard.lineCards[0].linkLabel}>
          <LineChart data={dashboard.lineCards[0].data} suffix={dashboard.lineCards[0].suffix} />
        </ChartCard>
        <ProgressCard title={dashboard.progressCards[0].title} data={dashboard.progressCards[0].data} href={dashboard.progressCards[0].href} linkLabel={dashboard.progressCards[0].linkLabel} />
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <RecentListCard title={dashboard.lists[1].title} items={dashboard.lists[1].items} href={dashboard.lists[1].href} linkLabel={dashboard.lists[1].linkLabel} />
        <RecentListCard title={dashboard.lists[2].title} items={dashboard.lists[2].items} href={dashboard.lists[2].href} linkLabel={dashboard.lists[2].linkLabel} />
        {dashboard.tasks ? <TaskListCard title={dashboard.tasks.title} tasks={dashboard.tasks.items} href={dashboard.tasks.href} linkLabel={dashboard.tasks.linkLabel} /> : null}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <ProgressCard title={dashboard.progressCards[1].title} data={dashboard.progressCards[1].data} href={dashboard.progressCards[1].href} linkLabel={dashboard.progressCards[1].linkLabel} compact />
        <QuickActionGrid title="Quick Actions" actions={dashboard.quickActions ?? []} columns="grid-cols-2 sm:grid-cols-5 xl:grid-cols-5" />
      </section>
    </div>
  )
}

function ParentDashboard({ dashboard }: { dashboard: RoleDashboardMock }) {
  return (
    <div className="space-y-4">
      <MetricGrid metrics={dashboard.metrics} />
      <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr_1.1fr]">
        <ChartCard title={dashboard.donutCards[0].title} href={dashboard.donutCards[0].href} linkLabel={dashboard.donutCards[0].linkLabel}>
          <DonutChart data={dashboard.donutCards[0].data} centerValue={dashboard.donutCards[0].centerValue} centerLabel={dashboard.donutCards[0].centerLabel} />
        </ChartCard>
        <ProgressCard title={dashboard.progressCards[0].title} data={dashboard.progressCards[0].data} href={dashboard.progressCards[0].href} linkLabel={dashboard.progressCards[0].linkLabel} />
        <ChartCard title={dashboard.donutCards[1].title} href={dashboard.donutCards[1].href} linkLabel={dashboard.donutCards[1].linkLabel} actionLabel="Pay Now">
          <DonutChart data={dashboard.donutCards[1].data} centerValue={dashboard.donutCards[1].centerValue} centerLabel={dashboard.donutCards[1].centerLabel} />
        </ChartCard>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_1.05fr_1.1fr]">
        {dashboard.events ? <EventListCard events={dashboard.events.items} title={dashboard.events.title} href={dashboard.events.href} linkLabel={dashboard.events.linkLabel} /> : null}
        <RecentListCard title={dashboard.lists[0].title} items={dashboard.lists[0].items} href={dashboard.lists[0].href} linkLabel={dashboard.lists[0].linkLabel} />
        <RecentListCard title={dashboard.lists[1].title} items={dashboard.lists[1].items} href={dashboard.lists[1].href} linkLabel={dashboard.lists[1].linkLabel} />
      </section>
      {dashboard.footerPanel ? <ChildProgressPanel panel={dashboard.footerPanel} /> : null}
    </div>
  )
}

function MetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {metrics.map((metric) => <DashboardMetricCard key={metric.key} metric={metric} />)}
    </section>
  )
}

export function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = iconByKey[metric.icon] ?? LayoutDashboard
  const tone = toneStyles[metric.tone]
  return (
    <Link href={metric.href} className="min-h-[118px] rounded-lg border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]" style={{ borderColor: tone.border }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-[#0F172A]">{metric.label}</h3>
          <p className="mt-2 text-2xl font-black text-[#020617]">{metric.value}</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#475569]">{metric.helper}</p>
        </div>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: tone.bg, color: tone.text }}>
          <Icon size={22} />
        </span>
      </div>
      {typeof metric.progress === "number" ? <ProgressBar value={metric.progress} className="mt-3" /> : null}
    </Link>
  )
}

export function ChartCard({
  title,
  href,
  linkLabel,
  actionLabel,
  children,
}: {
  title: string
  href: string
  linkLabel?: string
  actionLabel?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} href={href} linkLabel={linkLabel} />
      <div className="min-h-[250px]">{children}</div>
      {actionLabel ? (
        <div className="mt-3 flex justify-end">
          <Link href={href} className="rounded-lg bg-[#0B7A5A] px-5 py-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(11,122,90,0.24)]">
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </section>
  )
}

export function DonutChart({ data, centerValue, centerLabel }: { data: DonutDatum[]; centerValue: string; centerLabel: string }) {
  return (
    <div className="grid min-h-[250px] items-center gap-4 sm:grid-cols-[0.9fr_1fr]">
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="58%" outerRadius="78%" paddingAngle={2} stroke="#fff" strokeWidth={3}>
              {data.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value) => String(value)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-black text-[#020617]">{centerValue}</p>
            <p className="text-xs font-bold text-[#475569]">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 font-semibold text-[#334155]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="shrink-0 font-bold text-[#071B4A]">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ data, suffix = "", currency = false }: { data: LineDatum[]; suffix?: string; currency?: boolean }) {
  const formatValue = (value: number) => currency ? `₹${value}L` : `${value}${suffix}`
  return (
    <div className="h-[250px] pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0B7A5A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0B7A5A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E8EEF2" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(value) => formatValue(Number(value))} />
          <Tooltip formatter={(value) => formatValue(Number(value))} contentStyle={{ borderRadius: 8, borderColor: "#DDE9E4", boxShadow: "0 12px 30px rgba(15,23,42,0.1)" }} />
          {data.some((point) => typeof point.previous === "number") ? <Line type="monotone" dataKey="previous" stroke="#A7B0BC" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} /> : null}
          <Line type="monotone" dataKey="current" stroke="#0B7A5A" strokeWidth={3} dot={{ r: 4, fill: "#0B7A5A", strokeWidth: 0 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

function FunnelCard({ funnel }: { funnel: { title: string; href: string; linkLabel: string; data: FunnelDatum[] } }) {
  const max = Math.max(...funnel.data.map((item) => item.value))
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={funnel.title} href={funnel.href} linkLabel={funnel.linkLabel} />
      <div className="space-y-3 py-2">
        {funnel.data.map((item, index) => {
          const width = Math.max(38, (item.value / max) * 100)
          return (
            <div key={item.label} className="grid grid-cols-[138px_minmax(0,1fr)] items-center gap-3">
              <span className="truncate text-xs font-bold text-[#071B4A]">{item.label}</span>
              <div className="flex justify-center">
                <div
                  className="flex h-11 items-center justify-center rounded-sm text-xs font-black text-white shadow-sm"
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color,
                    color: index > 0 ? "#071B4A" : "#fff",
                    clipPath: "polygon(5% 0, 95% 0, 86% 100%, 14% 100%)",
                  }}
                >
                  {item.value}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-[#E8EEF2] ${className}`}>
      <div className="h-full rounded-full bg-[#0B7A5A]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function ProgressCard({
  title,
  data,
  href,
  linkLabel,
  compact,
}: {
  title: string
  data: ProgressDatum[]
  href: string
  linkLabel?: string
  compact?: boolean
}) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} href={href} linkLabel={linkLabel} />
      <div className={compact ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-5" : "space-y-4"}>
        {data.map((item) => (
          <div key={item.label} className={compact ? "min-w-0" : "grid grid-cols-[minmax(0,1fr)_minmax(120px,0.7fr)_42px] items-center gap-3"}>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#071B4A]">{item.label}</p>
              {item.detail ? <p className="mt-0.5 text-[11px] font-semibold text-[#64748B]">{item.detail}</p> : null}
            </div>
            <div>
              <ProgressBar value={item.value} />
            </div>
            <div className="text-right">
              {item.grade ? (
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#E0F3E9] px-2 text-xs font-black text-[#0B7A5A]">{item.grade}</span>
              ) : (
                <span className="text-xs font-black text-[#071B4A]">{item.value}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function RecentListCard({
  title,
  items,
  href,
  linkLabel = "View all",
  compact,
  timeAsBadge,
}: {
  title: string
  items: RecentItem[]
  href: string
  linkLabel?: string
  compact?: boolean
  timeAsBadge?: boolean
}) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} href={href} linkLabel={linkLabel} />
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {items.map((item) => (
          <Link key={`${item.title}-${item.meta ?? ""}`} href={item.href} className="flex items-center gap-3 rounded-lg border border-transparent p-1.5 transition hover:border-[#E3ECE8] hover:bg-[#FBFDFC]">
            {timeAsBadge && item.meta ? (
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-[#DDE9E4] bg-[#F8FAF8] text-center text-sm font-black leading-4 text-[#0B7A5A]">{item.meta.replace(" ", "\n")}</span>
            ) : item.initials ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DFF5E8] text-xs font-black text-[#0B7A5A]">{item.initials}</span>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F6F0] text-[#0B7A5A]">
                <Bell size={15} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-[#071B4A]">{item.title}</span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-[#64748B]">{item.detail}</span>
            </span>
            {item.meta && !timeAsBadge ? <span className="hidden shrink-0 text-xs font-semibold text-[#64748B] md:block">{item.meta}</span> : null}
            {item.status ? <StatusBadge label={item.status} tone={item.tone ?? "green"} /> : null}
          </Link>
        ))}
      </div>
    </section>
  )
}

export function TaskListCard({ title, tasks, href, linkLabel }: { title: string; tasks: TaskItem[]; href: string; linkLabel: string }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} href={href} linkLabel={linkLabel} />
      <div className="space-y-3">
        {tasks.map((task) => (
          <Link key={task.title} href={task.href} className="flex items-start gap-3">
            <span className={`mt-1 h-4 w-4 rounded border ${task.completed ? "border-[#0B7A5A] bg-[#0B7A5A]" : "border-[#B7C2CF] bg-white"}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-[#071B4A]">{task.title}</span>
              {task.detail ? <span className="block truncate text-xs font-semibold text-[#64748B]">{task.detail}</span> : null}
            </span>
            <StatusBadge label={task.due} tone={task.tone ?? "blue"} />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function QuickActionGrid({ title, actions, columns = "grid-cols-2" }: { title: string; actions: QuickAction[]; columns?: string }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} />
      <div className={`grid gap-3 ${columns}`}>
        {actions.map((action) => {
          const Icon = iconByKey[action.icon] ?? LayoutDashboard
          return (
            <Link key={action.label} href={action.href} className="flex min-h-[88px] flex-col items-center justify-center rounded-lg border border-[#E3ECE8] bg-[#FBFDFC] p-3 text-center transition hover:border-[#0B7A5A] hover:bg-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F6F0] text-[#0B7A5A]">
                <Icon size={20} />
              </span>
              <span className="mt-2 text-xs font-black leading-4 text-[#071B4A]">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function StatusBadge({ label, tone = "green" }: { label: string; tone?: MetricTone }) {
  const style = toneStyles[tone]
  return (
    <span className="shrink-0 rounded px-2 py-1 text-[11px] font-black" style={{ backgroundColor: style.chip, color: style.text }}>
      {label}
    </span>
  )
}

function EventListCard({ title, events, href, linkLabel }: { title: string; events: EventItem[]; href: string; linkLabel: string }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} href={href} linkLabel={linkLabel} />
      <div className="space-y-3">
        {events.map((event) => (
          <Link key={`${event.day}-${event.title}`} href={event.href} className="flex items-center gap-3 rounded-lg border-b border-[#EDF3F1] pb-3 last:border-b-0 last:pb-0">
            <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-[#DDE9E4] bg-[#FBFDFC]">
              <span className="text-lg font-black leading-5 text-[#0B7A5A]">{event.day}</span>
              <span className="text-[10px] font-black uppercase text-[#0B7A5A]">{event.month}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-[#071B4A]">{event.title}</span>
              <span className="block truncate text-xs font-semibold text-[#64748B]">{event.time}</span>
            </span>
            <StatusBadge label={event.status} tone={event.tone} />
          </Link>
        ))}
      </div>
    </section>
  )
}

function SummaryStatsCard({ title, stats }: { title: string; stats: SummaryStat[] }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={title} />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="border-r border-[#E3ECE8] px-3 last:border-r-0">
            <p className="truncate text-xs font-bold text-[#64748B]">{stat.label}</p>
            <p className="mt-1 text-xl font-black text-[#020617]">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CommunicationSummary({ stats }: { stats: CommunicationStat[] }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title="Communication Summary (This Month)" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconByKey[stat.icon] ?? MessageSquare
          const tone = toneStyles[stat.tone]
          return (
            <div key={stat.label} className="rounded-lg border border-[#E3ECE8] bg-[#FBFDFC] p-3 text-center">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: tone.bg, color: tone.text }}>
                <Icon size={17} />
              </span>
              <p className="mt-2 text-lg font-black text-[#071B4A]">{stat.value}</p>
              <p className="text-[11px] font-bold text-[#475569]">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ChildProgressPanel({ panel }: { panel: NonNullable<RoleDashboardMock["footerPanel"]> }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <PanelHeader title={panel.title} href={panel.href} linkLabel="View Profile" />
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <div className="flex items-center gap-4">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#DFF5E8] text-xl font-black text-[#0B7A5A]">NP</span>
          <div className="min-w-0">
            <p className="truncate text-base font-black text-[#071B4A]">{panel.studentName}</p>
            <p className="mt-1 text-xs font-semibold text-[#64748B]">{panel.detail}</p>
            <Link href={panel.href} className="mt-3 inline-flex rounded-lg border border-[#DDE9E4] px-4 py-2 text-xs font-black text-[#0B7A5A]">View Profile</Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {panel.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F6F0] text-[#0B7A5A]">
                <ShieldCheck size={18} />
              </span>
              <p className="mt-2 text-xs font-semibold text-[#64748B]">{stat.label}</p>
              <p className="mt-1 text-lg font-black text-[#020617]">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="border-l border-[#E3ECE8] pl-5">
          <p className="text-sm font-black text-[#071B4A]">{panel.remarkTitle}</p>
          <p className="mt-2 text-xs font-semibold leading-6 text-[#475569]">{panel.remark}</p>
          <p className="mt-3 text-xs font-black text-[#071B4A]">- Rahul Kumar</p>
          <p className="text-xs font-semibold text-[#64748B]">Data Structures Faculty</p>
        </div>
      </div>
    </section>
  )
}

function PanelHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="min-w-0 truncate text-sm font-black text-[#071B4A]">{title}</h2>
      {href && linkLabel ? (
        <Link href={href} className="shrink-0 text-xs font-black text-[#0B7A5A]">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  )
}

function Avatar({ label, size = "md" }: { label: string; size?: "md" | "lg" }) {
  const dimensions = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm"
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-[#DFF5E8] font-black text-[#0B7A5A] ${dimensions}`}>{label}</span>
}

export { dashboardColors }
