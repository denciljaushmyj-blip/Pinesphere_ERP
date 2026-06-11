"use client"

import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { TrainerLmsLesson, TrainerLmsLessonUpdate } from "../types"

const CONTENT_TYPES = [
  { value: "lesson", label: "Lesson" },
  { value: "assignment", label: "Assignment" },
  { value: "quiz_prep", label: "Quiz Prep" },
  { value: "project", label: "Project" },
]

interface FormState {
  title: string
  summary: string
  content_type: string
  video_url: string
  pdf_url: string
  assignment_url: string
  due_at: string
  max_marks: string
  sort_order: string
  is_preview: boolean
}

function toFormState(lesson: TrainerLmsLesson): FormState {
  return {
    title: lesson.title,
    summary: lesson.summary ?? "",
    content_type: lesson.content_type,
    video_url: lesson.video_url ?? "",
    pdf_url: lesson.pdf_url ?? "",
    assignment_url: lesson.assignment_url ?? "",
    // due_at comes as ISO string; datetime-local input wants "YYYY-MM-DDTHH:mm"
    due_at: lesson.due_at ? lesson.due_at.slice(0, 16) : "",
    max_marks: String(lesson.max_marks ?? 0),
    sort_order: String(lesson.sort_order ?? 1),
    is_preview: lesson.is_preview,
  }
}

function buildPayload(form: FormState, original: TrainerLmsLesson): TrainerLmsLessonUpdate {
  const patch: TrainerLmsLessonUpdate = {}

  const trimmed = form.title.trim()
  if (trimmed !== original.title) patch.title = trimmed

  const summary = form.summary.trim() || null
  if (summary !== original.summary) patch.summary = summary

  if (form.content_type !== original.content_type) patch.content_type = form.content_type

  const video_url = form.video_url.trim() || null
  if (video_url !== original.video_url) patch.video_url = video_url

  const pdf_url = form.pdf_url.trim() || null
  if (pdf_url !== original.pdf_url) patch.pdf_url = pdf_url

  const assignment_url = form.assignment_url.trim() || null
  if (assignment_url !== original.assignment_url) patch.assignment_url = assignment_url

  const due_at = form.due_at ? `${form.due_at}:00` : null
  if (due_at !== original.due_at) patch.due_at = due_at

  const max_marks = parseInt(form.max_marks, 10)
  if (!isNaN(max_marks) && max_marks !== original.max_marks) patch.max_marks = max_marks

  const sort_order = parseInt(form.sort_order, 10)
  if (!isNaN(sort_order) && sort_order !== original.sort_order) patch.sort_order = sort_order

  if (form.is_preview !== original.is_preview) patch.is_preview = form.is_preview

  return patch
}

interface LabeledFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  children: React.ReactNode
}

