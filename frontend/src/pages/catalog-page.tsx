import { CategoryOverview } from '@/components/catalog/category-overview'
import { TrackList } from '@/components/catalog/track-list'
import { EmptyState } from '@/components/ui/empty-state'
import { useDashboardData } from '@/hooks/use-dashboard-data'

export function CatalogPage() {
  const { data, isLoading, error } = useDashboardData()

  if (isLoading) {
    return <div className="text-sm text-slate-500">Carregando catalogo...</div>
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Catalogo indisponivel"
        description={error ?? 'Nao foi possivel carregar cursos, categorias e trilhas.'}
      />
    )
  }

  return (
    <div className="space-y-6">
      <CategoryOverview data={data} />
      <TrackList data={data} />
    </div>
  )
}
