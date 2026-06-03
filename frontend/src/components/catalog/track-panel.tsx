import { ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AcademicCatalogData, Track } from '@/types/models'

interface TrackPanelProps {
  data: AcademicCatalogData
  onEdit: (track: Track) => void
  onDelete: (track: Track) => void
}

export function TrackPanel({ data, onEdit, onDelete }: TrackPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trilhas e relacoes com cursos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.tracks.map((track) => {
          const relations = data.trackCourses
            .filter((relation) => relation.trackId === track.id)
            .sort((left, right) => left.order - right.order)
          const category = data.categories.find((item) => item.id === track.categoryId)

          return (
            <div key={track.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{track.title}</h3>
                    <Badge>{category?.name ?? 'Sem categoria'}</Badge>
                  </div>
                  <p className="text-sm">{track.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    {relations.length === 0 ? (
                      <span>Nenhum curso associado ainda.</span>
                    ) : (
                      relations.map((relation) => {
                        const course = data.courses.find((item) => item.id === relation.courseId)

                        return (
                          <span key={relation.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                            <span>{relation.order}.</span>
                            <span>{course?.title ?? 'Curso removido'}</span>
                            <ArrowRight className="h-3 w-3 text-slate-300" />
                          </span>
                        )
                      })
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onEdit(track)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(track)}>
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
