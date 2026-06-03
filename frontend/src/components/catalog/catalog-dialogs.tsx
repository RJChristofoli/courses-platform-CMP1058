import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type {
  AcademicCatalogData,
  Category,
  CategoryPayload,
  Course,
  CoursePayload,
  Track,
  TrackPayload,
} from '@/types/models'

interface CategoryDialogProps {
  open: boolean
  initialValue: Category | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CategoryPayload) => Promise<void>
}

export function CategoryDialog({
  open,
  initialValue,
  isSaving,
  onOpenChange,
  onSubmit,
}: CategoryDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    setName(initialValue?.name ?? '')
    setDescription(initialValue?.description ?? '')
  }, [initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialValue ? 'Editar categoria' : 'Cadastrar categoria'}
          </DialogTitle>
          <DialogDescription>
            Defina um agrupador claro para relacionar cursos e trilhas academicas.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit({
              name,
              description,
            })
          }}
        >
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Nome da categoria
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Descricao
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CourseDialogProps {
  open: boolean
  initialValue: Course | null
  data: AcademicCatalogData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CoursePayload) => Promise<void>
}

export function CourseDialog({
  open,
  initialValue,
  data,
  isSaving,
  onOpenChange,
  onSubmit,
}: CourseDialogProps) {
  const [form, setForm] = useState<CoursePayload>({
    title: '',
    description: '',
    instructorId: 0,
    categoryId: 0,
    level: 'Iniciante',
    publishedAt: new Date().toISOString().slice(0, 10),
    totalLessons: 1,
    totalHours: 1,
  })

  useEffect(() => {
    const firstInstructor = data.users.find((user) => user.role === 'instructor')
    const firstCategory = data.categories[0]

    setForm({
      title: initialValue?.title ?? '',
      description: initialValue?.description ?? '',
      instructorId: initialValue?.instructorId ?? firstInstructor?.id ?? 0,
      categoryId: initialValue?.categoryId ?? firstCategory?.id ?? 0,
      level: initialValue?.level ?? 'Iniciante',
      publishedAt:
        initialValue?.publishedAt.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      totalLessons: initialValue?.totalLessons ?? 1,
      totalHours: initialValue?.totalHours ?? 1,
    })
  }, [data.categories, data.users, initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar curso' : 'Cadastrar curso'}</DialogTitle>
          <DialogDescription>
            Cadastre o curso com instrutor, categoria, nivel e dados de publicacao.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-6 grid grid-cols-2 gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit({
              ...form,
              publishedAt: new Date(form.publishedAt).toISOString(),
            })
          }}
        >
          <label className="col-span-2 block space-y-2 text-sm font-medium text-slate-700">
            Titulo do curso
            <Input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label className="col-span-2 block space-y-2 text-sm font-medium text-slate-700">
            Descricao
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Categoria
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: Number(event.target.value) }))
              }
            >
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Instrutor
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.instructorId}
              onChange={(event) =>
                setForm((current) => ({ ...current, instructorId: Number(event.target.value) }))
              }
            >
              {data.users
                .filter((user) => user.role === 'instructor')
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Nivel
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.level}
              onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))}
            >
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediario">Intermediario</option>
              <option value="Avancado">Avancado</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Publicacao
            <Input
              type="date"
              value={form.publishedAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, publishedAt: event.target.value }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Total de aulas
            <Input
              type="number"
              min={1}
              value={form.totalLessons}
              onChange={(event) =>
                setForm((current) => ({ ...current, totalLessons: Number(event.target.value) }))
              }
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Total de horas
            <Input
              type="number"
              min={1}
              value={form.totalHours}
              onChange={(event) =>
                setForm((current) => ({ ...current, totalHours: Number(event.target.value) }))
              }
            />
          </label>
          <div className="col-span-2 mt-2">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar curso'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface TrackDialogProps {
  open: boolean
  initialValue: Track | null
  data: AcademicCatalogData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: TrackPayload) => Promise<void>
}

export function TrackDialog({
  open,
  initialValue,
  data,
  isSaving,
  onOpenChange,
  onSubmit,
}: TrackDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [courseIds, setCourseIds] = useState<number[]>([])

  const availableCourses = useMemo(
    () => data.courses.filter((course) => course.categoryId === categoryId),
    [categoryId, data.courses],
  )

  useEffect(() => {
    const defaultCategoryId = initialValue?.categoryId ?? data.categories[0]?.id ?? 0
    const existingRelations = initialValue
      ? data.trackCourses
          .filter((relation) => relation.trackId === initialValue.id)
          .sort((left, right) => left.order - right.order)
          .map((relation) => relation.courseId)
      : []

    setTitle(initialValue?.title ?? '')
    setDescription(initialValue?.description ?? '')
    setCategoryId(defaultCategoryId)
    setCourseIds(existingRelations)
  }, [data.categories, data.trackCourses, initialValue, open])

  useEffect(() => {
    setCourseIds((current) =>
      current.filter((courseId) =>
        data.courses.some(
          (course) => course.id === courseId && course.categoryId === categoryId,
        ),
      ),
    )
  }, [categoryId, data.courses])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar trilha' : 'Cadastrar trilha'}</DialogTitle>
          <DialogDescription>
            Monte uma sequencia de cursos da mesma categoria para guiar a jornada do aluno.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit({
              title,
              description,
              categoryId,
              courseIds,
            })
          }}
        >
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Titulo da trilha
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Descricao
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Categoria base
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
            >
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-sm font-medium text-slate-700">Cursos da trilha</p>
              <p className="mt-1 text-sm text-slate-500">
                Selecione os cursos da categoria escolhida na ordem desejada.
              </p>
            </div>
            <div className="space-y-3">
              {availableCourses.map((course) => {
                const checked = courseIds.includes(course.id)

                return (
                  <label
                    key={course.id}
                    className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        setCourseIds((current) => {
                          if (event.target.checked) {
                            return [...current, course.id]
                          }

                          return current.filter((courseId) => courseId !== course.id)
                        })
                      }}
                    />
                    <span>
                      <span className="block font-medium text-slate-900">{course.title}</span>
                      <span className="mt-1 block text-slate-500">{course.level}</span>
                    </span>
                  </label>
                )
              })}
              {availableCourses.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ainda nao existem cursos nesta categoria para compor a trilha.
                </p>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar trilha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
