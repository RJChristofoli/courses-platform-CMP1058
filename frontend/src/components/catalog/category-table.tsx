import type { AcademicCatalogData, Category } from '@/types/models'
import { ActionMenu, DataTable } from '@/components/ui/action-menu'

interface CategoryTableProps {
  data: AcademicCatalogData
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryTable({ data, onEdit, onDelete }: CategoryTableProps) {
  return (
    <DataTable columns={['Nome', 'Cursos', 'Trilhas', 'Acoes']}>
      {data.categories.map((category) => {
        const coursesCount = data.courses.filter((course) => course.categoryId === category.id).length
        const tracksCount = data.tracks.filter((track) => track.categoryId === category.id).length

        return (
          <tr key={category.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
            <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
            <td className="px-4 py-3 text-slate-600">{coursesCount}</td>
            <td className="px-4 py-3 text-slate-600">{tracksCount}</td>
            <td className="px-4 py-3">
              <ActionMenu
                items={[
                  { label: 'Editar', onSelect: () => onEdit(category) },
                  { label: 'Remover', tone: 'danger', onSelect: () => onDelete(category) },
                ]}
              />
            </td>
          </tr>
        )
      })}
    </DataTable>
  )
}
