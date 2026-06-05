import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CatalogFilters } from '@/components/catalog/catalog-filters'
import { CourseBoard } from '@/components/catalog/course-board'
import { CourseStructurePanel } from '@/components/catalog/course-structure-panel'
import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import { LessonDialog, ModuleDialog } from '@/components/catalog/structure-dialogs'
import { Button } from '@/components/ui/button'
import type { Course, Lesson, Module } from '@/types/models'

export function CatalogLessonPage() {
  const {
    data,
    isSaving,
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useCatalogOutlet()

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [targetCourse, setTargetCourse] = useState<Course | null>(null)
  const [targetModule, setTargetModule] = useState<Module | null>(null)

  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all')
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

  const catalog = data!

  const filteredCourses = useMemo(() => {
    return catalog.courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        selectedCategoryId === 'all' || course.categoryId === selectedCategoryId
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [catalog.courses, search, selectedCategoryId, selectedLevel])

  useEffect(() => {
    if (filteredCourses.length === 0) {
      setSelectedCourseId(null)
      return
    }

    setSelectedCourseId((current) => {
      if (current && filteredCourses.some((course) => course.id === current)) {
        return current
      }
      return filteredCourses[0]?.id ?? null
    })
  }, [filteredCourses])

  const selectedCourse = filteredCourses.find((course) => course.id === selectedCourseId) ?? null

  const nextModuleOrder = selectedCourse
    ? catalog.modules.filter((module) => module.courseId === selectedCourse.id).length + 1
    : 1

  const nextLessonOrder = targetModule
    ? catalog.lessons.filter((lesson) => lesson.moduleId === targetModule.id).length + 1
    : 1

  async function handleDeleteModule(module: Module) {
    if (!window.confirm(`Deseja remover o modulo "${module.title}" e suas aulas?`)) {
      return
    }

    await deleteModule(module.id)
  }

  async function handleDeleteLesson(lesson: Lesson) {
    if (!window.confirm(`Deseja remover a aula "${lesson.title}"?`)) {
      return
    }

    await deleteLesson(lesson.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Aulas e estrutura</h3>
          <p className="mt-1 text-sm text-slate-500">
            Escolha um curso e organize modulos e aulas sem misturar isso com a gestao dos cursos.
          </p>
        </div>
        <Button
          disabled={!selectedCourse}
          onClick={() => {
            if (!selectedCourse) return
            setTargetCourse(selectedCourse)
            setEditingModule(null)
            setModuleDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo modulo
        </Button>
      </div>

      <CatalogFilters
        categories={catalog.categories}
        search={search}
        selectedCategoryId={selectedCategoryId}
        selectedLevel={selectedLevel}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategoryId}
        onLevelChange={setSelectedLevel}
      />

      <div className="grid grid-cols-[1.05fr_1.15fr] gap-6">
        <CourseBoard
          data={catalog}
          courses={filteredCourses}
          selectedCategoryId={selectedCategoryId}
          selectedCourseId={selectedCourseId}
          onSelect={(course) => setSelectedCourseId(course.id)}
        />

        <CourseStructurePanel
          data={catalog}
          course={selectedCourse}
          onCreateModule={(course) => {
            setTargetCourse(course)
            setEditingModule(null)
            setModuleDialogOpen(true)
          }}
          onEditModule={(module) => {
            const course = catalog.courses.find((item) => item.id === module.courseId) ?? null
            setTargetCourse(course)
            setEditingModule(module)
            setModuleDialogOpen(true)
          }}
          onDeleteModule={(module) => {
            void handleDeleteModule(module)
          }}
          onCreateLesson={(module) => {
            setTargetModule(module)
            setEditingLesson(null)
            setLessonDialogOpen(true)
          }}
          onEditLesson={(lesson) => {
            const module = catalog.modules.find((item) => item.id === lesson.moduleId) ?? null
            setTargetModule(module)
            setEditingLesson(lesson)
            setLessonDialogOpen(true)
          }}
          onDeleteLesson={(lesson) => {
            void handleDeleteLesson(lesson)
          }}
        />
      </div>

      <ModuleDialog
        open={moduleDialogOpen}
        initialValue={editingModule}
        courseId={targetCourse?.id ?? selectedCourse?.id ?? 0}
        nextOrder={nextModuleOrder}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setModuleDialogOpen(open)
          if (!open) {
            setEditingModule(null)
            setTargetCourse(null)
          }
        }}
        onSubmit={async (payload) => {
          if (editingModule) {
            await updateModule(editingModule.id, payload)
          } else {
            await createModule(payload)
          }
          setModuleDialogOpen(false)
          setEditingModule(null)
          setTargetCourse(null)
        }}
      />

      <LessonDialog
        open={lessonDialogOpen}
        initialValue={editingLesson}
        moduleId={targetModule?.id ?? 0}
        nextOrder={nextLessonOrder}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setLessonDialogOpen(open)
          if (!open) {
            setEditingLesson(null)
            setTargetModule(null)
          }
        }}
        onSubmit={async (payload) => {
          if (editingLesson) {
            await updateLesson(editingLesson.id, payload)
          } else {
            await createLesson(payload)
          }
          setLessonDialogOpen(false)
          setEditingLesson(null)
          setTargetModule(null)
        }}
      />
    </div>
  )
}
