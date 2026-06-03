import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Category } from '@/types/models'

interface CatalogFiltersProps {
  categories: Category[]
  search: string
  selectedCategoryId: number | 'all'
  selectedLevel: string | 'all'
  onSearchChange: (value: string) => void
  onCategoryChange: (value: number | 'all') => void
  onLevelChange: (value: string | 'all') => void
}

export function CatalogFilters({
  categories,
  search,
  selectedCategoryId,
  selectedLevel,
  onSearchChange,
  onCategoryChange,
  onLevelChange,
}: CatalogFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Explorar catalogo</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-[1.3fr_0.8fr_0.8fr] gap-4">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Busca por titulo ou descricao
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Ex.: React, dados, produto"
            />
          </div>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Categoria
          <select
            className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedCategoryId}
            onChange={(event) => {
              const value = event.target.value
              onCategoryChange(value === 'all' ? 'all' : Number(value))
            }}
          >
            <option value="all">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Nivel
          <select
            className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedLevel}
            onChange={(event) => onLevelChange(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediario">Intermediario</option>
            <option value="Avancado">Avancado</option>
          </select>
        </label>
      </CardContent>
    </Card>
  )
}
