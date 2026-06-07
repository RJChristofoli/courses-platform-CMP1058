import { FinanceWorkspace } from '@/components/finance/finance-workspace'
import { EmptyState } from '@/components/ui/empty-state'
import { usePlatformAdmin } from '@/hooks/use-platform-admin'

export function FinancePage() {
  const admin = usePlatformAdmin()

  if (admin.isLoading) {
    return <div className="text-sm text-slate-500">Carregando financeiro...</div>
  }

  if (admin.error || !admin.data) {
    return (
      <EmptyState
        title="Modulo financeiro indisponivel"
        description={admin.error ?? 'Nao foi possivel carregar planos, assinaturas e pagamentos.'}
      />
    )
  }

  return (
    <FinanceWorkspace
      data={admin.data}
      isSaving={admin.isSaving}
      createPlan={admin.createPlan}
      updatePlan={admin.updatePlan}
      deletePlan={admin.deletePlan}
      createSubscription={admin.createSubscription}
      updateSubscription={admin.updateSubscription}
      deleteSubscription={admin.deleteSubscription}
      createPayment={admin.createPayment}
      updatePayment={admin.updatePayment}
      deletePayment={admin.deletePayment}
    />
  )
}
