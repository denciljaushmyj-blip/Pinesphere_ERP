"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  deleteTrainerLesson,
  getTrainerCourseLessons,
  getTrainerCourses,
  updateTrainerLesson,
} from "../services/trainerLmsService"
import type {
  TrainerLmsApiResponse,
  TrainerLmsCourse,
  TrainerLmsLesson,
  TrainerLmsLessonUpdate,
} from "../types"

export interface UseTrainerLmsResult {
  courses: TrainerLmsCourse[]
  selectedCourse: TrainerLmsCourse | null
  lessons: TrainerLmsLesson[]
  loading: boolean
  lessonsLoading: boolean
  error: string | null
  mutationError: string | null
  data: TrainerLmsApiResponse | null
  refresh: () => Promise<void>
  selectCourse: (courseId: string) => void
  editLesson: (courseId: string, lessonId: string, payload: TrainerLmsLessonUpdate) => Promise<void>
  deleteLesson: (courseId: string, lessonId: string) => Promise<void>
}

export function useTrainerLms(): UseTrainerLmsResult {
  const [data, setData] = useState<TrainerLmsApiResponse | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [lessons, setLessons] = useState<TrainerLmsLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const courses = data?.courses ?? []
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? courses[0] ?? null,
    [courses, selectedCourseId]
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = await getTrainerCourses()
      setData(payload)
      setSelectedCourseId((current) => {
        if (current && payload.courses.some((course) => course.id === current)) {
          return current
        }
        return payload.courses[0]?.id ?? null
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load Trainer LMS.")
    } finally {
      setLoading(false)
    }
  }, [])

  /** Reload only the lesson list for the given courseId. */
  const reloadLessons = useCallback(async (courseId: string) => {
    setLessonsLoading(true)
    try {
      const payload = await getTrainerCourseLessons(courseId)
      setLessons(payload)
    } catch (err: unknown) {
      setLessons([])
      setMutationError(err instanceof Error ? err.message : "Failed to reload lessons.")
    } finally {
      setLessonsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    let cancelled = false

    async function loadLessons(courseId: string) {
      setLessonsLoading(true)
      try {
        const payload = await getTrainerCourseLessons(courseId)
        if (!cancelled) setLessons(payload)
      } catch (err: unknown) {
        if (!cancelled) {
          setLessons([])
          setError(err instanceof Error ? err.message : "Failed to load course lessons.")
        }
      } finally {
        if (!cancelled) setLessonsLoading(false)
      }
    }

    if (selectedCourse?.id && data?.connected) {
      void loadLessons(selectedCourse.id)
    } else {
      setLessons([])
    }

    return () => {
      cancelled = true
    }
  }, [data?.connected, selectedCourse?.id])

  /**
   * PATCH the lesson, then refresh the lesson list for the owning course.
   * Throws on API error so the form can surface it inline.
   */
  const editLesson = useCallback(
    async (courseId: string, lessonId: string, payload: TrainerLmsLessonUpdate) => {
      setMutationError(null)
      try {
        await updateTrainerLesson(courseId, lessonId, payload)
        await reloadLessons(courseId)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update lesson."
        setMutationError(message)
        throw err // re-throw so the form can show the error
      }
    },
    [reloadLessons]
  )

  /**
   * DELETE the lesson, then refresh the lesson list for the owning course.
   * Throws on API error so the caller can handle it.
   */
  const deleteLesson = useCallback(
    async (courseId: string, lessonId: string) => {
      setMutationError(null)
      try {
        await deleteTrainerLesson(courseId, lessonId)
        await reloadLessons(courseId)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete lesson."
        setMutationError(message)
        throw err
      }
    },
    [reloadLessons]
  )

  return {
    courses,
    selectedCourse,
    lessons,
    loading,
    lessonsLoading,
    error,
    mutationError,
    data,
    refresh,
    selectCourse: setSelectedCourseId,
    editLesson,
    deleteLesson,
  }
}