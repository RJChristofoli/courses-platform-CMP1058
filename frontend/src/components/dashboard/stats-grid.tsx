import { BookOpen, CreditCard, Layers3, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { DashboardData } from '@/types/models'

interface StatsGridProps {
  data: DashboardData
}

const statsConfig = [
  {
    label: 'Cursos publicados',
    icon: BookOpen,
    getValue: (data: DashboardData) => data.courses.length,
    helper: 'Catalogo pronto para evolucao',
  },
  {
    label: 'Usuarios ativos',
    icon: Users,
    getValue: (data: DashboardData) => data.users.length,
    helper: 'Entre alunos e instrutores',
  },
  {
    label: 'Modulos estruturados',
    icon: Layers3,
    getValue: (data: DashboardData) => data.modules.length,
    helper: 'Base de hierarquia academica',
  },
  {
    label: 'Receita simulada',
    icon: CreditCard,
    getValue: (data: DashboardData) =>
      formatCurrency(
        data.payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
      ),
    helper: 'Pagamentos carregados via JSON Server',
  },
] as const

export function StatsGrid({ data }: StatsGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <CardTitle className="mt-3 text-3xl">{stat.getValue(data)}</CardTitle>
              </div>
              <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
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
  )
}