function LabeledField({ label, htmlFor, required, children }: LabeledFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-black text-[#475569]">
        {label}
        {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-semibold text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0B7A5A] focus:ring-2 focus:ring-[#0B7A5A]/15 disabled:opacity-50"

export function TrainerLessonForm({
  lesson,
  onSave,
  onClose,
}: {
  lesson: TrainerLmsLesson
  onSave: (lessonId: string, payload: TrainerLmsLessonUpdate) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(lesson))
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Reset form when the lesson prop changes (e.g. user picks a different lesson to edit)
  useEffect(() => {
    setForm(toFormState(lesson))
    setFormError(null)
  }, [lesson.id])

  // Focus title on open
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setFormError("Title is required.")
      titleRef.current?.focus()
      return
    }

    const payload = buildPayload(form, lesson)
    if (Object.keys(payload).length === 0) {
      onClose()
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      await onSave(lesson.id, payload)
      onClose()
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save lesson.")
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[#E3ECE8] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#E3ECE8] bg-white px-6 py-4">
          <div>
            <h2 className="text-base font-black text-[#0F172A]">Edit Lesson</h2>
            <p className="mt-0.5 text-xs font-semibold text-[#64748B] truncate max-w-xs">
              {lesson.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E3ECE8] text-[#64748B] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 px-6 py-5">
            {/* Title */}
            <LabeledField label="Title" htmlFor="lesson-title" required>
              <input
                ref={titleRef}
                id="lesson-title"
                type="text"
                className={inputClass}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Lesson title"
                disabled={saving}
                maxLength={255}
              />
            </LabeledField>

            {/* Content type */}
            <LabeledField label="Content Type" htmlFor="lesson-content-type">
              <select
                id="lesson-content-type"
                className={inputClass}
                value={form.content_type}
                onChange={(e) => set("content_type", e.target.value)}
                disabled={saving}
              >
                {CONTENT_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </LabeledField>

            {/* Summary */}
            <LabeledField label="Summary" htmlFor="lesson-summary">
              <textarea
                id="lesson-summary"
                className={`${inputClass} min-h-[80px] resize-y`}
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="Short description of this lesson"
                disabled={saving}
                rows={3}
              />
            </LabeledField>

            {/* Video URL */}
            <LabeledField label="Video URL" htmlFor="lesson-video-url">
              <input
                id="lesson-video-url"
                type="url"
                className={inputClass}
                value={form.video_url}
                onChange={(e) => set("video_url", e.target.value)}
                placeholder="https://…"
                disabled={saving}
              />
            </LabeledField>

            {/* PDF URL */}
            <LabeledField label="PDF URL" htmlFor="lesson-pdf-url">
              <input
                id="lesson-pdf-url"
                type="url"
                className={inputClass}
                value={form.pdf_url}
                onChange={(e) => set("pdf_url", e.target.value)}
                placeholder="https://…"
                disabled={saving}
              />
            </LabeledField>

            {/* Assignment URL */}
            <LabeledField label="Assignment URL" htmlFor="lesson-assignment-url">
              <input
                id="lesson-assignment-url"
                type="url"
                className={inputClass}
                value={form.assignment_url}
                onChange={(e) => set("assignment_url", e.target.value)}
                placeholder="https://…"
                disabled={saving}
              />
            </LabeledField>

            {/* Due at + Max marks row */}
            <div className="grid grid-cols-2 gap-4">
              <LabeledField label="Due Date" htmlFor="lesson-due-at">
                <input
                  id="lesson-due-at"
                  type="datetime-local"
                  className={inputClass}
                  value={form.due_at}
                  onChange={(e) => set("due_at", e.target.value)}
                  disabled={saving}
                />
              </LabeledField>
              <LabeledField label="Max Marks" htmlFor="lesson-max-marks">
                <input
                  id="lesson-max-marks"
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.max_marks}
                  onChange={(e) => set("max_marks", e.target.value)}
                  disabled={saving}
                />
              </LabeledField>
            </div>

            {/* Sort order + Preview row */}
            <div className="grid grid-cols-2 gap-4 items-end">
              <LabeledField label="Sort Order" htmlFor="lesson-sort-order">
                <input
                  id="lesson-sort-order"
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.sort_order}
                  onChange={(e) => set("sort_order", e.target.value)}
                  disabled={saving}
                />
              </LabeledField>
              {/* Is preview toggle */}
              <div className="flex items-center gap-2.5 pb-2">
                <button
                  id="lesson-is-preview"
                  type="button"
                  role="switch"
                  aria-checked={form.is_preview}
                  onClick={() => set("is_preview", !form.is_preview)}
                  disabled={saving}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B7A5A]/40 disabled:opacity-50 ${
                    form.is_preview ? "bg-[#0B7A5A]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                      form.is_preview ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <label
                  htmlFor="lesson-is-preview"
                  className="text-xs font-black text-[#475569] cursor-pointer select-none"
                  onClick={() => set("is_preview", !form.is_preview)}
                >
                  Preview lesson
                </label>
              </div>
            </div>

            {/* Error */}
            {formError && (
              <p className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-2.5 text-sm font-semibold text-[#B91C1C]">
                {formError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#E3ECE8] bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D0DFDA] bg-white px-4 text-sm font-black text-[#475569] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B7A5A] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#096747] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}