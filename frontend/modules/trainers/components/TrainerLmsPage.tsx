"use client"

import { BookOpen, Brain, FileText, Plus, RefreshCw } from "lucide-react"

import { useTrainerLms } from "../hooks/useTrainerLms"
import { TrainerCourseList } from "./TrainerCourseList"
import { TrainerLessonList } from "./TrainerLessonList"
import { TrainerLmsEmptyState } from "./TrainerLmsEmptyState"
import { TrainerMaterialUploadPanel } from "./TrainerMaterialUploadPanel"

function kpiValue(value: number | null | undefined, connected: boolean) {
  if (!connected) return "—"
  if (value === null || value === undefined) return "0"
  return String(value)
}

function KPICard({
  label,
  value,
  helper,
  tone,
  icon: Icon,
}: {
  label: string
  value: string
  helper: string
  tone: "green" | "blue" | "orange" | "purple"
  icon: typeof BookOpen
}) {
  const palette = {
    green: { bg: "#E8F6F0", text: "#0B7A5A", border: "#CFE8DF" },
    blue: { bg: "#EAF1FF", text: "#2563EB", border: "#D7E4FF" },
    orange: { bg: "#FFF3E8", text: "#F97316", border: "#FEDFC2" },
    purple: { bg: "#F3EAFE", text: "#7C3AED", border: "#E8D8FB" },
  } as const
  const p = palette[tone]

  return (
    <div
      className="min-h-[116px] rounded-lg border bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]"
      style={{ borderColor: p.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black text-[#475569]">{label}</h3>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: p.bg, color: p.text }}
        >
          <Icon size={17} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-black text-[#020617]">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#64748B]">{helper}</p>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>
        <div className="h-10 w-24 rounded bg-gray-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 rounded-lg border border-gray-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="h-80 rounded-lg border border-gray-200 bg-white" />
        <div className="h-80 rounded-lg border border-gray-200 bg-white" />
      </div>
    </div>
  )
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-[400px] place-items-center rounded-xl border border-dashed border-[#FCA5A5] bg-[#FEF2F2] p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE2E2] text-[#EF4444]">
          <span className="text-2xl font-black">!</span>
        </div>
        <h3 className="text-lg font-black text-[#991B1B]">Failed to load LMS</h3>
        <p className="text-sm font-semibold text-[#B91C1C]">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#EF4444] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#DC2626]"
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  )
}

export function TrainerLmsPage() {
  const {
    courses,
    selectedCourse,
    lessons,
    loading,
    lessonsLoading,
    error,
    data,
    refresh,
    selectCourse,
    editLesson,
    deleteLesson,
  } = useTrainerLms()

  const connected = data?.connected === true
  const summary = data?.summary
  const canCreate = data?.can_create_courses === true

  if (loading) return <PageSkeleton />
  if (error) return <ErrorBanner message={error} onRetry={refresh} />

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-normal text-[#020617] sm:text-3xl">LMS</h2>
          <p className="mt-1.5 text-sm font-semibold text-[#475569]">
            Manage trainer-owned courses, lessons, and learning materials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canCreate}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition ${
              canCreate
                ? "bg-[#0B7A5A] text-white shadow-sm hover:bg-[#096747]"
                : "border border-[#D0DFDA] bg-white text-[#64748B] opacity-60 cursor-not-allowed"
            }`}
          >
            <Plus size={14} />
            <span>Create Course</span>
          </button>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D0DFDA] bg-white px-4 text-sm font-black text-[#0B7A5A] transition hover:border-[#0B7A5A] hover:bg-[#E8F6F0] outline-none"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="My Courses"
          value={kpiValue(summary?.total_courses, connected)}
          helper="Trainer-owned course count"
          tone="green"
          icon={BookOpen}
        />
        <KPICard
          label="Total Lessons"
          value={kpiValue(summary?.total_lessons, connected)}
          helper="Lessons from trainer courses"
          tone="blue"
          icon={FileText}
        />
        <KPICard
          label="Uploaded Materials"
          value={kpiValue(summary?.total_materials, connected)}
          helper="Saved PDF and video links"
          tone="orange"
          icon={FileText}
        />
        <KPICard
          label="Quiz / AI Tools"
          value={kpiValue(summary?.quiz_tools, connected)}
          helper="Saved quizzes and tests"
          tone="purple"
          icon={Brain}
        />
      </section>

      {!connected && courses.length === 0 ? (
        <TrainerLmsEmptyState message="No trainer-owned courses found." />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <TrainerCourseList
              courses={courses}
              selectedCourseId={selectedCourse?.id ?? null}
              onSelectCourse={selectCourse}
              connected={connected}
            />
            <TrainerLessonList
              course={selectedCourse}
              lessons={lessons}
              loading={lessonsLoading}
              connected={connected}
              onEditLesson={editLesson}
              onDeleteLesson={deleteLesson}
            />
          </div>
          <TrainerMaterialUploadPanel
            course={selectedCourse}
            uploadApiConnected={data?.upload_api_connected === true}
            onUploaded={refresh}
          />
        </section>
      )}
    </div>
  )
}