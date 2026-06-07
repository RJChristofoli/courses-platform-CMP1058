import { AlertCircle, ArrowRightLeft, BookOpen, CreditCard, Medal, Users } from 'lucide-react'
import { ActionMenu, DataTable } from '@/components/ui/action-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { formatCurrency, formatDate } from '@/lib/utils'

export function DashboardPage() {
  const { data, isLoading, error } = useDashboardData()

  if (isLoading) {
    return <div className="text-sm text-slate-500">Carregando dados da plataforma...</div>
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Nao foi possivel abrir o dashboard"
        description={error ?? 'Os dados iniciais nao estao disponiveis no momento.'}
      />
    )
  }

  const revenue = data.payments.reduce((sum, payment) => sum + payment.amountPaid, 0)
  const activeSubscriptions = data.subscriptions.filter((subscription) => subscription.status === 'active').length
  const certificatesIssued = data.certificates.length
  const coursesNeedingStructure = data.courses
    .map((course) => {
      const modules = data.modules.filter((module) => module.courseId === course.id)
      const lessons = data.lessons.filter((lesson) => modules.some((module) => module.id === lesson.moduleId))
      const trackCount = data.trackCourses.filter((relation) => relation.courseId === course.id).length
      return { course, modulesCount: modules.length, lessonsCount: lessons.length, trackCount }
    })
    .sort((left, right) => (left.lessonsCount + left.modulesCount) - (right.lessonsCount + right.modulesCount))
    .slice(0, 5)

  const enrollmentProgress = data.enrollments
    .map((enrollment) => {
      const modules = data.modules.filter((module) => module.courseId === enrollment.courseId)
      const lessons = data.lessons.filter((lesson) => modules.some((module) => module.id === lesson.moduleId))
      const completed = data.lessonProgress.filter((progress) => progress.userId === enrollment.userId && progress.status === 'Concluido' && lessons.some((lesson) => lesson.id === progress.lessonId)).length
      const percentage = lessons.length ? Math.round((completed / lessons.length) * 100) : 0
      return { enrollment, percentage }
    })
    .sort((left, right) => left.percentage - right.percentage)
    .slice(0, 5)

  const subscriptionWatchlist = [...data.subscriptions]
    .sort((left, right) => new Date(left.endDate).getTime() - new Date(right.endDate).getTime())
    .slice(0, 5)

  const recentPayments = [...data.payments]
    .sort((left, right) => new Date(right.paymentDate).getTime() - new Date(left.paymentDate).getTime())
    .slice(0, 5)

  const stats = [
    { label: 'Usuarios', value: data.users.length, helper: 'Base ativa entre alunos e instrutores', icon: Users },
    { label: 'Cursos', value: data.courses.length, helper: 'Catalogo disponivel para matriculas', icon: BookOpen },
    { label: 'Assinaturas ativas', value: activeSubscriptions, helper: 'Planos vigentes acompanhados no financeiro', icon: ArrowRightLeft },
    { label: 'Receita simulada', value: formatCurrency(revenue), helper: `${certificatesIssued} certificado(s) emitido(s)`, icon: CreditCard },
  ] as const

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <CardTitle className="mt-2 text-2xl">{stat.value}</CardTitle>
                </div>
                <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">{stat.helper}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cursos que pedem estrutura</CardTitle>
          </CardHeader>
          <CardContent>
            {coursesNeedingStructure.length === 0 ? (
              <EmptyState title="Nenhum curso pendente" description="Todos os cursos possuem estrutura minima cadastrada." />
            ) : (
              <DataTable columns={['Curso', 'Modulos', 'Aulas', 'Trilhas', 'Ações']}>
                {coursesNeedingStructure.map(({ course, modulesCount, lessonsCount, trackCount }) => (
                  <tr key={course.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{course.title}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{modulesCount}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{lessonsCount}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{trackCount}</td>
                    <td className="px-4 py-2.5 text-right">
                      <ActionMenu items={[{ label: 'Revisar no catalogo', onSelect: () => window.location.assign('/catalogo/estrutura') }]} />
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Alertas operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <p className="font-medium">{coursesNeedingStructure.length} curso(s) com baixa densidade de conteudo</p>
              </div>
              <p className="mt-1 text-sm text-amber-700">Priorize cursos com poucos modulos ou aulas antes de ampliar o catalogo.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Medal className="h-4 w-4" />
                <p className="font-medium">{data.certificates.length} certificado(s) emitido(s)</p>
              </div>
              <p className="mt-1 text-sm text-slate-600">Use o modulo de usuarios para validar codigos e acompanhar conclusoes.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Alunos com menor progresso</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollmentProgress.length === 0 ? (
              <EmptyState title="Sem progresso registrado" description="Crie matriculas e conclua aulas para popular este painel." />
            ) : (
              <DataTable columns={['Aluno', 'Curso', 'Progresso', 'Matricula']}>
                {enrollmentProgress.map(({ enrollment, percentage }) => {
                  const user = data.users.find((item) => item.id === enrollment.userId)
                  const course = data.courses.find((item) => item.id === enrollment.courseId)
                  return (
                    <tr key={enrollment.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</td>
                      <td className="px-4 py-2.5 text-slate-600">{course?.title ?? 'Curso nao encontrado'}</td>
                      <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{percentage}%</td>
                      <td className="px-4 py-2.5 text-slate-600">{formatDate(enrollment.enrolledAt)}</td>
                    </tr>
                  )
                })}
              </DataTable>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Assinaturas e pagamentos recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Vencimento proximo</p>
              <div className="space-y-2">
                {subscriptionWatchlist.map((subscription) => {
                  const user = data.users.find((item) => item.id === subscription.userId)
                  const plan = data.plans.find((item) => item.id === subscription.planId)
                  return (
                    <div key={subscription.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</p>
                        <p className="text-slate-500">{plan?.name ?? 'Plano nao encontrado'} · {subscription.status}</p>
                      </div>
                      <span className="text-slate-500">{formatDate(subscription.endDate)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Pagamentos recentes</p>
              <div className="space-y-2">
                {recentPayments.map((payment) => {
                  const subscription = data.subscriptions.find((item) => item.id === payment.subscriptionId)
                  const user = data.users.find((item) => item.id === subscription?.userId)
                  return (
                    <div key={payment.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</p>
                        <p className="text-slate-500">{payment.paymentMethod} · {payment.gatewayTransactionId}</p>
                      </div>
                      <span className="text-slate-500">{formatCurrency(payment.amountPaid)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
