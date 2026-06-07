import { ChevronDown, ChevronRight, GripVertical, Plus } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ActionMenu } from '@/components/ui/action-menu'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type {
  AcademicCatalogData,
  CoursePayload,
  Lesson,
  LessonPayload,
  Module,
  ModulePayload,
} from '@/types/models'

type Selection =
  | { kind: 'course'; id: number }
  | { kind: 'module'; id: number }
  | { kind: 'lesson'; id: number }
  | { kind: 'new-module'; courseId: number }
  | { kind: 'new-lesson'; moduleId: number }

interface StructureWorkspaceProps {
  data: AcademicCatalogData
  onUpdateCourse: (courseId: number, payload: CoursePayload) => Promise<void>
  onCreateModule: (payload: ModulePayload) => Promise<void>
  onUpdateModule: (moduleId: number, payload: ModulePayload) => Promise<void>
  onDeleteModule: (module: Module) => void
  onCreateLesson: (payload: LessonPayload) => Promise<void>
  onUpdateLesson: (lessonId: number, payload: LessonPayload) => Promise<void>
  onDeleteLesson: (lesson: Lesson) => void
  onReorderModules: (courseId: number, orderedModuleIds: number[]) => Promise<void>
  onReorderLessons: (courseId: number, updates: Array<{ id: number; moduleId: number; order: number }>) => Promise<void>
}

type CourseFormState = CoursePayload

type ModuleFormState = ModulePayload

type LessonFormState = LessonPayload

