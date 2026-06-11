import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PlatformData } from '@/types/models'

interface PaymentOverviewProps {
  data: PlatformData
}

export function PaymentOverview({ data }: PaymentOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos simulados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {formatCurrency(payment.amountPaid)}
                </p>
                <Badge variant="outline">{payment.paymentMethod}</Badge>
              </div>
              <p className="mt-2 text-sm">Transacao: {payment.gatewayTransactionId}</p>
            </div>
            <p className="text-sm text-slate-500">{formatDate(payment.paymentDate)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
