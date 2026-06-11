"use client"

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Plus,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Table2,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { API_URL, getStoredSessionValue } from "@/lib/api"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { changeProfilePassword } from "@/app/settings/profile/settingsProfileService"
import { readBranchAdminSession, storeBranchAdminPreferences } from "./BranchAdminShell"
import { BranchAdminSelect } from "./BranchAdminSelect"
import {
  assignTrainer,
  collectFee,
  createBatch,
  getBatches,
  getBranchSettings,
  getBranchSettingsUsers,
  getFeeReceipts,
  getFeeDefaulters,
  getFeeEmi,
  getFeeLedger,
  getFeesOverview,
  getInvoices,
  getPendingFees,
  getPayments,
  getReports,
  getStudents,
  transferBatchStudent,
  updateBatch,
  updateBranchSettings,
  updateBranchSettingsUserStatus,
  type BatchRecord,
  type BranchSettings,
  type BranchUserRecord,
  type DefaulterFeeRecord,
  type EmiRecord,
  type FeeReceiptRecord,
  type FeeLedgerRecord,
  type FeesOverview,
  type InvoiceRecord,
  type PendingFeeRecord,
  type StudentRecord,
  downloadFeeReceiptPdf,
  downloadFeeReceiptsReport,
  downloadFeeEmiReport,
  downloadFeeDefaultersReport,
  downloadPendingFeesReport,
} from "@/lib/api/branchAdmin"
import { getCourseOptions, getModeOptions, getPaymentMethodOptions, getStudentOptions, getTrainerOptions, type CourseOption, type ModeOption, type PaymentMethodOption, type TrainerOption } from "@/lib/api/branchAdminOptions"
import { resolveBranchScope } from "./branchAdminData"

type BatchRow = {
  batch: string
  course: string
  trainer: string
  capacity: number
  enrolled: number
  schedule: string
}

const batches: BatchRow[] = [
  { batch: "FSD Morning", course: "Full Stack Development", trainer: "Meera Nair", capacity: 45, enrolled: 42, schedule: "Mon-Fri · 9:00 AM" },
  { batch: "DS Weekend", course: "Data Science", trainer: "Rahul Kumar", capacity: 40, enrolled: 36, schedule: "Sat-Sun · 10:00 AM" },
  { batch: "UX Evening", course: "UI/UX Design", trainer: "Anitha Raj", capacity: 35, enrolled: 31, schedule: "Mon-Wed-Fri · 6:00 PM" },
  { batch: "Cyber Security", course: "Cyber Security", trainer: "Vishal Menon", capacity: 30, enrolled: 24, schedule: "Tue-Thu · 7:00 PM" },
]

const reports = [
  { name: "Admissions Report", module: "Admissions", format: "PDF / Excel / CSV", updated: "Today" },
  { name: "Student Report", module: "Students", format: "PDF / Excel / CSV", updated: "Today" },
  { name: "Attendance Report", module: "Attendance", format: "PDF / Excel / CSV", updated: "Yesterday" },
  { name: "Fee Report", module: "Fees", format: "PDF / Excel / CSV", updated: "Today" },
  { name: "Batch Report", module: "Batch", format: "PDF / Excel / CSV", updated: "2 days ago" },
]

const users = [
  { name: "Meera Nair", role: "Trainer", status: "Active" },
  { name: "Rahul Kumar", role: "Trainer", status: "Active" },
  { name: "Priya Menon", role: "Counsellor", status: "Active" },
  { name: "Anitha Raj", role: "Trainer", status: "Review" },
]

function useBranchScope() {
  const session = useMemo(() => readBranchAdminSession(), [])
  return useMemo(() => session?.branch ?? resolveBranchScope(), [session])
}

