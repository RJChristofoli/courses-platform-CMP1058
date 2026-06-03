import { UserTable } from '@/components/users/user-table'
import { UsersSummary } from '@/components/users/users-summary'
import { EmptyState } from '@/components/ui/empty-state'
import { useDashboardData } from '@/hooks/use-dashboard-data'

export function UsersPage() {
  const { data, isLoading, error } = useDashboardData()

  if (isLoading) {
    return <div className="text-sm text-slate-500">Carregando usuarios...</div>
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Modulo de usuarios indisponivel"
        description={error ?? 'Nao foi possivel carregar os dados de usuarios e matriculas.'}
      />
    )
  }

  return (
    <div className="space-y-6">
      <UsersSummary data={data} />
      <UserTable data={data} />
    </div>
  )
}
