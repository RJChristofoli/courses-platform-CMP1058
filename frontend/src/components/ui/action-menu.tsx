import { MoreHorizontal } from 'lucide-react'
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return

    const updatePosition = () => {
      if (!triggerRef.current || !menuRef.current) return
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const menuRect = menuRef.current.getBoundingClientRect()
      const margin = 8
      const top = Math.min(triggerRect.bottom + margin, window.innerHeight - menuRect.height - margin)
      const left =
        align === 'right'
          ? Math.max(margin, triggerRect.right - menuRect.width)
          : Math.min(triggerRect.left, window.innerWidth - menuRect.width - margin)

      setPosition({ top, left })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [align, open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      setOpen(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900',
          triggerClassName,
        )}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[120] min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
              style={{ top: position.top, left: position.left }}
              onClick={(event) => event.stopPropagation()}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={cn(
                    'flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition hover:bg-slate-50',
                    item.tone === 'danger' ? 'text-rose-600' : 'text-slate-700',
                  )}
                  onClick={(event) => {
                    event.stopPropagation()
                    item.onSelect()
                    setOpen(false)
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

interface CompactTabsProps {
  tabs: Array<{ label: string; href: string }>
  activeHref: string
  onChange: (href: string) => void
}

export function CompactTabs({ tabs, activeHref, onChange }: CompactTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
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
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border-collapse text-sm">
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
    </div>
  )
}
