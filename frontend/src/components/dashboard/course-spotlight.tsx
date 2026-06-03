import { ArrowUpRight, Clock3, Layers3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Category, DashboardData, User } from '@/types/models'

interface CourseSpotlightProps {
  data: DashboardData
}

function findCategory(categories: Category[], categoryId: number) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Sem categoria'
}

function findInstructor(users: User[], instructorId: number) {
  return users.find((user) => user.id === instructorId)?.fullName ?? 'Instrutor nao encontrado'
}

export function CourseSpotlight({ data }: CourseSpotlightProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <Badge>Base academica pronta</Badge>
          <CardTitle className="mt-4 text-2xl">Cursos em destaque</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            A primeira etapa ja entrega um catalogo navegavel com dados consistentes para
            demonstrar a evolucao do produto.
          </CardDescription>
        </div>
        <Button variant="secondary">
          Explorar catalogo
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {data.courses.map((course) => (
          <div
            key={course.id}
            className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline">{findCategory(data.categories, course.categoryId)}</Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {course.level}
              </span>
            </div>
            <h3 className="mt-4 text-xl font-semibold">{course.title}</h3>
            <p className="mt-2 text-sm">{course.description}</p>
            <div className="mt-5 space-y-2 text-sm text-slate-500">
              <p>Instrutor: {findInstructor(data.users, course.instructorId)}</p>
              <p className="flex items-center gap-2">
                <Layers3 className="h-4 w-4" />
                {course.totalLessons} aulas planejadas
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {course.totalHours} horas totais
              </p>
            </div>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">
              Publicado em {formatDate(course.publishedAt)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
