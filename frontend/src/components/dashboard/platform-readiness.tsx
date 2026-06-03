import { CheckCircle2, DatabaseZap, LayoutTemplate, Route } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const readinessItems = [
  {
    title: 'Infra em compose',
    description: 'Frontend e backend sobem juntos com um unico comando.',
    icon: DatabaseZap,
  },
  {
    title: 'Roteamento principal',
    description: 'Dashboard, catalogo, usuarios e financeiro ja estruturados.',
    icon: Route,
  },
  {
    title: 'Layout de produto',
    description: 'Sidebar, cabecalho e distribuicao visual prontos para escalar.',
    icon: LayoutTemplate,
  },
]

export function PlatformReadiness() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O que esta pronto nesta etapa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {readinessItems.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4"
            >
              <div className="rounded-2xl bg-white p-3 text-teal-700 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-1 text-sm">{item.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
