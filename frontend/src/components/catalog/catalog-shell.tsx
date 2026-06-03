import { FolderKanban, BookOpen, Layers3 } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { EmptyState } from '@/components/ui/empty-state'
import { useAcademicCatalog } from '@/hooks/use-academic-catalog'
import { cn } from '@/lib/utils'

const catalogSections = [
  {
    label: 'Categorias',
    description: 'Estruture os agrupadores do catalogo.',
    href: '/catalogo/categoria',
    icon: FolderKanban,
  },
  {
    label: 'Cursos',
    description: 'Gerencie a vitrine academica principal.',
    href: '/catalogo/curso',
    icon: BookOpen,
  },
  {
    label: 'Trilhas',
    description: 'Organize jornadas e sequencias de estudo.',
    href: '/catalogo/trilha',
    icon: Layers3,
  },
] as const

export function CatalogShell() {
  const catalog = useAcademicCatalog()

  if (catalog.isLoading) {
    return <div className="text-sm text-slate-500">Carregando catalogo academico...</div>
  }

  if (catalog.error || !catalog.data) {
    return (
      <EmptyState
        title="Catalogo indisponivel"
        description={catalog.error ?? 'Nao foi possivel carregar cursos, categorias e trilhas.'}
      />
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-soft backdrop-blur">
        <div className="grid grid-cols-3 gap-3">
          {catalogSections.map((section) => {
            const Icon = section.icon

            return (
              <NavLink
                key={section.href}
                to={section.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-start gap-4 rounded-[1.5rem] border border-transparent px-5 py-5 transition-all hover:border-teal-100 hover:bg-slate-50',
                    isActive && 'border-teal-100 bg-teal-50/70 shadow-sm',
                  )
                }
              >
                <div className="rounded-2xl bg-white p-3 text-teal-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{section.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>
              </NavLink>
            )
          })}
        </div>
      </section>

      <Outlet context={catalog} />
    </div>
  )
}
