import { GraduationCap, ShieldCheck, UserRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DashboardData } from '@/types/models'

interface UsersSummaryProps {
  data: DashboardData
}

export function UsersSummary({ data }: UsersSummaryProps) {
  const students = data.users.filter((user) => user.role === 'student').length
  const instructors = data.users.filter((user) => user.role === 'instructor').length
  const enrollmentRate = Math.round((data.enrollments.length / data.users.length) * 100)

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alunos cadastrados</CardTitle>
          <GraduationCap className="h-5 w-5 text-teal-700" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900">{students}</p>
          <p className="mt-2 text-sm">Base pronta para matriculas e progresso.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Instrutores</CardTitle>
          <ShieldCheck className="h-5 w-5 text-teal-700" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900">{instructors}</p>
          <p className="mt-2 text-sm">Relacionados aos cursos no seed inicial.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cobertura de matriculas</CardTitle>
          <UserRound className="h-5 w-5 text-teal-700" />
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-3xl font-bold text-slate-900">{enrollmentRate}%</p>
          <Progress value={enrollmentRate} />
        </CardContent>
      </Card>
    </div>
  )
}