export function BranchAdminBatchPage() {
  const branch = useBranchScope()
  const [batches, setBatches] = useState<BatchRecord[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [users, setUsers] = useState<BranchUserRecord[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [trainers, setTrainers] = useState<TrainerOption[]>([])
  const [modes, setModes] = useState<ModeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | "trainer" | "transfer" | null>(null)
  const [viewMode, setViewMode] = useState("Weekly View")

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  function loadBatchData() {
    setLoading(true)
    Promise.all([getBatches(), getStudents(), getBranchSettingsUsers(), getCourseOptions(), getTrainerOptions(), getModeOptions()])
      .then((rows) => {
        setBatches(rows[0])
        setStudents(rows[1])
        setUsers(rows[2])
        setCourses(rows[3])
        setTrainers(rows[4])
        setModes(rows[5])
        setError("")
      })
      .catch((err: Error) => {
        setBatches([])
        setError(`Live API unavailable: ${err.message}`)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBatchData()
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader title="Batch Management" subtitle={`Manage branch batches, trainer assignment, capacity, and timetable views for ${branch.branch_name}.`} action="Create Batch" onAction={() => setModal("create")} />
      <ApiState loading={loading} error={error} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active Batches" value={String(batches.length)} icon={Table2} />
        <Metric label="Enrolled Students" value={String(batches.reduce((sum, batch) => sum + batch.enrolled, 0))} icon={Users} />
        <Metric label="Trainer Coverage" value={`${Math.round((new Set(batches.map((batch) => batch.trainer)).size / Math.max(batches.length, 1)) * 100)}%`} icon={UserCheck} />
        <Metric label="Capacity Alerts" value={String(batches.filter((batch) => batch.enrolled / batch.capacity > 0.85).length)} icon={ShieldCheck} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <DataPanel title="Batch Directory" headings={["Batch", "Course", "Trainer", "Capacity", "Schedule"]}>
          {batches.map((batch) => (
            <tr key={batch.batch} className="border-b border-[#EDF3F1] last:border-b-0">
              <td className="px-3 py-3 font-black text-[#071B4A]">{batch.batch}</td>
              <td className="px-3 py-3 font-semibold text-[#475569]">{batch.course}</td>
              <td className="px-3 py-3 font-semibold text-[#475569]">{batch.trainer}</td>
              <td className="px-3 py-3 font-black text-[#0B7A5A]">{batch.enrolled}/{batch.capacity}</td>
              <td className="px-3 py-3 font-semibold text-[#475569]">{batch.schedule}</td>
            </tr>
          ))}
          {!batches.length && !loading ? <EmptyTableRow columns={5} label="No batches found." /> : null}
        </DataPanel>
        <CompactPanel title="Timetable">
          {["Weekly View", "Monthly View", "Calendar View"].map((label) => (
            <button key={label} type="button" onClick={() => setViewMode(label)} className={`flex h-11 w-full items-center justify-between rounded-lg border px-3 text-sm font-black ${viewMode === label ? "border-[#0B7A5A] bg-[#E8F6F0] text-[#0B7A5A]" : "border-[#DDE9E4] bg-[#FBFDFC] text-[#071B4A]"}`}>
              {label}
              <CalendarDays size={16} className="text-[#0B7A5A]" />
            </button>
          ))}
          <div className="rounded-lg border border-[#EDF3F1] bg-[#FBFDFC] p-3 text-xs font-bold text-[#64748B]">{viewMode} timetable is generated from the current branch batch directory.</div>
        </CompactPanel>
      </section>
      <QuickStrip actions={["Edit Batch", "Assign Trainer", "Transfer Students", "Export Timetable"]} onAction={(action) => {
        if (action === "Edit Batch") setModal("edit")
        if (action === "Assign Trainer") setModal("trainer")
        if (action === "Transfer Students") setModal("transfer")
        if (action === "Export Timetable") {
          if (!batches.length) return showToast("No timetable data to export.")
          downloadCsv("branch_timetable.csv", ["Batch", "Course", "Trainer", "Capacity", "Enrolled", "Schedule", "Mode"], batches.map((batch) => [batch.batch, batch.course, batch.trainer, batch.capacity, batch.enrolled, batch.schedule, batch.mode || "Offline"]))
          showToast("Export downloaded successfully.")
        }
      }} />
      {modal === "create" ? <BatchFormModal title="Create Batch" courses={courses} trainers={trainers} modes={modes} onClose={() => setModal(null)} onSave={async (payload) => { await createBatch(payload); await loadBatchData(); setModal(null); showToast("Batch saved successfully.") }} /> : null}
      {modal === "edit" ? <BatchEditModal batches={batches} courses={courses} trainers={trainers} modes={modes} onClose={() => setModal(null)} onSave={async (batchName, payload) => { await updateBatch(batchName, payload); await loadBatchData(); setModal(null); showToast("Batch updated successfully.") }} /> : null}
      {modal === "trainer" ? <AssignTrainerModal batches={batches} trainers={trainers} onClose={() => setModal(null)} onSave={async (payload) => { await assignTrainer(payload); await loadBatchData(); setModal(null); showToast("Trainer assigned successfully.") }} /> : null}
      {modal === "transfer" ? <TransferStudentModal batches={batches} students={students} onClose={() => setModal(null)} onSave={async (source, payload) => { await transferBatchStudent(source, payload); await loadBatchData(); setModal(null); showToast("Student transferred successfully.") }} /> : null}
      {toast ? <Toast message={toast} /> : null}
    </div>
  )
}

export function BranchAdminReportsPage() {
  const branch = useBranchScope()
  const [module, setModule] = useState("All")
  const [course, setCourse] = useState("")
  const [batch, setBatch] = useState("")
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [batches, setBatches] = useState<BatchRecord[]>([])
  const [reportRows, setReportRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const filtered = useMemo(() => module === "All" ? reports : reports.filter((report) => report.module === module), [module])

  useEffect(() => {
    const reportType = module === "All" ? "students" : module.toLowerCase()
    setLoading(true)
    Promise.all([getReports(reportType === "batch" ? "batches" : reportType), getCourseOptions(), getBatches()])
      .then(([payload, courseRows, batchRows]) => {
        setReportRows(Array.isArray(payload.rows) ? payload.rows as Record<string, unknown>[] : [])
        setCourses(courseRows)
        setBatches(batchRows)
        setError("")
      })
      .catch((err: Error) => {
        setReportRows([])
        setError(`Live API unavailable: ${err.message}`)
      })
      .finally(() => setLoading(false))
  }, [module])

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" subtitle={`Generate admissions, student, attendance, fee, and batch reports for ${branch.branch_name}.`} action="Export Report" />
      <ApiState loading={loading} error={error} />
      <section className="grid gap-3 md:grid-cols-[1fr_170px_170px_170px_auto]">
        <BranchAdminSelect label="Module" value={module} onChange={setModule} options={["All", "Admissions", "Students", "Attendance", "Fees", "Batch"].map((item) => ({ label: item, value: item }))} />
        <input type="date" className="h-11 rounded-lg border border-[#DDE9E4] bg-white px-3 text-sm font-black text-[#071B4A]" />
        <BranchAdminSelect label="Course" value={course} onChange={setCourse} placeholder="Course: All" clearable options={courses.map((item) => ({ label: item.label, value: item.id }))} loading={loading && !courses.length} />
        <BranchAdminSelect label="Batch" value={batch} onChange={setBatch} placeholder="Batch: All" clearable options={batches.map((item) => ({ label: item.batch_name, value: item.batch_name }))} loading={loading && !batches.length} />
        <button type="button" className="h-11 rounded-lg bg-[#0B7A5A] px-4 text-sm font-black text-white">Apply</button>
      </section>
      <DataPanel title="Report Library" headings={["Report", "Module", "Export", "Updated", "Actions"]}>
        {filtered.map((report) => (
          <tr key={report.name} className="border-b border-[#EDF3F1] last:border-b-0">
            <td className="px-3 py-3 font-black text-[#071B4A]">{report.name}</td>
            <td className="px-3 py-3 font-semibold text-[#475569]">{report.module}</td>
            <td className="px-3 py-3 font-semibold text-[#475569]">{report.format}</td>
            <td className="px-3 py-3 font-semibold text-[#475569]">{reportRows.length} rows</td>
            <td className="px-3 py-3">
              <div className="flex flex-wrap gap-2">
                <SmallButton icon={FileText} label="PDF" />
                <SmallButton icon={FileSpreadsheet} label="Excel" />
                <SmallButton icon={Download} label="CSV" />
              </div>
            </td>
          </tr>
        ))}
      </DataPanel>
    </div>
  )
}

export function BranchAdminSettingsPage() {
  const branch = useBranchScope()
  const router = useRouter()
  const searchParams = useSearchParams()
  const session = useMemo(() => readBranchAdminSession(), [])
  const [settings, setSettings] = useState<BranchSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)

  const tabParam = searchParams.get("tab")
  const activeTab = tabParam === "password" || tabParam === "preferences" || tabParam === "profile" ? tabParam : "profile"

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  function changeTab(tab: "profile" | "password" | "preferences") {
    router.push(`/branch-admin/settings?tab=${tab}`)
  }

  async function loadSettings() {
    setLoading(true)
    try {
      const payload = await getBranchSettings()
      setSettings(payload)
      storeBranchAdminPreferences(payload.preferences ?? {})
      setError("")
    } catch (err) {
      setSettings(null)
      setError(err instanceof Error ? `Live API unavailable: ${err.message}` : "Live API unavailable")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function savePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast("Enter current password, new password, and confirmation.")
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New password and confirm password must match.")
      return
    }
    setSavingPassword(true)
    try {
      await changeProfilePassword(passwordForm)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      showToast("Password saved successfully.")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Password could not be saved.")
    } finally {
      setSavingPassword(false)
    }
  }

  async function saveAccountPreferences(preferences: Record<string, string>) {
    setSavingPreferences(true)
    try {
      const saved = await updateBranchSettings({ preferences: { ...(settings?.preferences ?? {}), ...preferences } })
      setSettings(saved)
      storeBranchAdminPreferences({ ...(saved.preferences ?? {}), ...preferences })
      showToast("Preferences saved successfully.")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Preferences could not be saved.")
    } finally {
      setSavingPreferences(false)
    }
  }

  const user = session?.user
  const branchInfo = settings?.branch
  const profileRecord = user as Record<string, unknown> | undefined
  const profileRows: Array<[string, unknown]> = [
    ["Full Name", user?.full_name],
    ["Username", user?.email?.split("@")[0]],
    ["Email", user?.email],
    ["Phone", user?.phone],
    ["Role", "Branch Admin"],
    ["Gender", profileRecord?.gender],
    ["Date of Birth", profileRecord?.date_of_birth],
  ]
  const branchRows: Array<[string, unknown]> = [
    ["Branch Name", branchInfo?.name ?? settings?.branch_name ?? branch.branch_name],
    ["Branch Code", branchInfo?.code ?? branch.branch_code],
    ["City", branchInfo?.city ?? branch.city],
    ["Admin ID", user?.display_code ?? user?.id],
  ]
  const contactRows: Array<[string, unknown]> = [
    ["Email", user?.email],
    ["Phone", user?.phone],
  ]
  const preferences = useMemo(() => ({
    theme_preference: settings?.preferences.theme_preference ?? "System",
    notification_preference: settings?.preferences.notification_preference ?? "Both",
    dashboard_preference: settings?.preferences.dashboard_preference ?? "Detailed",
    language_preference: settings?.preferences.language_preference ?? "English",
  }), [settings?.preferences.dashboard_preference, settings?.preferences.language_preference, settings?.preferences.notification_preference, settings?.preferences.theme_preference])

  return (
    <div className="space-y-5">
      <section>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0B7A5A]">Account Settings</p>
        <h2 className="mt-1 text-2xl font-black tracking-normal text-[#020617] sm:text-3xl">Settings</h2>
      </section>
      <ApiState loading={loading} error={error} />

      <section className="rounded-lg border border-[#E3ECE8] bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
        <div className="grid gap-2 sm:grid-cols-3">
          <SettingsTabButton icon={UserRound} label="Profile" active={activeTab === "profile"} onClick={() => changeTab("profile")} />
          <SettingsTabButton icon={KeyRound} label="Change Password" active={activeTab === "password"} onClick={() => changeTab("password")} />
          <SettingsTabButton icon={Settings2} label="Preferences" active={activeTab === "preferences"} onClick={() => changeTab("preferences")} />
        </div>
      </section>

      {!loading && activeTab === "profile" ? (
        <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <CompactPanel title="Profile Photo">
            <div className="grid justify-items-center gap-3 rounded-lg border border-[#EDF3F1] bg-[#FBFDFC] p-5 text-center">
              {user?.profile_photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile_photo} alt={user.full_name} className="h-24 w-24 rounded-full object-cover ring-2 ring-[#CFE8DF]" />
              ) : (
                <span className="grid h-24 w-24 place-items-center rounded-full bg-[#E8F6F0] text-2xl font-black text-[#0B7A5A] ring-2 ring-[#CFE8DF]">{initialsFor(user?.full_name, user?.email)}</span>
              )}
              <div>
                <p className="text-sm font-black text-[#071B4A]">{user?.full_name ?? "Branch Admin"}</p>
                <p className="mt-1 text-xs font-bold text-[#64748B]">{formatSettingValue(branchRows[0][1] ?? branch.branch_name)}</p>
              </div>
            </div>
          </CompactPanel>
          <div className="grid gap-4">
            <ProfileSection title="Personal Details" rows={profileRows} />
            <ProfileSection title="Branch/Admin Details" rows={branchRows} />
            <ProfileSection title="Contact Details" rows={contactRows} />
          </div>
        </section>
      ) : null}

      {!loading && activeTab === "password" ? (
        <section className="rounded-lg border border-[#E3ECE8] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
          <h3 className="text-base font-black text-[#071B4A]">Change Password</h3>
          <div className="mt-4 grid gap-3 md:max-w-xl">
            <TextField label="Current Password" type="password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} />
            <TextField label="New Password" type="password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} />
            <TextField label="Confirm Password" type="password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} />
            <div className="flex justify-end">
              <button type="button" onClick={() => void savePassword()} disabled={savingPassword} className="h-10 rounded-lg bg-[#0B7A5A] px-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60">{savingPassword ? "Saving..." : "Save Password"}</button>
            </div>
          </div>
        </section>
      ) : null}

      {!loading && activeTab === "preferences" ? (
        <BranchAdminAccountPreferences preferences={preferences} saving={savingPreferences} onSave={saveAccountPreferences} />
      ) : null}
      {toast ? <Toast message={toast} /> : null}
    </div>
  )
}

