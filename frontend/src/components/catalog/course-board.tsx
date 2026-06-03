import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AcademicCatalogData, Course } from '@/types/models'

interface CourseBoardProps {
  data: AcademicCatalogData
  courses: Course[]
  selectedCategoryId: number | 'all'
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
}

export function CourseBoard({
  data,
  courses,
  selectedCategoryId,
  onEdit,
  onDelete,
}: CourseBoardProps) {
  const selectedCategoryName =
    selectedCategoryId === 'all'
      ? 'todas as categorias'
      : data.categories.find((category) => category.id === selectedCategoryId)?.name ??
        'categoria selecionada'

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Cursos do catalogo</CardTitle>
          <p className="mt-2 text-sm text-slate-500">
            Exibindo {courses.length} curso(s) para {selectedCategoryName}.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => {
          const category = data.categories.find((item) => item.id === course.categoryId)
          const instructor = data.users.find((item) => item.id === course.instructorId)
          const linkedTracks = data.trackCourses.filter(
            (relation) => relation.courseId === course.id,
          ).length

          return (
            <div
              key={course.id}
              className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{category?.name ?? 'Sem categoria'}</Badge>
                    <Badge>{course.level}</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{course.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm">{course.description}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm text-slate-500">
                    <p>Instrutor: {instructor?.fullName ?? 'Nao encontrado'}</p>
                    <p>{course.totalLessons} aulas</p>
                    <p>{course.totalHours} horas</p>
                    <p>{linkedTracks} trilha(s) relacionadas</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" onClick={() => onEdit(course)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(course)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
        {courses.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Nenhum curso encontrado com os filtros atuais.
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
