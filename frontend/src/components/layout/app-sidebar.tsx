import { GraduationCap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '@/config/navigation'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'surface-grid relative hidden shrink-0 flex-col border-r border-white/70 bg-white/60 py-6 backdrop-blur transition-[width,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:flex',
        collapsed ? 'w-24 px-3' : 'w-80 px-6',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
        aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <div className={cn('mb-8 flex items-center', collapsed ? 'justify-center' : 'gap-4')}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-out',
            collapsed ? 'w-0 translate-x-2 opacity-0' : 'w-auto translate-x-0 opacity-100',
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">CMP1058</p>
          <h1 className="whitespace-nowrap text-xl font-bold">Courses Platform</h1>
        </div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex rounded-2xl border border-transparent transition-all duration-300 hover:border-white hover:bg-white',
                  collapsed ? 'justify-center px-2 py-3' : 'items-start gap-4 px-4 py-4',
                  isActive && 'border-white bg-white shadow-soft',
                )
              }
              to={item.href}
              title={collapsed ? item.label : undefined}
            >
              <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-700 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700">
                <Icon className="h-5 w-5" />
              </div>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-out',
                  collapsed ? 'w-0 translate-x-2 opacity-0' : 'w-auto translate-x-0 opacity-100',
                )}
              >
                <p className="whitespace-nowrap font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 whitespace-nowrap text-sm text-slate-500">{item.description}</p>
              </div>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
