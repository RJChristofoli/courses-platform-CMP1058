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
} from '@/types/models'

interface UserDialogProps {
  open: boolean
  initialValue: User | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: UserPayload) => Promise<void>
}

export function UserDialog({ open, initialValue, isSaving, onOpenChange, onSubmit }: UserDialogProps) {
  const [form, setForm] = useState<UserPayload>({
    fullName: '',
    email: '',
    passwordHash: 'hash_demo_new',
    createdAt: new Date().toISOString(),
    role: 'student',
  })

  useEffect(() => {
    setForm({
      fullName: initialValue?.fullName ?? '',
      email: initialValue?.email ?? '',
      passwordHash: initialValue?.passwordHash ?? 'hash_demo_new',
      createdAt: initialValue?.createdAt ?? new Date().toISOString(),
      role: initialValue?.role ?? 'student',
    })
  }, [initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar usuario' : 'Novo usuario'}</DialogTitle>
          <DialogDescription>Cadastre alunos e instrutores para a operacao academica.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-6 grid grid-cols-2 gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit(form)
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
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Perfil</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserPayload['role'] })}>
              <option value="student">Aluno</option>
              <option value="instructor">Instrutor</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Data de cadastro</span>
            <Input type="date" value={form.createdAt.slice(0, 10)} onChange={(e) => setForm({ ...form, createdAt: new Date(e.target.value).toISOString() })} required />
          </label>
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
    completedAt: null,
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      courseId: initialValue?.courseId ?? data.courses[0]?.id ?? 0,
      enrolledAt: initialValue?.enrolledAt ?? new Date().toISOString(),
      completedAt: initialValue?.completedAt ?? null,
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
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
              {availableStudents.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Curso</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}>
              {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Data da matricula</span>
            <Input type="date" value={form.enrolledAt.slice(0, 10)} onChange={(e) => setForm({ ...form, enrolledAt: new Date(e.target.value).toISOString() })} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Conclusao</span>
            <Input type="date" value={form.completedAt?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, completedAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </label>
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
    completedAt: new Date().toISOString(),
    status: 'Concluido',
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      lessonId: initialValue?.lessonId ?? data.lessons[0]?.id ?? 0,
      completedAt: initialValue?.completedAt ?? new Date().toISOString(),
      status: initialValue?.status ?? 'Concluido',
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
          void onSubmit(form)
        }}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Aluno</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
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
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.lessonId} onChange={(e) => setForm({ ...form, lessonId: Number(e.target.value) })}>
              {data.lessons.map((lesson) => {
                const module = data.modules.find((item) => item.id === lesson.moduleId)
                const course = data.courses.find((item) => item.id === module?.courseId)
                return <option key={lesson.id} value={lesson.id}>{course?.title ?? 'Curso'} · {lesson.title}</option>
              })}
            </select>
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Concluida em</span>
            <Input type="date" value={form.completedAt?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, completedAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </label>
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
    trackId: undefined,
    verificationCode: '',
    issuedAt: new Date().toISOString(),
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      courseId: initialValue?.courseId ?? data.courses[0]?.id ?? 0,
      trackId: initialValue?.trackId,
      verificationCode: initialValue?.verificationCode ?? `CERT-${Date.now()}`,
      issuedAt: initialValue?.issuedAt ?? new Date().toISOString(),
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
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
              {availableStudents.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Curso</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })}>
              {data.courses.map((course: Course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Trilha</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.trackId ?? ''} onChange={(e) => setForm({ ...form, trackId: e.target.value ? Number(e.target.value) : undefined })}>
              <option value="">Sem trilha</option>
              {data.tracks.map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Emissao</span>
            <Input type="date" value={form.issuedAt.slice(0, 10)} onChange={(e) => setForm({ ...form, issuedAt: new Date(e.target.value).toISOString() })} />
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Codigo de verificacao</span>
            <Input value={form.verificationCode} onChange={(e) => setForm({ ...form, verificationCode: e.target.value })} required />
          </label>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar certificado'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
