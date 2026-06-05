import { MoreHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ActionMenuItem {
  label: string
  tone?: 'default' | 'danger'
  onSelect: () => void
}

interface ActionMenuProps {
  align?: 'left' | 'right'
  items: ActionMenuItem[]
  triggerClassName?: string
}

export function ActionMenu({ align = 'right', items, triggerClassName }: ActionMenuProps) {
  return (
    <details className="group relative">
      <summary
        className={cn(
          'flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900',
          triggerClassName,
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </summary>

      <div
        className={cn(
          'absolute top-10 z-20 min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg',
          align === 'right' ? 'right-0' : 'left-0',
        )}
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              'flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-50',
              item.tone === 'danger' ? 'text-rose-600' : 'text-slate-700',
            )}
            onClick={() => {
              item.onSelect()
              const details = document.activeElement?.closest('details') as HTMLDetailsElement | null
              if (details) {
                details.removeAttribute('open')
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  )
}

interface CompactTabsProps {
  tabs: Array<{ label: string; href: string }>
  activeHref: string
  onChange: (href: string) => void
}

export function CompactTabs({ tabs, activeHref, onChange }: CompactTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.href}
          type="button"
          className={cn(
            'h-9 rounded-md px-3.5 text-sm font-medium transition',
            activeHref === tab.href
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          )}
          onClick={() => onChange(tab.href)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface DataTableProps {
  columns: string[]
  children: ReactNode
}

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full table-fixed border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="border-b border-slate-200 px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
