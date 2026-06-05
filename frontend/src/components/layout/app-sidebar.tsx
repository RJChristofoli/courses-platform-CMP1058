import { GraduationCap } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  return (
    <aside className="surface-grid hidden w-80 flex-col border-r border-white/70 bg-white/60 px-6 py-8 backdrop-blur xl:flex">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
            CMP1058
          </p>
          <h1 className="text-xl font-bold">Courses Platform</h1>
        </div>
      </div>

      <nav className="space-y-3">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-start gap-4 rounded-2xl border border-transparent px-4 py-4 transition-all hover:border-white hover:bg-white',
                  isActive && 'border-white bg-white shadow-soft',
                )
              }
              to={item.href}
            >
              <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-700 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
