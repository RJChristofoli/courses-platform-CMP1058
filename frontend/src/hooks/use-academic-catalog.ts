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
  reorderLessons as reorderCatalogLessons,
  reorderModules as reorderCatalogModules,
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
    } catch (cause) {
      setState({
        data: null,
        isLoading: false,
        isSaving: false,
        error: cause instanceof Error ? cause.message : 'Nao foi possivel carregar o modulo academico.',
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
      } catch (cause) {
        setState((current) => ({
          ...current,
          isSaving: false,
          error: cause instanceof Error ? cause.message : 'Nao foi possivel salvar as alteracoes do catalogo.',
        }))
        throw cause
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
    deleteCourse: (courseId: number) => execute(() => deleteCourse(courseId)),
    createModule: (payload: ModulePayload) => execute(() => createModule(payload)),
    updateModule: (moduleId: number, payload: ModulePayload) => execute(() => updateModule(moduleId, payload)),
    deleteModule: (moduleId: number) => execute(() => deleteModule(moduleId)),
    createLesson: (payload: LessonPayload) => execute(() => createLesson(payload)),
    updateLesson: (lessonId: number, payload: LessonPayload) => execute(() => updateLesson(lessonId, payload)),
    deleteLesson: (lessonId: number) => execute(() => deleteLesson(lessonId)),
    reorderModules: (courseId: number, orderedModuleIds: number[]) =>
      execute(async () => {
        await reorderCatalogModules(courseId, orderedModuleIds)
      }),
    reorderLessons: (
      _courseId: number,
      updates: Array<{ id: number; moduleId: number; order: number }>,
    ) =>
      execute(async () => {
        await reorderCatalogLessons(_courseId, updates)
      }),
    createTrack: (payload: TrackPayload) => execute(() => createTrack(payload)),
    updateTrack: (trackId: number, payload: TrackPayload) => execute(() => updateTrack(trackId, payload)),
    deleteTrack: (trackId: number) => execute(() => deleteTrack(trackId)),
  }
}
