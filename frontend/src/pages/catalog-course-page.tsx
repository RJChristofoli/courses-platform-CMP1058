import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CourseBoard } from '@/components/catalog/course-board'
import { CourseDialog } from '@/components/catalog/catalog-dialogs'
import { CatalogFilters } from '@/components/catalog/catalog-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import type { Course } from '@/types/models'

export function CatalogCoursePage() {
  const { data, isSaving, createCourse, updateCourse, deleteCourse } = useCatalogOutlet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all')
  const [selectedLevel, setSelectedLevel] = useState<string | 'all'>('all')

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

  async function handleDelete(course: Course) {
    if (!window.confirm(`Deseja remover o curso "${course.title}"?`)) {
      return
    }

    await deleteCourse(course.id)
  }

  return (
    <div className="space-y-6">
      <CatalogFilters
        categories={catalog.categories}
        search={search}
        selectedCategoryId={selectedCategoryId}
        selectedLevel={selectedLevel}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategoryId}
        onLevelChange={setSelectedLevel}
      />

      <div className="grid grid-cols-[1.35fr_0.72fr] gap-6">
        <CourseBoard
          data={catalog}
          courses={filteredCourses}
          selectedCategoryId={selectedCategoryId}
          onEdit={(course) => {
            setEditingCourse(course)
            setDialogOpen(true)
          }}
          onDelete={(course) => {
            void handleDelete(course)
          }}
        />

        <Card className="sticky top-4 h-fit">
          <CardHeader>
            <CardTitle>Gestao de cursos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Cadastre a vitrine academica com instrutor, nivel, carga horaria e categoria correta.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                setEditingCourse(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo curso
            </Button>
            <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
              Esta tela concentra busca e filtros para facilitar a revisao do catalogo sem misturar categorias e trilhas.
            </div>
          </CardContent>
        </Card>
      </div>

      <CourseDialog
        open={dialogOpen}
        initialValue={editingCourse}
        data={catalog}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingCourse(null)
          }
        }}
        onSubmit={async (payload) => {
          if (editingCourse) {
            await updateCourse(editingCourse.id, payload)
          } else {
            await createCourse(payload)
          }
          setDialogOpen(false)
          setEditingCourse(null)
        }}
      />
    </div>
  )
}
