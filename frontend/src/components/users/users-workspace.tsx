import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActionMenu, CompactTabs, DataTable } from '@/components/ui/action-menu'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { CertificateDialog, EnrollmentDialog, ProgressDialog, UserDialog } from '@/components/users/user-dialogs'
import { formatDate } from '@/lib/utils'
import type {
  Certificate,
  CertificatePayload,
  PlatformData,
  Enrollment,
  EnrollmentPayload,
  LessonProgress,
  LessonProgressPayload,
  User,
  UserPayload,
} from '@/types/models'

interface UsersWorkspaceProps {
  data: PlatformData
  isSaving: boolean
  createUser: (payload: UserPayload) => Promise<void>
  updateUser: (userId: number, payload: UserPayload) => Promise<void>
  deleteUser: (userId: number) => Promise<void>
  createEnrollment: (payload: EnrollmentPayload) => Promise<void>
  updateEnrollment: (enrollmentId: number, payload: EnrollmentPayload) => Promise<void>
  deleteEnrollment: (enrollmentId: number) => Promise<void>
  createLessonProgress: (payload: LessonProgressPayload) => Promise<void>
  updateLessonProgress: (progressId: number, payload: LessonProgressPayload) => Promise<void>
  deleteLessonProgress: (progressId: number) => Promise<void>
  createCertificate: (payload: CertificatePayload) => Promise<void>
  updateCertificate: (certificateId: number, payload: CertificatePayload) => Promise<void>
  deleteCertificate: (certificateId: number) => Promise<void>
}

const tabs = [
  { label: 'Pessoas', href: 'users' },
  { label: 'Matriculas', href: 'enrollments' },
  { label: 'Progresso', href: 'progress' },
  { label: 'Certificados', href: 'certificates' },
] as const

