import { BookOpenCheck, ChevronRight, Pencil, PlayCircle, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { AcademicCatalogData, Course, Lesson, Module } from '@/types/models'

interface CourseStructurePanelProps {
  data: AcademicCatalogData
  course: Course | null
  onCreateModule: (course: Course) => void
  onEditModule: (module: Module) => void
  onDeleteModule: (module: Module) => void
  onCreateLesson: (module: Module) => void
  onEditLesson: (lesson: Lesson) => void
  onDeleteLesson: (lesson: Lesson) => void
}

export function CourseStructurePanel({
  data,
  course,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
}: CourseStructurePanelProps) {
  if (!course) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estrutura do curso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Selecione um curso para visualizar e estruturar modulos e aulas.
          </div>
        </CardContent>
      </Card>
    )
  }

  const instructor = data.users.find((user) => user.id === course.instructorId)
  const category = data.categories.find((category) => category.id === course.categoryId)
  const modules = data.modules
    .filter((module) => module.courseId === course.id)
    .sort((left, right) => left.order - right.order)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Estrutura do curso</CardTitle>
          <p className="mt-2 text-sm text-slate-500">
            Organize o fluxo de conteudo em modulos e aulas com ordem definida.
          </p>
        </div>
        <Button variant="secondary" onClick={() => onCreateModule(course)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo modulo
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50 p-5">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{category?.name ?? 'Sem categoria'}</Badge>
                <Badge>{course.level}</Badge>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-2 max-w-3xl text-sm">{course.description}</p>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm text-slate-500">
                <p>Instrutor: {instructor?.fullName ?? 'Nao encontrado'}</p>
                <p>Publicado em {formatDate(course.publishedAt)}</p>
                <p>{modules.length} modulo(s)</p>
                <p>{data.lessons.filter((lesson) => modules.some((module) => module.id === lesson.moduleId)).length} aula(s)</p>
              </div>
            </div>
            <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Edite a ordem para controlar a experiencia de aprendizagem.
            </div>
          </div>
        </div>

        {modules.map((module) => {
          const lessons = data.lessons
            .filter((lesson) => lesson.moduleId === module.id)
            .sort((left, right) => left.order - right.order)

          return (
            <div key={module.id} className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Modulo {module.order}</Badge>
                    <h4 className="text-lg font-semibold text-slate-900">{module.title}</h4>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {lessons.length} aula(s) vinculadas a este modulo.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onCreateLesson(module)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova aula
                  </Button>
                  <Button variant="outline" onClick={() => onEditModule(module)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar modulo
                  </Button>
                  <Button variant="ghost" onClick={() => onDeleteModule(module)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-start justify-between rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                          <ChevronRight className="h-3 w-3" />
                          Aula {lesson.order}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                          <PlayCircle className="h-3 w-3" />
                          {lesson.contentType}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{lesson.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {lesson.durationMinutes} min • {lesson.contentUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onEditLesson(lesson)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="ghost" onClick={() => onDeleteLesson(lesson)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}

                {lessons.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                    Este modulo ainda nao possui aulas cadastradas.
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}

        {modules.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Este curso ainda nao possui modulos. Comece adicionando o primeiro bloco de conteudo.
          </div>
        ) : null}

        <div className="rounded-[1.75rem] border border-slate-100 bg-slate-950 p-5 text-slate-50">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 text-amber-300">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Boas praticas da etapa 3</p>
              <p className="mt-2 text-sm text-slate-300">
                Use a ordem dos modulos e das aulas para refletir a progressao pedagogica do curso.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
