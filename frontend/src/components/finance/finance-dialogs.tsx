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
import { Textarea } from '@/components/ui/textarea'
import type {
  DashboardData,
  Payment,
  PaymentPayload,
  Plan,
  PlanPayload,
  Subscription,
  SubscriptionPayload,
} from '@/types/models'

interface PlanDialogProps {
  open: boolean
  initialValue: Plan | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: PlanPayload) => Promise<void>
}

export function PlanDialog({ open, initialValue, isSaving, onOpenChange, onSubmit }: PlanDialogProps) {
  const [form, setForm] = useState<PlanPayload>({ name: '', description: '', price: 0, durationMonths: 1 })

  useEffect(() => {
    setForm({
      name: initialValue?.name ?? '',
      description: initialValue?.description ?? '',
      price: initialValue?.price ?? 0,
      durationMonths: initialValue?.durationMonths ?? 1,
    })
  }, [initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar plano' : 'Novo plano'}</DialogTitle>
          <DialogDescription>Configure os planos comerciais da plataforma.</DialogDescription>
        </DialogHeader>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={(event) => { event.preventDefault(); void onSubmit(form) }}>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Nome</span>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Descricao</span>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Preco</span>
            <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Duracao (meses)</span>
            <Input type="number" min="1" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })} />
          </label>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar plano'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface SubscriptionDialogProps {
  open: boolean
  initialValue: Subscription | null
  data: DashboardData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: SubscriptionPayload) => Promise<void>
}

export function SubscriptionDialog({ open, initialValue, data, isSaving, onOpenChange, onSubmit }: SubscriptionDialogProps) {
  const [form, setForm] = useState<SubscriptionPayload>({
    userId: 0,
    planId: 0,
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: 'active',
  })

  useEffect(() => {
    setForm({
      userId: initialValue?.userId ?? data.users.find((user) => user.role === 'student')?.id ?? 0,
      planId: initialValue?.planId ?? data.plans[0]?.id ?? 0,
      startDate: initialValue?.startDate ?? new Date().toISOString(),
      endDate: initialValue?.endDate ?? new Date().toISOString(),
      status: initialValue?.status ?? 'active',
    })
  }, [data.plans, data.users, initialValue, open])

  const availableStudents = data.users.filter((user) => user.role === 'student')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar assinatura' : 'Nova assinatura'}</DialogTitle>
          <DialogDescription>Associe alunos a planos e controle a vigencia.</DialogDescription>
        </DialogHeader>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={(event) => { event.preventDefault(); void onSubmit(form) }}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Aluno</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.userId} onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}>
              {availableStudents.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Plano</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.planId} onChange={(e) => setForm({ ...form, planId: Number(e.target.value) })}>
              {data.plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Inicio</span>
            <Input type="date" value={form.startDate.slice(0, 10)} onChange={(e) => setForm({ ...form, startDate: new Date(e.target.value).toISOString() })} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Fim</span>
            <Input type="date" value={form.endDate.slice(0, 10)} onChange={(e) => setForm({ ...form, endDate: new Date(e.target.value).toISOString() })} />
          </label>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SubscriptionPayload['status'] })}>
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="cancelled">Cancelada</option>
              <option value="expired">Expirada</option>
            </select>
          </label>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar assinatura'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface PaymentDialogProps {
  open: boolean
  initialValue: Payment | null
  data: DashboardData
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: PaymentPayload) => Promise<void>
}

export function PaymentDialog({ open, initialValue, data, isSaving, onOpenChange, onSubmit }: PaymentDialogProps) {
  const [form, setForm] = useState<PaymentPayload>({
    subscriptionId: 0,
    amountPaid: 0,
    paymentDate: new Date().toISOString(),
    paymentMethod: 'Cartao',
    gatewayTransactionId: '',
  })

  useEffect(() => {
    setForm({
      subscriptionId: initialValue?.subscriptionId ?? data.subscriptions[0]?.id ?? 0,
      amountPaid: initialValue?.amountPaid ?? 0,
      paymentDate: initialValue?.paymentDate ?? new Date().toISOString(),
      paymentMethod: initialValue?.paymentMethod ?? 'Cartao',
      gatewayTransactionId: initialValue?.gatewayTransactionId ?? `TRX-${Date.now()}`,
    })
  }, [data.subscriptions, initialValue, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar pagamento' : 'Novo pagamento'}</DialogTitle>
          <DialogDescription>Registre pagamentos vinculados a assinaturas e transacoes.</DialogDescription>
        </DialogHeader>
        <form className="mt-6 grid grid-cols-2 gap-4" onSubmit={(event) => { event.preventDefault(); void onSubmit(form) }}>
          <label className="col-span-2 space-y-2 text-sm font-medium text-slate-700">
            <span>Assinatura</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.subscriptionId} onChange={(e) => setForm({ ...form, subscriptionId: Number(e.target.value) })}>
              {data.subscriptions.map((subscription) => {
                const user = data.users.find((item) => item.id === subscription.userId)
                const plan = data.plans.find((item) => item.id === subscription.planId)
                return <option key={subscription.id} value={subscription.id}>{user?.fullName ?? 'Aluno'} · {plan?.name ?? 'Plano'}</option>
              })}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Valor pago</span>
            <Input type="number" min="0" step="0.01" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Metodo</span>
            <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="Cartao">Cartao</option>
              <option value="Pix">Pix</option>
              <option value="Boleto">Boleto</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Data do pagamento</span>
            <Input type="date" value={form.paymentDate.slice(0, 10)} onChange={(e) => setForm({ ...form, paymentDate: new Date(e.target.value).toISOString() })} />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Transacao</span>
            <Input value={form.gatewayTransactionId} onChange={(e) => setForm({ ...form, gatewayTransactionId: e.target.value })} required />
          </label>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar pagamento'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
