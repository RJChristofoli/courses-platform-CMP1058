import { PaymentOverview } from '@/components/finance/payment-overview'
import { PlanCards } from '@/components/finance/plan-cards'
import { EmptyState } from '@/components/ui/empty-state'
import { useDashboardData } from '@/hooks/use-dashboard-data'

export function FinancePage() {
  const { data, isLoading, error } = useDashboardData()

  if (isLoading) {
    return <div className="text-sm text-slate-500">Carregando financeiro...</div>
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Modulo financeiro indisponivel"
        description={error ?? 'Nao foi possivel carregar planos e pagamentos.'}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PlanCards data={data} />
      <PaymentOverview data={data} />
    </div>
  )
}