export function UsersWorkspace({
  data,
  isSaving,
  createUser,
  updateUser,
  deleteUser,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  createLessonProgress,
  updateLessonProgress,
  deleteLessonProgress,
  createCertificate,
  updateCertificate,
  deleteCertificate,
}: UsersWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['href']>('users')
  const [search, setSearch] = useState('')
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [editingProgress, setEditingProgress] = useState<LessonProgress | null>(null)
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)

  const courseLessonsMap = useMemo(() => {
    return new Map(
      data.courses.map((course) => {
        const moduleIds = data.modules.filter((module) => module.courseId === course.id).map((module) => module.id)
        const lessons = data.lessons.filter((lesson) => moduleIds.includes(lesson.moduleId))
        return [course.id, lessons]
      }),
    )
  }, [data.courses, data.lessons, data.modules])

  const usersRows = useMemo(() => {
    return data.users.filter((user) => `${user.fullName} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase()))
  }, [data.users, search])

  const enrollmentsRows = useMemo(() => {
    return data.enrollments.filter((enrollment) => {
      const user = data.users.find((item) => item.id === enrollment.userId)
      const course = data.courses.find((item) => item.id === enrollment.courseId)
      return `${user?.fullName ?? ''} ${course?.title ?? ''}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [data.courses, data.enrollments, data.users, search])

  const progressRows = useMemo(() => {
    return data.lessonProgress.filter((progress) => {
      const user = data.users.find((item) => item.id === progress.userId)
      const lesson = data.lessons.find((item) => item.id === progress.lessonId)
      return `${user?.fullName ?? ''} ${lesson?.title ?? ''} ${progress.status}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [data.lessonProgress, data.lessons, data.users, search])

  const certificateRows = useMemo(() => {
    return data.certificates.filter((certificate) => {
      const user = data.users.find((item) => item.id === certificate.userId)
      const course = data.courses.find((item) => item.id === certificate.courseId)
      const track = data.tracks.find((item) => item.id === certificate.trackId)
      return `${user?.fullName ?? ''} ${course?.title ?? ''} ${track?.title ?? ''} ${certificate.verificationCode}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [data.certificates, data.courses, data.tracks, data.users, search])

  function getActionLabel() {
    if (activeTab === 'users') return 'Usuario'
    if (activeTab === 'enrollments') return 'Matricula'
    if (activeTab === 'progress') return 'Progresso'
    return 'Certificado'
  }

  function openCreateDialog() {
    if (activeTab === 'users') {
      setEditingUser(null)
      setUserDialogOpen(true)
      return
    }
    if (activeTab === 'enrollments') {
      setEditingEnrollment(null)
      setEnrollmentDialogOpen(true)
      return
    }
    if (activeTab === 'progress') {
      setEditingProgress(null)
      setProgressDialogOpen(true)
      return
    }
    setEditingCertificate(null)
    setCertificateDialogOpen(true)
  }

  async function handleDeleteUser(user: User) {
    if (!window.confirm(`Deseja remover o usuario "${user.fullName}"?`)) return
    await deleteUser(user.id)
  }

  async function handleDeleteEnrollment(enrollment: Enrollment) {
    if (!window.confirm('Deseja remover esta matricula?')) return
    await deleteEnrollment(enrollment.id)
  }

  async function handleDeleteProgress(progress: LessonProgress) {
    if (!window.confirm('Deseja remover este registro de progresso?')) return
    await deleteLessonProgress(progress.id)
  }

  async function handleDeleteCertificate(certificate: Certificate) {
    if (!window.confirm(`Deseja remover o certificado ${certificate.verificationCode}?`)) return
    await deleteCertificate(certificate.id)
  }

  return (
    <div className="space-y-4">
      <CompactTabs tabs={[...tabs]} activeHref={activeTab} onChange={(href) => setActiveTab(href as typeof activeTab)} />

      <div className="flex items-center justify-between gap-4">
        <Input className="h-10 max-w-sm" placeholder="Buscar no modulo" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {getActionLabel()}
        </Button>
      </div>

      {activeTab === 'users' ? (
        usersRows.length === 0 ? (
          <EmptyState title="Nenhum usuario encontrado" description="Ajuste a busca ou cadastre um novo usuario." />
        ) : (
          <DataTable columns={['Nome', 'Perfil', 'E-mail', 'Matriculas', 'Assinatura', 'Cadastro', 'Ações']}>
            {usersRows.map((user) => {
              const enrollmentsCount = data.enrollments.filter((item) => item.userId === user.id).length
              const activeSubscription = data.subscriptions.find((item) => item.userId === user.id && item.status === 'active')
              const plan = data.plans.find((item) => item.id === activeSubscription?.planId)

              return (
                <tr key={user.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{user.fullName}</td>
                  <td className="px-4 py-2.5 text-slate-600">{user.role === 'student' ? 'Aluno' : 'Instrutor'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{user.email}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{enrollmentsCount}</td>
                  <td className="px-4 py-2.5 text-slate-600">{plan?.name ?? 'Sem assinatura'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingUser(user); setUserDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeleteUser(user) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      {activeTab === 'enrollments' ? (
        enrollmentsRows.length === 0 ? (
          <EmptyState title="Nenhuma matricula encontrada" description="Cadastre a primeira matricula para iniciar o acompanhamento academico." />
        ) : (
          <DataTable columns={['Aluno', 'Curso', 'Progresso', 'Matricula', 'Conclusao', 'Ações']}>
            {enrollmentsRows.map((enrollment) => {
              const user = data.users.find((item) => item.id === enrollment.userId)
              const course = data.courses.find((item) => item.id === enrollment.courseId)
              const lessons = courseLessonsMap.get(enrollment.courseId) ?? []
              const completedCount = data.lessonProgress.filter((progress) => progress.userId === enrollment.userId && progress.status === 'Concluido' && lessons.some((lesson) => lesson.id === progress.lessonId)).length
              const progressValue = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0

              return (
                <tr key={enrollment.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{course?.title ?? 'Curso nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{progressValue}%</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(enrollment.enrolledAt)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{enrollment.completedAt ? formatDate(enrollment.completedAt) : 'Em andamento'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingEnrollment(enrollment); setEnrollmentDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeleteEnrollment(enrollment) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      {activeTab === 'progress' ? (
        progressRows.length === 0 ? (
          <EmptyState title="Nenhum progresso registrado" description="Crie registros de progresso para acompanhar a evolucao das aulas." />
        ) : (
          <DataTable columns={['Aluno', 'Curso', 'Aula', 'Status', 'Conclusao', 'Ações']}>
            {progressRows.map((progress) => {
              const user = data.users.find((item) => item.id === progress.userId)
              const lesson = data.lessons.find((item) => item.id === progress.lessonId)
              const module = data.modules.find((item) => item.id === lesson?.moduleId)
              const course = data.courses.find((item) => item.id === module?.courseId)

              return (
                <tr key={progress.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{course?.title ?? 'Curso nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{lesson?.title ?? 'Aula nao encontrada'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{progress.status}</td>
                  <td className="px-4 py-2.5 text-slate-600">{progress.completedAt ? formatDate(progress.completedAt) : 'Pendente'}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingProgress(progress); setProgressDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeleteProgress(progress) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      {activeTab === 'certificates' ? (
        certificateRows.length === 0 ? (
          <EmptyState title="Nenhum certificado emitido" description="Emita certificados para alunos concluintes e valide os codigos." />
        ) : (
          <DataTable columns={['Aluno', 'Referencia', 'Codigo', 'Emissao', 'Ações']}>
            {certificateRows.map((certificate) => {
              const user = data.users.find((item) => item.id === certificate.userId)
              const course = data.courses.find((item) => item.id === certificate.courseId)
              const track = data.tracks.find((item) => item.id === certificate.trackId)

              return (
                <tr key={certificate.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{track ? `${track.title} · ${course?.title ?? ''}` : course?.title ?? 'Curso nao encontrado'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{certificate.verificationCode}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(certificate.issuedAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingCertificate(certificate); setCertificateDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeleteCertificate(certificate) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      <UserDialog
        open={userDialogOpen}
        initialValue={editingUser}
        isSaving={isSaving}
        onOpenChange={(open) => { setUserDialogOpen(open); if (!open) setEditingUser(null) }}
        onSubmit={async (payload) => {
          if (editingUser) await updateUser(editingUser.id, payload)
          else await createUser(payload)
          setUserDialogOpen(false)
          setEditingUser(null)
        }}
      />

      <EnrollmentDialog
        open={enrollmentDialogOpen}
        initialValue={editingEnrollment}
        data={data}
        isSaving={isSaving}
        onOpenChange={(open) => { setEnrollmentDialogOpen(open); if (!open) setEditingEnrollment(null) }}
        onSubmit={async (payload) => {
          if (editingEnrollment) await updateEnrollment(editingEnrollment.id, payload)
          else await createEnrollment(payload)
          setEnrollmentDialogOpen(false)
          setEditingEnrollment(null)
        }}
      />

      <ProgressDialog
        open={progressDialogOpen}
        initialValue={editingProgress}
        data={data}
        isSaving={isSaving}
        onOpenChange={(open) => { setProgressDialogOpen(open); if (!open) setEditingProgress(null) }}
        onSubmit={async (payload) => {
          if (editingProgress) await updateLessonProgress(editingProgress.id, payload)
          else await createLessonProgress(payload)
          setProgressDialogOpen(false)
          setEditingProgress(null)
        }}
      />

      <CertificateDialog
        open={certificateDialogOpen}
        initialValue={editingCertificate}
        data={data}
        isSaving={isSaving}
        onOpenChange={(open) => { setCertificateDialogOpen(open); if (!open) setEditingCertificate(null) }}
        onSubmit={async (payload) => {
          if (editingCertificate) await updateCertificate(editingCertificate.id, payload)
          else await createCertificate(payload)
          setCertificateDialogOpen(false)
          setEditingCertificate(null)
        }}
      />
    </div>
  )
}
