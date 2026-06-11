"use client"

import { useCallback, useEffect, useState } from "react"

import {
  deleteTrainerLesson,
  getTrainerCourseDetail,
  getTrainerCourseLessons,
  updateTrainerCourseStatus,
  updateTrainerLesson,
} from "../services/trainerLmsService"
import type {
  TrainerLmsCourse,
  TrainerLmsCourseUpdate,
  TrainerLmsLesson,
  TrainerLmsLessonUpdate,
} from "../types"

export interface UseTrainerLmsCourseResult {
  /** The resolved course for this courseId, or null while loading / not found. */
  course: TrainerLmsCourse | null
  lessons: TrainerLmsLesson[]
  /** True during the initial course + lesson fetch. */
  loading: boolean
  /** True only while the lesson list is being re-fetched after a mutation. */
  lessonsLoading: boolean
  /** True while the publish/unpublish PATCH is in-flight. */
  statusUpdating: boolean
  /** Page-level fetch error (course not found, network, auth). */
  error: string | null
  /** Mutation-level error (edit / delete / status update failed). Does not replace the page. */
  mutationError: string | null
  /** Whether the LMS API is connected (gates edit / delete actions). */
  connected: boolean
  /** Whether the upload API is connected (passed to TrainerMaterialUploadPanel). */
  uploadApiConnected: boolean
  /** Refetch both course and lessons from scratch. */
  refresh: () => Promise<void>
  editLesson: (courseId: string, lessonId: string, payload: TrainerLmsLessonUpdate) => Promise<void>
  deleteLesson: (courseId: string, lessonId: string) => Promise<void>
  /** PATCH course status to "draft" or "published". Re-throws on failure. */
  updateCourseStatus: (payload: TrainerLmsCourseUpdate) => Promise<void>
}

/**
 * Drives TrainerLmsCourseDetailPage.
 *
 * Fetches the full course list (reusing getTrainerCourses, which is the only
 * available course-level endpoint), finds the matching course by courseId, then
 * fetches its lessons. Exposes the same editLesson / deleteLesson signatures as
 * useTrainerLms so TrainerLessonList can be reused without prop changes.
 */
export function useTrainerLmsCourse(courseId: string): UseTrainerLmsCourseResult {
  const [course, setCourse] = useState<TrainerLmsCourse | null>(null)
  const [lessons, setLessons] = useState<TrainerLmsLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  /** Reload only the lesson list; used after a successful mutation. */
  const reloadLessons = useCallback(async (id: string) => {
    setLessonsLoading(true)
    try {
      const payload = await getTrainerCourseLessons(id)
      setLessons(payload)
    } catch (err: unknown) {
      setLessons([])
      setMutationError(err instanceof Error ? err.message : "Failed to reload lessons.")
    } finally {
      setLessonsLoading(false)
    }
  }, [])

  /** Full refresh — re-fetches course detail and lessons. */
  const refresh = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    setError(null)
    setMutationError(null)
    try {
      const course = await getTrainerCourseDetail(courseId)
      setCourse(course)
      setConnected(true)

      const lessonPayload = await getTrainerCourseLessons(courseId)
      setLessons(lessonPayload)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load course.")
      setCourse(null)
      setLessons([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  // Initial load
  useEffect(() => {
    void refresh()
  }, [refresh])

  /**
   * PATCH the lesson, then reload the lesson list.
   * Re-throws so TrainerLessonForm can show the error inline.
   */
  const editLesson = useCallback(
    async (cId: string, lessonId: string, payload: TrainerLmsLessonUpdate) => {
      setMutationError(null)
      try {
        await updateTrainerLesson(cId, lessonId, payload)
        await reloadLessons(cId)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update lesson."
        setMutationError(message)
        throw err
      }
    },
    [reloadLessons]
  )

  /**
   * DELETE the lesson, then reload the lesson list.
   * Re-throws so TrainerLessonList can handle it.
   */
  const deleteLesson = useCallback(
    async (cId: string, lessonId: string) => {
      setMutationError(null)
      try {
        await deleteTrainerLesson(cId, lessonId)
        await reloadLessons(cId)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete lesson."
        setMutationError(message)
        throw err
      }
    },
    [reloadLessons]
  )

  /**
   * PATCH the course status to "draft" or "published".
   * Optimistically updates local state, then re-fetches to stay in sync.
   * Re-throws so TrainerLmsCourseDetailPage can react to failure.
   */
  const updateCourseStatus = useCallback(
    async (payload: TrainerLmsCourseUpdate) => {
      if (!courseId) return
      setStatusUpdating(true)
      setMutationError(null)
      try {
        const updated = await updateTrainerCourseStatus(courseId, payload)
        // Apply optimistic update immediately so the badge flips without waiting
        // for the full refresh round-trip.
        setCourse(updated)
        // Then re-fetch in the background to sync counts and any other fields.
        await refresh()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update course status."
        setMutationError(message)
        throw err
      } finally {
        setStatusUpdating(false)
      }
    },
    [courseId, refresh]
  )

  // Derived: upload capability comes from the course record itself.
  const uploadApiConnected = course?.can_upload_materials === true

  return {
    course,
    lessons,
    loading,
    lessonsLoading,
    statusUpdating,
    error,
    mutationError,
    connected,
    uploadApiConnected,
    refresh,
    editLesson,
    deleteLesson,
    updateCourseStatus,
  }
}