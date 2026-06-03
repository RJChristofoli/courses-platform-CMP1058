import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AcademicCatalogData, Category } from '@/types/models'

interface CategoryPanelProps {
  data: AcademicCatalogData
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryPanel({ data, onEdit, onDelete }: CategoryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias cadastradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.categories.map((category) => {
          const courseCount = data.courses.filter(
            (course) => course.categoryId === category.id,
          ).length
          const trackCount = data.tracks.filter(
            (track) => track.categoryId === category.id,
          ).length

          return (
            <div key={category.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                    <Badge variant="secondary">{courseCount} cursos</Badge>
                    <Badge variant="outline">{trackCount} trilhas</Badge>
                  </div>
                  <p className="mt-3 text-sm">{category.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onEdit(category)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(category)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
