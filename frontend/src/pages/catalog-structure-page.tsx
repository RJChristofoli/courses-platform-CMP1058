import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import { StructureWorkspace } from '@/components/catalog/structure-workspace'
import type { Lesson, Module } from '@/types/models'

export function CatalogStructurePage() {
  const {
    data,
    updateCourse,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons,
  } = useCatalogOutlet()

  const catalog = data!

  async function handleDeleteModule(module: Module) {
    if (!window.confirm(`Deseja remover o módulo "${module.title}" e suas aulas?`)) return
    await deleteModule(module.id)
  }

  async function handleDeleteLesson(lesson: Lesson) {
    if (!window.confirm(`Deseja remover a aula "${lesson.title}"?`)) return
    await deleteLesson(lesson.id)
  }

  return (
    <StructureWorkspace
      data={catalog}
      onUpdateCourse={updateCourse}
      onCreateModule={createModule}
      onUpdateModule={updateModule}
      onDeleteModule={(module) => { void handleDeleteModule(module) }}
      onCreateLesson={createLesson}
      onUpdateLesson={updateLesson}
      onDeleteLesson={(lesson) => { void handleDeleteLesson(lesson) }}
      onReorderModules={reorderModules}
      onReorderLessons={reorderLessons}
    />
  )
}
