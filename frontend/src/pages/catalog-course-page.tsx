import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CourseDialog } from '@/components/catalog/catalog-dialogs'
import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import { CourseTable } from '@/components/catalog/course-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Course } from '@/types/models'

export function CatalogCoursePage() {
  const { data, isSaving, createCourse, updateCourse, deleteCourse } = useCatalogOutlet()
  const navigate = useNavigate()
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<string | 'all'>('all')
  const catalog = data!

  const filtered = useMemo(() => {
    return catalog.courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || course.categoryId === categoryFilter
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter
      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [catalog.courses, search, categoryFilter, levelFilter])

  async function handleDelete(course: Course) {
    if (!window.confirm(`Deseja remover o curso "${course.title}"?`)) return
    await deleteCourse(course.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <Input className="h-10 w-full lg:w-72" placeholder="Buscar curso" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Todas as categorias</option>
            {catalog.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="all">Todos os níveis</option>
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediario">Intermediário</option>
            <option value="Avancado">Avançado</option>
          </select>
        </div>
        <Button onClick={() => { setEditingCourse(null); setCourseDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Curso
        </Button>
      </div>

      <CourseTable
        data={catalog}
        courses={filtered}
        onEdit={(course) => { setEditingCourse(course); setCourseDialogOpen(true) }}
        onDelete={(course) => { void handleDelete(course) }}
        onOpenStructure={(course) => navigate(`/catalogo/estrutura?course=${course.id}`)}
      />

      <CourseDialog
        open={courseDialogOpen}
        initialValue={editingCourse}
        data={catalog}
        isSaving={isSaving}
        onOpenChange={(open) => { setCourseDialogOpen(open); if (!open) setEditingCourse(null) }}
        onSubmit={async (payload) => {
          if (editingCourse) await updateCourse(editingCourse.id, payload)
          else await createCourse(payload)
          setCourseDialogOpen(false)
          setEditingCourse(null)
        }}
      />
    </div>
  )
}
