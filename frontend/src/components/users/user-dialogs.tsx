import { useEffect, useState } from 'react'
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
import { dateInputToUtc, formatDate } from '@/lib/utils'
import type {
  Certificate,
  CertificatePayload,
  Course,
  PlatformData,
  Enrollment,
  EnrollmentPayload,
  LessonProgress,
  LessonProgressPayload,
  User,
  UserPayload,
  UserUpdatePayload,
} from '@/types/models'

interface UserDialogProps {
  open: boolean
  initialValue: User | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UserPayload | UserUpdatePayload) => Promise<void>
}

export function UserDialog({ open, initialValue, isSaving, onOpenChange, onSubmit }: UserDialogProps) {
  const [form, setForm] = useState<UserPayload>({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  })

  useEffect(() => {
    setForm({
      fullName: initialValue?.fullName ?? '',
      email: initialValue?.email ?? '',
      password: '',
      role: initialValue?.role ?? 'student',
    })
  }, [initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar usuario' : 'Novo usuario'}</DialogTitle>
          <DialogDescription>Cadastre as contas e os perfis de acesso da plataforma.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-6 grid grid-cols-2 gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const { password, ...fields } = form
            void onSubmit(initialValue && !password ? fields : form)
          }}
        >
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Nome completo</span>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>E-mail</span>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>{initialValue ? 'Nova senha (opcional)' : 'Senha'}</span>
            <Input type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!initialValue} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Perfil</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserPayload['role'] })}>
              <option value="student">Aluno</option>
              <option value="instructor">Instrutor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          {initialValue ? <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Cadastro</span>
            <p className="pt-2 text-sm font-normal text-slate-500">{formatDate(initialValue.createdAt)} · definida pelo servidor</p>
          </label> : null}
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar usuario'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EnrollmentDialogProps {
  open: boolean
  initialValue: Enrollment | null
  data: PlatformData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: EnrollmentPayload) => Promise<void>
}

export function EnrollmentDialog({ open, initialValue, data, isSaving, onOpenChange, onSubmit }: EnrollmentDialogProps) {
  const [form, setForm] = useState<EnrollmentPayload>({
    userId: 0,
    courseId: 0,
    enrolledAt: new Date().toISOString(),
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      courseId: initialValue?.courseId ?? data.courses[0]?.id ?? 0,
      enrolledAt: initialValue?.enrolledAt ?? new Date().toISOString(),
    })
  }, [data.courses, data.users, initialValue, open])

  const availableStudents = data.users.filter((user) => user.role === 'student')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar matricula' : 'Nova matricula'}</DialogTitle>
          <DialogDescription>Associe um aluno a um curso e acompanhe a conclusao.</DialogDescription>
        </DialogHeader>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={(event) => {
          event.preventDefault()
          void onSubmit(form)
        }}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Aluno</span>
            <select disabled={Boolean(initialValue)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
              {availableStudents.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Curso</span>
            <select disabled={Boolean(initialValue)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}>
              {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Data da matricula</span>
            <Input type="date" value={form.enrolledAt.slice(0, 10)} onChange={(e) => setForm({ ...form, enrolledAt: dateInputToUtc(e.target.value) })} />
          </label>
          {initialValue ? <div className="space-y-2 text-sm font-medium text-slate-700">
            <span>Conclusão calculada</span>
            <p className="pt-2 text-sm font-normal text-slate-500">{initialValue.completedAt ? formatDate(initialValue.completedAt) : 'Em andamento'}</p>
          </div> : null}
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar matricula'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface ProgressDialogProps {
  open: boolean
  initialValue: LessonProgress | null
  data: PlatformData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: LessonProgressPayload) => Promise<void>
}

export function ProgressDialog({ open, initialValue, data, isSaving, onOpenChange, onSubmit }: ProgressDialogProps) {
  const [form, setForm] = useState<LessonProgressPayload>({
    userId: 0,
    lessonId: 0,
    completedAt: null,
    status: 'Em andamento',
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      lessonId: initialValue?.lessonId ?? data.lessons[0]?.id ?? 0,
      completedAt: initialValue?.completedAt ?? null,
      status: initialValue?.status ?? 'Em andamento',
    })
  }, [data.lessons, data.users, initialValue, open])

  const availableStudents = data.users.filter((user) => user.role === 'student')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar progresso' : 'Novo registro de progresso'}</DialogTitle>
          <DialogDescription>Marque aulas concluidas ou em andamento por aluno.</DialogDescription>
        </DialogHeader>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={(event) => {
          event.preventDefault()
          void onSubmit({
            ...form,
            completedAt: form.status === 'Em andamento' ? null : form.completedAt ?? undefined,
          })
        }}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Aluno</span>
            <select disabled={Boolean(initialValue)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
              {availableStudents.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LessonProgressPayload['status'] })}>
              <option value="Concluido">Concluido</option>
              <option value="Em andamento">Em andamento</option>
            </select>
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Aula</span>
            <select disabled={Boolean(initialValue)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: Number(e.target.value) })}>
              {data.lessons.map((lesson) => {
                const module = data.modules.find((item) => item.id === lesson.moduleId)
                const course = data.courses.find((item) => item.id === module?.courseId)
                return <option key={lesson.id} value={lesson.id}>{course?.title ?? 'Curso'} · {lesson.title}</option>
              })}
            </select>
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Concluida em</span>
            <Input type="date" disabled={form.status === 'Em andamento'} value={form.completedAt?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, completedAt: e.target.value ? dateInputToUtc(e.target.value) : null })} />
          </label>
          <p className="col-span-2 text-xs text-slate-500">Em andamento limpa a data; em Concluído, deixe em branco para registrar a data atual.</p>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar progresso'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CertificateDialogProps {
  open: boolean
  initialValue: Certificate | null
  data: PlatformData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CertificatePayload) => Promise<void>
}

export function CertificateDialog({ open, initialValue, data, isSaving, onOpenChange, onSubmit }: CertificateDialogProps) {
  const [form, setForm] = useState<CertificatePayload>({
    userId: 0,
    courseId: 0,
    trackId: null,
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      courseId: initialValue?.courseId ?? data.courses[0]?.id ?? 0,
      trackId: initialValue?.trackId ?? null,
    })
  }, [data.courses, data.users, initialValue, open])

  const availableStudents = data.users.filter((user) => user.role === 'student')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar certificado' : 'Novo certificado'}</DialogTitle>
          <DialogDescription>Emita certificados com codigo de verificacao para cursos e trilhas.</DialogDescription>
        </DialogHeader>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={(event) => {
          event.preventDefault()
          void onSubmit(form)
        }}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Aluno</span>
            <select disabled={Boolean(initialValue)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
              {availableStudents.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Curso</span>
            <select disabled={Boolean(initialValue)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}>
              {data.courses.map((course: Course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Trilha</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.trackId ?? ''} onChange={(e) => setForm({ ...form, trackId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Sem trilha</option>
              {data.tracks.map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}
            </select>
          </label>
          <p className="col-span-2 text-sm text-slate-500">O servidor gera o código de verificação e a data de emissão ao criar o certificado{initialValue ? ` (${initialValue.verificationCode} · ${initialValue.issuedAt.slice(0, 10)})` : '.'}</p>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar certificado'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