function SettingsTabButton({ icon: Icon, label, active, onClick }: { icon: typeof Users; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition ${active ? "bg-[#0B7A5A] text-white shadow-[0_8px_18px_rgba(11,122,90,0.2)]" : "bg-[#FBFDFC] text-[#071B4A] hover:bg-[#E8F6F0] hover:text-[#0B7A5A]"}`}>
      <Icon size={17} />
      {label}
    </button>
  )
}

function ProfileSection({ title, rows }: { title: string; rows: Array<[string, unknown]> }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <h3 className="text-sm font-black text-[#071B4A]">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg border border-[#EDF3F1] bg-[#FBFDFC] p-3">
            <p className="text-[11px] font-black uppercase text-[#64748B]">{label}</p>
            <p className="mt-1 truncate text-sm font-black text-[#071B4A]">{formatSettingValue(value)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function BranchAdminAccountPreferences({ preferences, saving, onSave }: { preferences: Record<string, string>; saving: boolean; onSave: (preferences: Record<string, string>) => Promise<void> }) {
  const [form, setForm] = useState(preferences)

  useEffect(() => {
    setForm(preferences)
  }, [preferences])

  function updatePreference(key: string, value: string) {
    const next = { ...form, [key]: value }
    setForm(next)
    storeBranchAdminPreferences(next)
    if (key === "theme_preference") void onSave(next)
  }

  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <h3 className="text-base font-black text-[#071B4A]">Preferences</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SelectField label="Theme Preference" value={form.theme_preference} options={["Light", "Dark", "System"]} onChange={(value) => updatePreference("theme_preference", value)} />
        <SelectField label="Dashboard Preference" value={form.dashboard_preference} options={["Compact", "Detailed", "Analytics Focus"]} onChange={(value) => updatePreference("dashboard_preference", value)} />
        <SelectField label="Notification Preference" value={form.notification_preference} options={["Email", "In-app", "Both", "None"]} onChange={(value) => updatePreference("notification_preference", value)} />
        <SelectField label="Language Preference" value={form.language_preference} options={["English"]} onChange={(value) => updatePreference("language_preference", value)} />
      </div>
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={() => void onSave(form)} disabled={saving} className="h-10 rounded-lg bg-[#0B7A5A] px-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60">{saving ? "Saving..." : "Save Preferences"}</button>
      </div>
    </section>
  )
}

function initialsFor(name?: string | null, email?: string | null) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase()
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (email ?? "BA").slice(0, 2).toUpperCase()
}

function formatSettingValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "-"
  if (typeof value === "string") {
    const date = new Date(value)
    return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : value
  }
  return String(value)
}

function PageHeader({ title, subtitle, action, onAction }: { title: string; subtitle: string; action: string; onAction?: () => void }) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black tracking-normal text-[#020617] sm:text-3xl">{title}</h2>
        <p className="mt-1.5 text-sm font-semibold text-[#475569]">{subtitle}</p>
      </div>
      <button type="button" onClick={onAction} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0B7A5A] px-4 text-sm font-black text-white shadow-[0_8px_18px_rgba(11,122,90,0.24)]">
        <Plus size={17} />
        {action}
      </button>
    </section>
  )
}

function ApiState({ loading, error }: { loading: boolean; error: string }) {
  if (error) {
    return <div className="rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3 text-xs font-bold text-[#9A3412]">{error}</div>
  }
  if (loading) {
    return <div className="rounded-lg border border-[#DDE9E4] bg-white px-4 py-3 text-sm font-black text-[#64748B]">Loading live data...</div>
  }
  return null
}

function EmptyTableRow({ columns, label }: { columns: number; label: string }) {
  return (
    <tr>
      <td colSpan={columns} className="px-3 py-8 text-center text-sm font-bold text-[#64748B]">{label}</td>
    </tr>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <div className="rounded-lg border border-[#CFE8DF] bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase text-[#64748B]">{label}</p>
          <p className="mt-2 text-2xl font-black text-[#020617]">{value}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F6F0] text-[#0B7A5A]">
          <Icon size={19} />
        </span>
      </div>
    </div>
  )
}

function DataPanel({ title, headings, children }: { title: string; headings: string[]; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E3ECE8] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <div className="border-b border-[#E3ECE8] p-4">
        <h3 className="text-sm font-black text-[#071B4A]">{title}</h3>
      </div>
      <div className="overflow-hidden">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="bg-[#F8FAF8] text-xs uppercase text-[#475569]">
            <tr>{headings.map((heading) => <th key={heading} className="px-3 py-3 font-black">{heading}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  )
}

function CompactPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)]">
      <h3 className="mb-3 text-sm font-black text-[#071B4A]">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  )
}

function QuickStrip({ actions, onAction }: { actions: string[]; onAction?: (action: string) => void }) {
  return (
    <section className="grid gap-2 rounded-lg border border-[#E3ECE8] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.055)] sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <button key={action} type="button" onClick={() => onAction?.(action)} className="h-10 rounded-lg border border-[#DDE9E4] bg-[#FBFDFC] px-3 text-xs font-black text-[#071B4A] transition hover:border-[#0B7A5A] hover:bg-white">
          {action}
        </button>
      ))}
    </section>
  )
}

function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#020617]/35 p-4">
      <section className={`max-h-[90vh] w-full overflow-y-auto rounded-lg border border-[#E3ECE8] bg-white p-5 shadow-2xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-[#071B4A]">{title}</h3>
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-[#DDE9E4] px-3 text-xs font-black text-[#071B4A]">Close</button>
        </div>
        {children}
      </section>
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return <div className="fixed bottom-5 right-5 z-[60] rounded-lg bg-[#0B7A5A] px-4 py-3 text-sm font-black text-white shadow-xl">{message}</div>
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-black uppercase text-[#64748B]">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-lg border border-[#DDE9E4] bg-[#FBFDFC] px-3 text-sm font-semibold normal-case text-[#0F172A] outline-none focus:border-[#0B7A5A]" />
    </label>
  )
}

function SelectField({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <BranchAdminSelect
      label={label}
      value={value}
      onChange={onChange}
      placeholder="Select"
      options={options.map((option, index) => ({ label: labels?.[option] ?? option, value: option || `option-${index}` }))}
    />
  )
}

function BatchFormModal({ title, courses, trainers, modes, onClose, onSave }: { title: string; courses: CourseOption[]; trainers: TrainerOption[]; modes: ModeOption[]; onClose: () => void; onSave: (payload: Partial<BatchRecord>) => Promise<void> }) {
  const [form, setForm] = useState({ batch_name: "", course_id: courses[0]?.id ?? "", course: courses[0]?.title ?? "", trainer_id: trainers[0]?.id ?? "", trainer: trainers[0]?.full_name ?? "", capacity: "30", schedule: "", mode: modes[0]?.value ?? "Offline" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  async function save() {
    setSaving(true)
    setError("")
    try {
      await onSave({ ...form, capacity: Number(form.capacity) })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save batch")
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-3">
        <TextField label="Batch Name" value={form.batch_name} onChange={(value) => setForm({ ...form, batch_name: value })} />
        <SelectField label="Course" value={form.course_id} options={courses.map((item) => item.id)} labels={Object.fromEntries(courses.map((item) => [item.id, item.label]))} onChange={(value) => { const course = courses.find((item) => item.id === value); setForm({ ...form, course_id: value, course: course?.title ?? "" }) }} />
        <SelectField label="Trainer" value={form.trainer_id} options={trainers.map((item) => item.id)} labels={Object.fromEntries(trainers.map((item) => [item.id, item.label]))} onChange={(value) => { const trainer = trainers.find((item) => item.id === value); setForm({ ...form, trainer_id: value, trainer: trainer?.full_name ?? "" }) }} />
        <TextField label="Capacity" type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} />
        <TextField label="Schedule" value={form.schedule} onChange={(value) => setForm({ ...form, schedule: value })} />
        <SelectField label="Mode" value={form.mode} options={(modes.length ? modes.map((item) => item.value) : ["Online", "Offline", "Hybrid"])} labels={Object.fromEntries(modes.map((item) => [item.value, item.label]))} onChange={(value) => setForm({ ...form, mode: value })} />
        {error ? <p className="text-xs font-bold text-[#9A3412]">{error}</p> : null}
        <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!form.batch_name} />
      </div>
    </Modal>
  )
}

function BatchEditModal({ batches, courses, trainers, modes, onClose, onSave }: { batches: BatchRecord[]; courses: CourseOption[]; trainers: TrainerOption[]; modes: ModeOption[]; onClose: () => void; onSave: (batchName: string, payload: Partial<BatchRecord>) => Promise<void> }) {
  const [selected, setSelected] = useState(batches[0]?.batch_name ?? "")
  const batch = batches.find((item) => item.batch_name === selected)
  const [courseId, setCourseId] = useState(batch?.course_id ?? courses[0]?.id ?? "")
  const [trainerId, setTrainerId] = useState(trainers.find((item) => item.full_name === batch?.trainer)?.id ?? trainers[0]?.id ?? "")
  const [capacity, setCapacity] = useState(String(batch?.capacity ?? 30))
  const [schedule, setSchedule] = useState(batch?.schedule ?? "")
  const [mode, setMode] = useState(batch?.mode ?? "Offline")
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      const course = courses.find((item) => item.id === courseId)
      const trainer = trainers.find((item) => item.id === trainerId)
      await onSave(selected, { batch_name: selected, course_id: courseId, course: course?.title, trainer_id: trainerId, trainer: trainer?.full_name, capacity: Number(capacity), schedule, mode })
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal title="Edit Batch" onClose={onClose}>
      <div className="grid gap-3">
        <SelectField label="Batch" value={selected} options={batches.map((item) => item.batch_name)} onChange={setSelected} />
        <SelectField label="Course" value={courseId} options={courses.map((item) => item.id)} labels={Object.fromEntries(courses.map((item) => [item.id, item.label]))} onChange={setCourseId} />
        <SelectField label="Trainer" value={trainerId} options={trainers.map((item) => item.id)} labels={Object.fromEntries(trainers.map((item) => [item.id, item.label]))} onChange={setTrainerId} />
        <TextField label="Capacity" type="number" value={capacity} onChange={setCapacity} />
        <TextField label="Schedule" value={schedule} onChange={setSchedule} />
        <SelectField label="Mode" value={mode} options={(modes.length ? modes.map((item) => item.value) : ["Online", "Offline", "Hybrid"])} labels={Object.fromEntries(modes.map((item) => [item.value, item.label]))} onChange={setMode} />
        <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!selected} />
      </div>
    </Modal>
  )
}

function AssignTrainerModal({ batches, trainers, onClose, onSave }: { batches: BatchRecord[]; trainers: TrainerOption[]; onClose: () => void; onSave: (payload: Record<string, string>) => Promise<void> }) {
  const [batch, setBatch] = useState(batches[0]?.batch_name ?? "")
  const [trainerId, setTrainerId] = useState(trainers[0]?.id ?? "")
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      const trainer = trainers.find((item) => item.id === trainerId)
      await onSave({ batch_name: batch, trainer_id: trainerId, trainer: trainer?.full_name ?? "" })
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal title="Assign Trainer" onClose={onClose}>
      <div className="grid gap-3">
        <SelectField label="Batch" value={batch} options={batches.map((item) => item.batch_name)} onChange={setBatch} />
        <SelectField label="Trainer" value={trainerId} options={trainers.map((item) => item.id)} labels={Object.fromEntries(trainers.map((item) => [item.id, item.label]))} onChange={setTrainerId} />
        <p className="text-xs font-bold text-[#64748B]">{trainers.find((item) => item.id === trainerId)?.full_name ?? "Select a trainer"}</p>
        <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!batch || !trainerId} />
      </div>
    </Modal>
  )
}

