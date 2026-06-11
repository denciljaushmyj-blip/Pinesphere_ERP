"use client"

import { FileUp, UploadCloud } from "lucide-react"
import { useState } from "react"

import { uploadTrainerMaterial } from "../services/trainerLmsService"
import type { TrainerLmsCourse } from "../types"

export function TrainerMaterialUploadPanel({
  course,
  uploadApiConnected,
  onUploaded,
}: {
  course: TrainerLmsCourse | null
  uploadApiConnected: boolean
  onUploaded: () => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const canUpload = Boolean(course && uploadApiConnected)

  async function handleUpload() {
    if (!course || !file || !canUpload) return
    setUploading(true)
    setMessage(null)
    try {
      await uploadTrainerMaterial(course.id, file)
      setFile(null)
      setMessage("Material uploaded. Refreshing LMS data.")
      await onUploaded()
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="rounded-lg border border-[#E3ECE8] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
      <div>
        <h3 className="text-lg font-black text-[#0F172A]">Materials</h3>
        <p className="mt-1 text-sm font-semibold text-[#64748B]">
          Video lessons and PDF attachments for the selected trainer-owned course.
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-[#C8DDD7] bg-[#F8FAF8] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F6F0] text-[#0B7A5A]">
            <UploadCloud size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#0F172A]">Upload PDF or video</p>
            <p className="mt-1 text-xs font-bold text-[#64748B]">
              {canUpload
                ? "Attach a PDF, MP4, WebM, or MOV file to this course."
                : "No upload storage is available for this course yet."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="application/pdf,video/mp4,video/webm,video/quicktime"
                disabled={!canUpload || uploading}
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="max-w-full text-xs font-bold text-[#475569] file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8F6F0] file:px-3 file:py-2 file:text-xs file:font-black file:text-[#0B7A5A] disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                disabled={!canUpload || !file || uploading}
                onClick={handleUpload}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B7A5A] px-3 text-xs font-black text-white transition hover:bg-[#09684D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileUp size={14} />
                <span>{uploading ? "Uploading..." : "Upload"}</span>
              </button>
            </div>
            {message ? <p className="mt-2 text-xs font-bold text-[#0B7A5A]">{message}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}