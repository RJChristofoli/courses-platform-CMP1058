import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/ui/empty-state'
import { CompactTabs } from '@/components/ui/action-menu'
import { useAcademicCatalog } from '@/hooks/use-academic-catalog'

const catalogTabs = [
  { label: 'Categorias', href: '/catalogo/categoria' },
  { label: 'Cursos', href: '/catalogo/curso' },
  { label: 'Estrutura', href: '/catalogo/estrutura' },
  { label: 'Trilhas', href: '/catalogo/trilha' },
] as const

export function CatalogShell() {
  const catalog = useAcademicCatalog()
  const location = useLocation()
  const navigate = useNavigate()

  if (catalog.isLoading) {
    return <div className="text-sm text-slate-500">Carregando catalogo academico...</div>
  }

  if (catalog.error || !catalog.data) {
    return (
      <EmptyState
        title="Catalogo indisponivel"
        description={catalog.error ?? 'Nao foi possivel carregar o modulo de catalogo.'}
      />
    )
  }

  return (
    <div className="space-y-3 pb-4">
      <CompactTabs
        tabs={[...catalogTabs]}
        activeHref={location.pathname}
        onChange={(href) => navigate(href)}
      />
      <Outlet context={catalog} />
    </div>
  )
}