function TransferStudentModal({ batches, students, onClose, onSave }: { batches: BatchRecord[]; students: StudentRecord[]; onClose: () => void; onSave: (source: string, payload: Record<string, string>) => Promise<void> }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "")
  const student = students.find((item) => item.id === studentId)
  const [source, setSource] = useState(student?.batch_name ?? batches[0]?.batch_name ?? "")
  const [target, setTarget] = useState(batches[0]?.batch_name ?? "")
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      await onSave(source, { student_id: studentId, target_batch: target })
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal title="Transfer Students" onClose={onClose}>
      <div className="grid gap-3">
        <SelectField label="Student" value={studentId} options={students.map((item) => item.id)} onChange={(value) => { setStudentId(value); setSource(students.find((item) => item.id === value)?.batch_name ?? "") }} />
        <p className="text-xs font-bold text-[#64748B]">{student?.full_name ?? "Select a student"}</p>
        <SelectField label="Source Batch" value={source} options={batches.map((item) => item.batch_name)} onChange={setSource} />
        <SelectField label="Target Batch" value={target} options={batches.map((item) => item.batch_name)} onChange={setTarget} />
        <ModalActions onClose={onClose} onSave={save} saving={saving} disabled={!studentId || !source || !target} />
      </div>
    </Modal>
  )
}

