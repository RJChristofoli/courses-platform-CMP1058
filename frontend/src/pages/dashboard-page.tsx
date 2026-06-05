import { CourseSpotlight } from '@/components/dashboard/course-spotlight'
import { StatsGrid } from '@/components/dashboard/stats-grid'
import { EmptyState } from '@/components/ui/empty-state'
import { useDashboardData } from '@/hooks/use-dashboard-data'

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

  return (
    <div className="space-y-6">
      <StatsGrid data={data} />
      <CourseSpotlight data={data} />
    </div>
  )
}
