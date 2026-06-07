import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActionMenu, CompactTabs, DataTable } from '@/components/ui/action-menu'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { PaymentDialog, PlanDialog, SubscriptionDialog } from '@/components/finance/finance-dialogs'
import { formatCurrency, formatDate } from '@/lib/utils'
import type {
  DashboardData,
  Payment,
  PaymentPayload,
  Plan,
  PlanPayload,
  Subscription,
  SubscriptionPayload,
} from '@/types/models'

interface FinanceWorkspaceProps {
  data: DashboardData
  isSaving: boolean
  createPlan: (payload: PlanPayload) => Promise<void>
  updatePlan: (planId: number, payload: PlanPayload) => Promise<void>
  deletePlan: (planId: number) => Promise<void>
  createSubscription: (payload: SubscriptionPayload) => Promise<void>
  updateSubscription: (subscriptionId: number, payload: SubscriptionPayload) => Promise<void>
  deleteSubscription: (subscriptionId: number) => Promise<void>
  createPayment: (payload: PaymentPayload) => Promise<void>
  updatePayment: (paymentId: number, payload: PaymentPayload) => Promise<void>
  deletePayment: (paymentId: number) => Promise<void>
}

const tabs = [
  { label: 'Planos', href: 'plans' },
  { label: 'Assinaturas', href: 'subscriptions' },
  { label: 'Pagamentos', href: 'payments' },
] as const