function PreferencesModal({ title, fields, onClose, onSave }: { title: string; fields: Array<[string, string]>; onClose: () => void; onSave: (preferences: Record<string, string>) => Promise<void> }) {
  const [form, setForm] = useState(Object.fromEntries(fields))
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal title={title} onClose={onClose}>
      <div className="grid gap-3">
        {Object.entries(form).map(([key, value]) => <TextField key={key} label={key.replace(/_/g, " ")} value={value} onChange={(next) => setForm({ ...form, [key]: next })} />)}
        <ModalActions onClose={onClose} onSave={save} saving={saving} />
      </div>
    </Modal>
  )
}

function UserAccessModal({ users, onClose, onToggle }: { users: BranchUserRecord[]; onClose: () => void; onToggle: (user: BranchUserRecord) => Promise<void> }) {
  return (
    <Modal title="Review User Access" onClose={onClose}>
      <div className="grid gap-2">
        {users.map((user) => (
          <div key={`${user.source}-${user.id}`} className="grid grid-cols-[1fr_140px_90px_110px] items-center gap-2 rounded-lg border border-[#EDF3F1] p-3 text-sm">
            <span className="font-black text-[#071B4A]">{user.full_name}</span>
            <span className="font-semibold text-[#475569]">{user.role_label}</span>
            <Badge label={user.status} />
            <button type="button" onClick={() => onToggle(user)} className="h-8 rounded-lg border border-[#DDE9E4] px-2 text-xs font-black text-[#071B4A]">{user.is_active ? "Deactivate" : "Activate"}</button>
          </div>
        ))}
      </div>
    </Modal>
  )
}

