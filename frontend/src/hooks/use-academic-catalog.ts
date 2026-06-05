import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  createCourse,
  createLesson,
  createModule,
  createTrack,
  deleteCategory,
  deleteCourse,
  deleteLesson,
  deleteModule,
  deleteTrack,
  getAcademicCatalogData,
  removeCourseRelations,
  removeLessonsByModule,
  removeModulesByCourse,
  updateCategory,
  updateCourse,
  updateLesson,
  updateModule,
  updateTrack,
} from '@/services/api'
import type {
  AcademicCatalogData,
  CategoryPayload,
  CoursePayload,
  LessonPayload,
  ModulePayload,
  TrackPayload,
} from '@/types/models'

interface AcademicCatalogState {
  data: AcademicCatalogData | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export function useAcademicCatalog() {
  const [state, setState] = useState<AcademicCatalogState>({
    data: null,
    isLoading: true,
    isSaving: false,
    error: null,
  })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }))

    try {
      const data = await getAcademicCatalogData()
      setState({ data, isLoading: false, isSaving: false, error: null })
    } catch {
      setState({
        data: null,
        isLoading: false,
        isSaving: false,
        error: 'Nao foi possivel carregar o modulo academico.',
      })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const execute = useCallback(
    async (operation: () => Promise<unknown>) => {
      setState((current) => ({ ...current, isSaving: true, error: null }))

      try {
        await operation()
        const data = await getAcademicCatalogData()
        setState({ data, isLoading: false, isSaving: false, error: null })
      } catch {
        setState((current) => ({
          ...current,
          isSaving: false,
          error: 'Nao foi possivel salvar as alteracoes do catalogo.',
        }))
        throw new Error('academic-catalog-save-failed')
      }
    },
    [],
  )

  return {
    ...state,
    reload: load,
    createCategory: (payload: CategoryPayload) => execute(() => createCategory(payload)),
    updateCategory: (categoryId: number, payload: CategoryPayload) => execute(() => updateCategory(categoryId, payload)),
    deleteCategory: (categoryId: number) => execute(() => deleteCategory(categoryId)),
    createCourse: (payload: CoursePayload) => execute(() => createCourse(payload)),
    updateCourse: (courseId: number, payload: CoursePayload) => execute(() => updateCourse(courseId, payload)),
    deleteCourse: (courseId: number) =>
      execute(async () => {
        await removeCourseRelations(courseId)
        await removeModulesByCourse(courseId)
        await deleteCourse(courseId)
      }),
    createModule: (payload: ModulePayload) => execute(() => createModule(payload)),
    updateModule: (moduleId: number, payload: ModulePayload) => execute(() => updateModule(moduleId, payload)),
    deleteModule: (moduleId: number) =>
      execute(async () => {
        await removeLessonsByModule(moduleId)
        await deleteModule(moduleId)
      }),
    createLesson: (payload: LessonPayload) => execute(() => createLesson(payload)),
    updateLesson: (lessonId: number, payload: LessonPayload) => execute(() => updateLesson(lessonId, payload)),
    deleteLesson: (lessonId: number) => execute(() => deleteLesson(lessonId)),
    reorderModules: (courseId: number, orderedModuleIds: number[]) =>
      execute(async () => {
        const data = state.data
        if (!data) return
        const modules = data.modules.filter((module) => module.courseId === courseId)
        await Promise.all(
          orderedModuleIds.map((moduleId, index) => {
            const module = modules.find((item) => item.id === moduleId)
            if (!module) return Promise.resolve()
            return updateModule(module.id, { courseId, title: module.title, order: index + 1 })
          }),
        )
      }),
    reorderLessons: (
      _courseId: number,
      updates: Array<{ id: number; moduleId: number; order: number }>,
    ) =>
      execute(async () => {
        const data = state.data
        if (!data) return
        await Promise.all(
          updates.map((update) => {
            const lesson = data.lessons.find((item) => item.id === update.id)
            if (!lesson) return Promise.resolve()
            return updateLesson(update.id, {
              moduleId: update.moduleId,
              title: lesson.title,
              contentType: lesson.contentType,
              contentUrl: lesson.contentUrl,
              durationMinutes: lesson.durationMinutes,
              order: update.order,
            })
          }),
        )
      }),
    createTrack: (payload: TrackPayload) => execute(() => createTrack(payload)),
    updateTrack: (trackId: number, payload: TrackPayload) => execute(() => updateTrack(trackId, payload)),
    deleteTrack: (trackId: number) => execute(() => deleteTrack(trackId)),
  }
}