export function StructureWorkspace({
  data,
  onUpdateCourse,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderModules,
  onReorderLessons,
}: StructureWorkspaceProps) {
  const [search, setSearch] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [courseForm, setCourseForm] = useState<CourseFormState | null>(null)
  const [moduleForm, setModuleForm] = useState<ModuleFormState | null>(null)
  const [lessonForm, setLessonForm] = useState<LessonFormState | null>(null)
  const [dragState, setDragState] = useState<
    | { type: 'module'; id: number }
    | { type: 'lesson'; id: number; moduleId: number }
    | null
  >(null)

  const filteredCourses = useMemo(() => {
    return data.courses.filter((course) => {
      const instructor = data.users.find((user) => user.id === course.instructorId)?.fullName ?? ''
      const category = data.categories.find((category) => category.id === course.categoryId)?.name ?? ''
      const needle = `${course.title} ${course.description} ${instructor} ${category}`.toLowerCase()
      return needle.includes(search.toLowerCase())
    })
  }, [data.categories, data.courses, data.users, search])

  useEffect(() => {
    if (filteredCourses.length === 0) {
      setSelectedCourseId(null)
      setSelection(null)
      return
    }

    setSelectedCourseId((current) => {
      if (current && filteredCourses.some((course) => course.id === current)) {
        return current
      }
      return filteredCourses[0].id
    })
  }, [filteredCourses])

  const selectedCourse = data.courses.find((course) => course.id === selectedCourseId) ?? null
  const selectedModules = data.modules
    .filter((module) => module.courseId === selectedCourseId)
    .sort((left, right) => left.order - right.order)

  const lessonsByModule = useMemo(() => {
    return new Map(
      selectedModules.map((module) => [
        module.id,
        data.lessons
          .filter((lesson) => lesson.moduleId === module.id)
          .sort((left, right) => left.order - right.order),
      ]),
    )
  }, [data.lessons, selectedModules])

  useEffect(() => {
    if (!selection && selectedCourse) {
      setSelection({ kind: 'course', id: selectedCourse.id })
    }
  }, [selectedCourse, selection])

  useEffect(() => {
    if (!selectedCourseId) {
      setExpanded(new Set())
      return
    }

    const totalLessons = selectedModules.reduce(
      (sum, module) => sum + (lessonsByModule.get(module.id)?.length ?? 0),
      0,
    )

    if (selectedModules.length <= 4 && totalLessons <= 8) {
      setExpanded(new Set(selectedModules.map((module) => module.id)))
      return
    }

    setExpanded((current) => {
      const next = new Set<number>()
      selectedModules.forEach((module) => {
        if (current.has(module.id)) {
          next.add(module.id)
        }
      })
      return next
    })
  }, [lessonsByModule, selectedCourseId, selectedModules])

  useEffect(() => {
    if (!selection) return

    if (selection.kind === 'module' && !data.modules.some((item) => item.id === selection.id)) {
      setSelection(selectedCourse ? { kind: 'course', id: selectedCourse.id } : null)
      return
    }

    if (selection.kind === 'lesson' && !data.lessons.some((item) => item.id === selection.id)) {
      setSelection(selectedCourse ? { kind: 'course', id: selectedCourse.id } : null)
      return
    }
  }, [data.lessons, data.modules, selectedCourse, selection])

  useEffect(() => {
    if (!selection) return

    if (selection.kind === 'course') {
      const course = data.courses.find((item) => item.id === selection.id)
      if (!course) return
      setCourseForm({
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        instructorId: course.instructorId,
        level: course.level,
        publishedAt: course.publishedAt,
        totalLessons: course.totalLessons,
        totalHours: course.totalHours,
      })
      setModuleForm(null)
      setLessonForm(null)
      return
    }

    if (selection.kind === 'module') {
      const module = data.modules.find((item) => item.id === selection.id)
      if (!module) return
      setModuleForm({ courseId: module.courseId, title: module.title, order: module.order })
      setCourseForm(null)
      setLessonForm(null)
      return
    }

    if (selection.kind === 'lesson') {
      const lesson = data.lessons.find((item) => item.id === selection.id)
      if (!lesson) return
      setLessonForm({
        moduleId: lesson.moduleId,
        title: lesson.title,
        contentType: lesson.contentType,
        contentUrl: lesson.contentUrl,
        durationMinutes: lesson.durationMinutes,
        order: lesson.order,
      })
      setCourseForm(null)
      setModuleForm(null)
      return
    }

    if (selection.kind === 'new-module') {
      const nextOrder = data.modules.filter((module) => module.courseId === selection.courseId).length + 1
      setModuleForm({ courseId: selection.courseId, title: 'Novo módulo', order: nextOrder })
      setCourseForm(null)
      setLessonForm(null)
      return
    }

    if (selection.kind === 'new-lesson') {
      const nextOrder = data.lessons.filter((lesson) => lesson.moduleId === selection.moduleId).length + 1
      setLessonForm({
        moduleId: selection.moduleId,
        title: 'Nova aula',
        contentType: 'Vídeo',
        contentUrl: 'https://',
        durationMinutes: 10,
        order: nextOrder,
      })
      setCourseForm(null)
      setModuleForm(null)
    }
  }, [data.courses, data.lessons, data.modules, selection])

  function toggleModule(moduleId: number) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  async function persistModuleOrder(targetModuleId: number) {
    if (!dragState || dragState.type !== 'module' || !selectedCourseId) return
    if (dragState.id === targetModuleId) return

    const ordered = [...selectedModules]
    const fromIndex = ordered.findIndex((module) => module.id === dragState.id)
    const toIndex = ordered.findIndex((module) => module.id === targetModuleId)
    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = ordered.splice(fromIndex, 1)
    ordered.splice(toIndex, 0, moved)

    await onReorderModules(selectedCourseId, ordered.map((module) => module.id))
  }

  async function persistLessonOrder(targetModuleId: number, targetLessonId?: number) {
    if (!dragState || dragState.type !== 'lesson' || !selectedCourseId) return

    const courseModules = data.modules.filter((module) => module.courseId === selectedCourseId)
    const allLessons = data.lessons.filter((lesson) =>
      courseModules.some((module) => module.id === lesson.moduleId),
    )

    const updates = allLessons.map((lesson) => ({ id: lesson.id, moduleId: lesson.moduleId, order: lesson.order }))
    const dragged = updates.find((lesson) => lesson.id === dragState.id)
    if (!dragged) return

    dragged.moduleId = targetModuleId

    const sameModule = updates
      .filter((lesson) => lesson.moduleId === targetModuleId && lesson.id !== dragState.id)
      .sort((left, right) => left.order - right.order)

    const insertIndex = targetLessonId
      ? sameModule.findIndex((lesson) => lesson.id === targetLessonId)
      : sameModule.length

    if (insertIndex === -1) sameModule.push(dragged)
    else sameModule.splice(insertIndex, 0, dragged)

    sameModule.forEach((lesson, index) => {
      lesson.moduleId = targetModuleId
      lesson.order = index + 1
    })

    courseModules
      .filter((module) => module.id !== targetModuleId)
      .forEach((module) => {
        updates
          .filter((lesson) => lesson.moduleId === module.id)
          .sort((left, right) => left.order - right.order)
          .forEach((lesson, index) => {
            lesson.order = index + 1
          })
      })

    await onReorderLessons(selectedCourseId, updates)
  }

  async function handleSave() {
    if (!selection) return

    if (selection.kind === 'course' && courseForm) {
      await onUpdateCourse(selection.id, courseForm)
      return
    }

    if (selection.kind === 'module' && moduleForm) {
      await onUpdateModule(selection.id, moduleForm)
      return
    }

    if (selection.kind === 'lesson' && lessonForm) {
      await onUpdateLesson(selection.id, lessonForm)
      return
    }

    if (selection.kind === 'new-module' && moduleForm) {
      await onCreateModule(moduleForm)
      return
    }

    if (selection.kind === 'new-lesson' && lessonForm) {
      await onCreateLesson(lessonForm)
    }
  }

  return (
    <div className="grid min-h-[720px] grid-cols-1 gap-4 xl:grid-cols-[28%_72%] 2xl:grid-cols-[25%_35%_40%] xl:min-h-[760px]">
      <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Cursos</p>
          <Input className="mt-3 h-9" placeholder="Buscar curso" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {filteredCourses.length === 0 ? (
            <EmptyState
              className="m-4"
              title="Nenhum curso encontrado"
              description="Ajuste a busca para localizar um curso e editar sua estrutura."
            />
          ) : null}

          {filteredCourses.map((course) => {
            const modulesCount = data.modules.filter((module) => module.courseId === course.id).length
            const lessonsCount = data.lessons.filter((lesson) =>
              data.modules.some((module) => module.courseId === course.id && module.id === lesson.moduleId),
            ).length

            return (
              <button
                key={course.id}
                type="button"
                className={cn(
                  'flex w-full items-start justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50',
                  selectedCourseId === course.id && 'bg-slate-100',
                )}
                onClick={() => {
                  setSelectedCourseId(course.id)
                  setSelection({ kind: 'course', id: course.id })
                }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {modulesCount} módulos · {lessonsCount} aulas
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Estrutura</p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedCourse ? selectedCourse.title : 'Selecione um curso para editar módulos e aulas.'}
            </p>
          </div>
          <Button
            size="sm"
            disabled={!selectedCourse}
            onClick={() => {
              if (!selectedCourse) return
              setSelection({ kind: 'new-module', courseId: selectedCourse.id })
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Módulo
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-2">
          {!selectedCourse ? (
            <EmptyState
              className="m-2"
              title="Nenhum curso selecionado"
              description="Escolha um curso na coluna lateral para visualizar a árvore de módulos e aulas."
            />
          ) : null}

          {selectedCourse && selectedModules.length === 0 ? (
            <EmptyState
              className="m-2"
              title="Curso sem módulos"
              description="Crie o primeiro módulo para iniciar a estrutura do curso."
              action={
                <Button size="sm" onClick={() => setSelection({ kind: 'new-module', courseId: selectedCourse.id })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar módulo
                </Button>
              }
            />
          ) : null}

          {selectedModules.map((module) => {
            const lessons = lessonsByModule.get(module.id) ?? []
            const isExpanded = expanded.has(module.id)
            const selectedInModule =
              selection?.kind === 'module'
                ? selection.id === module.id
                : selection?.kind === 'lesson'
                  ? lessons.some((lesson) => lesson.id === selection.id)
                  : selection?.kind === 'new-lesson'
                    ? selection.moduleId === module.id
                    : false

            return (
              <div key={module.id} className="mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <div
                  className={cn('flex items-center gap-2 px-3 py-2', selectedInModule && 'bg-slate-100')}
                  draggable
                  onDragStart={() => setDragState({ type: 'module', id: module.id })}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={async () => {
                    await persistModuleOrder(module.id)
                    setDragState(null)
                  }}
                >
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <button type="button" className="flex items-center text-slate-500" onClick={() => toggleModule(module.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => setSelection({ kind: 'module', id: module.id })}
                  >
                    <p className="text-sm font-medium text-slate-900">{module.title}</p>
                    <p className="text-xs text-slate-500">{lessons.length} {lessons.length === 1 ? 'aula' : 'aulas'}</p>
                  </button>
                  <ActionMenu
                    items={[
                      { label: 'Editar', onSelect: () => setSelection({ kind: 'module', id: module.id }) },
                      { label: 'Nova aula', onSelect: () => setSelection({ kind: 'new-lesson', moduleId: module.id }) },
                      { label: 'Remover', tone: 'danger', onSelect: () => onDeleteModule(module) },
                    ]}
                  />
                </div>

                {isExpanded ? (
                  <div className="border-t border-slate-200 bg-white">
                    {lessons.length === 0 ? (
                      <div className="ml-6 border-l border-dashed border-slate-200 px-4 py-4">
                        <p className="text-sm text-slate-500">Nenhuma aula cadastrada neste módulo.</p>
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950"
                          onClick={() => setSelection({ kind: 'new-lesson', moduleId: module.id })}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={async () => {
                            await persistLessonOrder(module.id)
                            setDragState(null)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar aula
                        </button>
                      </div>
                    ) : null}

                    {lessons.map((lesson) => {
                      const isSelected = selection?.kind === 'lesson' && selection.id === lesson.id
                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            'ml-6 flex items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-none',
                            isSelected && 'bg-slate-50',
                          )}
                          draggable
                          onDragStart={() => setDragState({ type: 'lesson', id: lesson.id, moduleId: module.id })}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={async () => {
                            await persistLessonOrder(module.id, lesson.id)
                            setDragState(null)
                          }}
                        >
                          <GripVertical className="h-4 w-4 text-slate-300" />
                          <button type="button" className="flex-1 text-left" onClick={() => setSelection({ kind: 'lesson', id: lesson.id })}>
                            <p className="text-sm text-slate-700">{lesson.title}</p>
                            <p className="text-xs text-slate-400">{lesson.contentType}</p>
                          </button>
                          <ActionMenu
                            items={[
                              { label: 'Editar', onSelect: () => setSelection({ kind: 'lesson', id: lesson.id }) },
                              { label: 'Remover', tone: 'danger', onSelect: () => onDeleteLesson(lesson) },
                            ]}
                          />
                        </div>
                      )
                    })}

                    {lessons.length > 0 ? (
                      <button
                        type="button"
                        className="ml-6 flex w-[calc(100%-1.5rem)] items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
                        onClick={() => setSelection({ kind: 'new-lesson', moduleId: module.id })}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={async () => {
                          await persistLessonOrder(module.id)
                          setDragState(null)
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar aula
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-slate-200 bg-white xl:col-span-2 2xl:col-span-1">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Propriedades</p>
        </div>
        <div className="min-h-0 flex-1 overflow-auto overflow-x-hidden p-4">
          {!selection ? <p className="text-sm text-slate-500">Selecione um item para editar.</p> : null}

          {selection?.kind === 'course' && courseForm ? (
            <div className="space-y-4">
              <Field label="Título"><Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} /></Field>
              <Field label="Descrição"><textarea className="min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></Field>
              <TwoCols>
                <SelectField label="Categoria" value={courseForm.categoryId} options={data.categories.map((c) => ({ value: c.id, label: c.name }))} onChange={(value) => setCourseForm({ ...courseForm, categoryId: Number(value) })} />
                <SelectField label="Instrutor" value={courseForm.instructorId} options={data.users.filter((u) => u.role === 'instructor').map((u) => ({ value: u.id, label: u.fullName }))} onChange={(value) => setCourseForm({ ...courseForm, instructorId: Number(value) })} />
              </TwoCols>
              <TwoCols>
                <SelectField label="Nível" value={courseForm.level} options={[{ value: 'Iniciante', label: 'Iniciante' }, { value: 'Intermediario', label: 'Intermediário' }, { value: 'Avancado', label: 'Avançado' }]} onChange={(value) => setCourseForm({ ...courseForm, level: value })} />
                <Field label="Publicação"><Input type="date" value={courseForm.publishedAt.slice(0, 10)} onChange={(e) => setCourseForm({ ...courseForm, publishedAt: new Date(e.target.value).toISOString() })} /></Field>
              </TwoCols>
              <TwoCols>
                <Field label="Total de aulas"><Input type="number" value={courseForm.totalLessons} onChange={(e) => setCourseForm({ ...courseForm, totalLessons: Number(e.target.value) })} /></Field>
                <Field label="Total de horas"><Input type="number" value={courseForm.totalHours} onChange={(e) => setCourseForm({ ...courseForm, totalHours: Number(e.target.value) })} /></Field>
              </TwoCols>
            </div>
          ) : null}

          {(selection?.kind === 'module' || selection?.kind === 'new-module') && moduleForm ? (
            <div className="space-y-4">
              <Field label="Título"><Input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} /></Field>
              <Field label="Ordem"><Input type="number" value={moduleForm.order} onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })} /></Field>
            </div>
          ) : null}

          {(selection?.kind === 'lesson' || selection?.kind === 'new-lesson') && lessonForm ? (
            <div className="space-y-4">
              <Field label="Título"><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></Field>
              <TwoCols>
                <SelectField label="Tipo" value={lessonForm.contentType} options={[{ value: 'Vídeo', label: 'Vídeo' }, { value: 'Texto', label: 'Texto' }, { value: 'Quiz', label: 'Quiz' }, { value: 'Video', label: 'Vídeo' }]} onChange={(value) => setLessonForm({ ...lessonForm, contentType: value })} />
                <Field label="Duração"><Input type="number" value={lessonForm.durationMinutes} onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })} /></Field>
              </TwoCols>
              <Field label="URL"><Input value={lessonForm.contentUrl} onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })} /></Field>
              <Field label="Ordem"><Input type="number" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: Number(e.target.value) })} /></Field>
            </div>
          ) : null}
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <Button className="w-full" disabled={!selection} onClick={() => void handleSave()}>
            Salvar
          </Button>
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string | number
  options: Array<{ value: string | number; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

function TwoCols({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
}
