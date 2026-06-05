import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AcademicCatalogData, Course } from '@/types/models'

interface CourseBoardProps {
  data: AcademicCatalogData
  courses: Course[]
  selectedCategoryId: number | 'all'
  selectedCourseId?: number | null
  onSelect?: (course: Course) => void
  onEdit?: (course: Course) => void
  onDelete?: (course: Course) => void
}

export function CourseBoard({
  data,
  courses,
  selectedCategoryId,
  selectedCourseId = null,
  onSelect,
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
          const modulesCount = data.modules.filter((module) => module.courseId === course.id).length
          const lessonsCount = data.lessons.filter((lesson) =>
            data.modules.some((module) => module.id === lesson.moduleId && module.courseId === course.id),
          ).length

          const Container = onSelect ? 'button' : 'div'

          return (
            <Container
              key={course.id}
              type={onSelect ? 'button' : undefined}
              onClick={onSelect ? () => onSelect(course) : undefined}
              className={cn(
                'w-full rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5 text-left transition hover:border-teal-200 hover:bg-white',
                onSelect && selectedCourseId === course.id && 'border-teal-200 bg-white shadow-sm',
              )}
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
                  <div className="grid grid-cols-5 gap-4 text-sm text-slate-500">
                    <p>Instrutor: {instructor?.fullName ?? 'Nao encontrado'}</p>
                    <p>{course.totalLessons} aulas previstas</p>
                    <p>{course.totalHours} horas</p>
                    <p>{linkedTracks} trilha(s)</p>
                    <p>{modulesCount} modulo(s) / {lessonsCount} aula(s)</p>
                  </div>
                </div>
                {onEdit || onDelete ? (
                  <div className="flex shrink-0 gap-2" onClick={(event) => event.stopPropagation()}>
                    {onEdit ? (
                      <Button variant="outline" onClick={() => onEdit(course)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button variant="ghost" onClick={() => onDelete(course)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Container>
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
