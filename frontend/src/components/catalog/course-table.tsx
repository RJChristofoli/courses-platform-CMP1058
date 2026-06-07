import type { AcademicCatalogData, Course } from '@/types/models'
import { ActionMenu, DataTable } from '@/components/ui/action-menu'

interface CourseTableProps {
  data: AcademicCatalogData
  courses: Course[]
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
  onOpenStructure: (course: Course) => void
}

export function CourseTable({ data, courses, onEdit, onDelete, onOpenStructure }: CourseTableProps) {
  return (
    <DataTable
      columns={['Nome', 'Categoria', 'Nível', 'Instrutor', 'Módulos', 'Aulas', 'Trilhas', 'Ações']}
    >
      {courses.map((course) => {
        const category = data.categories.find((item) => item.id === course.categoryId)?.name ?? 'Sem categoria'
        const instructor = data.users.find((item) => item.id === course.instructorId)?.fullName ?? 'Não encontrado'
        const modules = data.modules.filter((module) => module.courseId === course.id)
        const lessons = data.lessons.filter((lesson) => modules.some((module) => module.id === lesson.moduleId))
        const tracks = data.trackCourses.filter((relation) => relation.courseId === course.id).length

        return (
          <tr key={course.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
            <td className="px-4 py-2.5 font-medium text-slate-900">{course.title}</td>
            <td className="px-4 py-2.5 text-slate-600">{category}</td>
            <td className="px-4 py-2.5 text-slate-600">{course.level}</td>
            <td className="px-4 py-2.5 text-slate-600">{instructor}</td>
            <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{modules.length}</td>
            <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{lessons.length}</td>
            <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{tracks}</td>
            <td className="px-4 py-2.5 text-right">
              <ActionMenu
                items={[
                  { label: 'Abrir estrutura', onSelect: () => onOpenStructure(course) },
                  { label: 'Editar', onSelect: () => onEdit(course) },
                  { label: 'Remover', tone: 'danger', onSelect: () => onDelete(course) },
                ]}
              />
            </td>
          </tr>
        )
      })}
    </DataTable>
  )
}