function ModalActions({ onClose, onSave, saving, disabled = false }: { onClose: () => void; onSave: () => void; saving: boolean; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onClose} className="h-10 rounded-lg border border-[#DDE9E4] px-4 text-sm font-black text-[#071B4A]">Cancel</button>
      <button type="button" onClick={onSave} disabled={saving || disabled} className="h-10 rounded-lg bg-[#0B7A5A] px-4 text-sm font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
    </div>
  )
}

function ListBlock({ title, rows }: { title: string; rows: string[] }) {
  return (
    <section className="rounded-lg border border-[#EDF3F1] p-3">
      <h4 className="mb-2 text-xs font-black uppercase text-[#0B7A5A]">{title}</h4>
      <div className="grid gap-1 text-sm font-bold text-[#475569]">{rows.length ? rows.map((row) => <p key={row}>{row}</p>) : <p>No records.</p>}</div>
    </section>
  )
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`).join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function SmallButton({ icon: Icon, label, onClick, disabled = false }: { icon: typeof FileText; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#DDE9E4] px-2 text-xs font-black text-[#071B4A] disabled:cursor-not-allowed disabled:opacity-55">
      <Icon size={14} className="text-[#0B7A5A]" />
      {label}
    </button>
  )
}

function Badge({ label }: { label: string }) {
  const style = label === "Paid" || label === "Active"
    ? "bg-[#E0F3E9] text-[#0B7A5A]"
    : label === "Overdue" || label === "Review"
      ? "bg-[#FFF0F0] text-[#EF4444]"
      : "bg-[#FFF0DC] text-[#F97316]"
  return <span className={`inline-flex rounded px-2 py-1 text-[11px] font-black ${style}`}>{label}</span>
}