export function FinanceWorkspace({
  data,
  isSaving,
  createPlan,
  updatePlan,
  deletePlan,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  createPayment,
  updatePayment,
  deletePayment,
}: FinanceWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['href']>('plans')
  const [search, setSearch] = useState('')
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  const filteredPlans = useMemo(() => {
    return data.plans.filter((plan) => `${plan.name} ${plan.description}`.toLowerCase().includes(search.toLowerCase()))
  }, [data.plans, search])

  const filteredSubscriptions = useMemo(() => {
    return data.subscriptions.filter((subscription) => {
      const user = data.users.find((item) => item.id === subscription.userId)
      const plan = data.plans.find((item) => item.id === subscription.planId)
      return `${user?.fullName ?? ''} ${plan?.name ?? ''} ${subscription.status}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [data.plans, data.subscriptions, data.users, search])

  const filteredPayments = useMemo(() => {
    return data.payments.filter((payment) => {
      const subscription = data.subscriptions.find((item) => item.id === payment.subscriptionId)
      const user = data.users.find((item) => item.id === subscription?.userId)
      return `${user?.fullName ?? ''} ${payment.paymentMethod} ${payment.gatewayTransactionId}`.toLowerCase().includes(search.toLowerCase())
    })
  }, [data.payments, data.subscriptions, data.users, search])

  function getActionLabel() {
    if (activeTab === 'plans') return 'Plano'
    if (activeTab === 'subscriptions') return 'Assinatura'
    return 'Pagamento'
  }

  function openCreateDialog() {
    if (activeTab === 'plans') {
      setEditingPlan(null)
      setPlanDialogOpen(true)
      return
    }
    if (activeTab === 'subscriptions') {
      setEditingSubscription(null)
      setSubscriptionDialogOpen(true)
      return
    }
    setEditingPayment(null)
    setPaymentDialogOpen(true)
  }

  async function handleDeletePlan(plan: Plan) {
    const hasSubscriptions = data.subscriptions.some((subscription) => subscription.planId === plan.id)
    if (hasSubscriptions) {
      window.alert('Remova ou mova as assinaturas vinculadas antes de excluir este plano.')
      return
    }
    if (!window.confirm(`Deseja remover o plano "${plan.name}"?`)) return
    await deletePlan(plan.id)
  }

  async function handleDeleteSubscription(subscription: Subscription) {
    if (!window.confirm('Deseja remover esta assinatura?')) return
    await deleteSubscription(subscription.id)
  }

  async function handleDeletePayment(payment: Payment) {
    if (!window.confirm(`Deseja remover o pagamento ${payment.gatewayTransactionId}?`)) return
    await deletePayment(payment.id)
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

      {activeTab === 'plans' ? (
        filteredPlans.length === 0 ? (
          <EmptyState title="Nenhum plano encontrado" description="Cadastre um plano para iniciar a operacao comercial." />
        ) : (
          <DataTable columns={['Plano', 'Preco', 'Vigencia', 'Assinaturas', 'Ações']}>
            {filteredPlans.map((plan) => {
              const subscriptionsCount = data.subscriptions.filter((item) => item.planId === plan.id).length
              return (
                <tr key={plan.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{formatCurrency(plan.price)}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{plan.durationMonths} meses</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{subscriptionsCount}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingPlan(plan); setPlanDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeletePlan(plan) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      {activeTab === 'subscriptions' ? (
        filteredSubscriptions.length === 0 ? (
          <EmptyState title="Nenhuma assinatura encontrada" description="Crie assinaturas para vincular alunos aos planos disponiveis." />
        ) : (
          <DataTable columns={['Aluno', 'Plano', 'Inicio', 'Fim', 'Status', 'Pagamentos', 'Ações']}>
            {filteredSubscriptions.map((subscription) => {
              const user = data.users.find((item) => item.id === subscription.userId)
              const plan = data.plans.find((item) => item.id === subscription.planId)
              const paymentsCount = data.payments.filter((item) => item.subscriptionId === subscription.id).length

              return (
                <tr key={subscription.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{plan?.name ?? 'Plano nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(subscription.startDate)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(subscription.endDate)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{subscription.status}</td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate-600">{paymentsCount}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingSubscription(subscription); setSubscriptionDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeleteSubscription(subscription) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      {activeTab === 'payments' ? (
        filteredPayments.length === 0 ? (
          <EmptyState title="Nenhum pagamento encontrado" description="Registre pagamentos para acompanhar a receita da plataforma." />
        ) : (
          <DataTable columns={['Aluno', 'Plano', 'Valor', 'Metodo', 'Data', 'Transacao', 'Ações']}>
            {filteredPayments.map((payment) => {
              const subscription = data.subscriptions.find((item) => item.id === payment.subscriptionId)
              const user = data.users.find((item) => item.id === subscription?.userId)
              const plan = data.plans.find((item) => item.id === subscription?.planId)

              return (
                <tr key={payment.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{user?.fullName ?? 'Aluno nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{plan?.name ?? 'Plano nao encontrado'}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatCurrency(payment.amountPaid)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{payment.paymentMethod}</td>
                  <td className="px-4 py-2.5 text-slate-600">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{payment.gatewayTransactionId}</td>
                  <td className="px-4 py-2.5 text-right">
                    <ActionMenu items={[
                      { label: 'Editar', onSelect: () => { setEditingPayment(payment); setPaymentDialogOpen(true) } },
                      { label: 'Remover', tone: 'danger', onSelect: () => void handleDeletePayment(payment) },
                    ]} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        )
      ) : null}

      <PlanDialog
        open={planDialogOpen}
        initialValue={editingPlan}
        isSaving={isSaving}
        onOpenChange={(open) => { setPlanDialogOpen(open); if (!open) setEditingPlan(null) }}
        onSubmit={async (payload) => {
          if (editingPlan) await updatePlan(editingPlan.id, payload)
          else await createPlan(payload)
          setPlanDialogOpen(false)
          setEditingPlan(null)
        }}
      />

      <SubscriptionDialog
        open={subscriptionDialogOpen}
        initialValue={editingSubscription}
        data={data}
        isSaving={isSaving}
        onOpenChange={(open) => { setSubscriptionDialogOpen(open); if (!open) setEditingSubscription(null) }}
        onSubmit={async (payload) => {
          if (editingSubscription) await updateSubscription(editingSubscription.id, payload)
          else await createSubscription(payload)
          setSubscriptionDialogOpen(false)
          setEditingSubscription(null)
        }}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        initialValue={editingPayment}
        data={data}
        isSaving={isSaving}
        onOpenChange={(open) => { setPaymentDialogOpen(open); if (!open) setEditingPayment(null) }}
        onSubmit={async (payload) => {
          if (editingPayment) await updatePayment(editingPayment.id, payload)
          else await createPayment(payload)
          setPaymentDialogOpen(false)
          setEditingPayment(null)
        }}
      />
    </div>
  )
}
