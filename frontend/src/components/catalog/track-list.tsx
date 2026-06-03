import { ArrowRight, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardData } from '@/types/models'

interface TrackListProps {
  data: DashboardData
}

export function TrackList({ data }: TrackListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Trilhas de conhecimento</CardTitle>
          <p className="mt-2 text-sm">
            A relacao entre trilhas e cursos ja esta modelada para as proximas etapas.
          </p>
        </div>
        <Button variant="outline">Nova trilha</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.tracks.map((track) => {
          const relatedCourses = data.courses.filter(
            (course) => course.categoryId === track.categoryId,
          )

          return (
            <div
              key={track.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-teal-700" />
                  <p className="font-semibold text-slate-900">{track.title}</p>
                </div>
                <p className="mt-2 text-sm">{track.description}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{relatedCourses.length} curso(s) relacionados</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
