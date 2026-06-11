import { CalendarClock, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { PlatformData } from '@/types/models'

interface PlanCardsProps {
  data: PlatformData
}

export function PlanCards({ data }: PlanCardsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {data.plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>{plan.durationMonths} meses</Badge>
              <CreditCard className="h-5 w-5 text-teal-700" />
            </div>
            <CardTitle className="mt-4 text-2xl">{plan.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{plan.description}</p>
            <p className="mt-5 text-3xl font-bold text-slate-900">
              {formatCurrency(plan.price)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <CalendarClock className="h-4 w-4" />
              Vigencia de {plan.durationMonths} mes(es)
            </div>
            <Button className="mt-6 w-full">Simular checkout</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
