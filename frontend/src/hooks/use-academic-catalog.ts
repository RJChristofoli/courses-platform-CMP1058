import { useCallback, useEffect, useState } from 'react'
import {
  createCategory,
  createCourse,
  createTrack,
  deleteCategory,
  deleteCourse,
  deleteTrack,
  getAcademicCatalogData,
  removeCourseRelations,
  updateCategory,
  updateCourse,
  updateTrack,
} from '@/services/api'
import type {
  AcademicCatalogData,
  CategoryPayload,
  CoursePayload,
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
    updateCategory: (categoryId: number, payload: CategoryPayload) =>
      execute(() => updateCategory(categoryId, payload)),
    deleteCategory: (categoryId: number) => execute(() => deleteCategory(categoryId)),
    createCourse: (payload: CoursePayload) => execute(() => createCourse(payload)),
    updateCourse: (courseId: number, payload: CoursePayload) =>
      execute(() => updateCourse(courseId, payload)),
    deleteCourse: (courseId: number) =>
      execute(async () => {
        await removeCourseRelations(courseId)
        await deleteCourse(courseId)
      }),
    createTrack: (payload: TrackPayload) => execute(() => createTrack(payload)),
    updateTrack: (trackId: number, payload: TrackPayload) =>
      execute(() => updateTrack(trackId, payload)),
    deleteTrack: (trackId: number) => execute(() => deleteTrack(trackId)),
  }
}
