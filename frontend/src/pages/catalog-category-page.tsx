import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CategoryDialog } from '@/components/catalog/catalog-dialogs'
import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import { CategoryTable } from '@/components/catalog/category-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Category } from '@/types/models'

export function CatalogCategoryPage() {
  const { data, isSaving, createCategory, updateCategory, deleteCategory } = useCatalogOutlet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [search, setSearch] = useState('')

  const catalog = data!
  const filtered = useMemo(
    () => catalog.categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())),
    [catalog.categories, search],
  )

  async function handleDelete(category: Category) {
    const hasDependencies =
      catalog.courses.some((course) => course.categoryId === category.id) ||
      catalog.tracks.some((track) => track.categoryId === category.id)

    if (hasDependencies) {
      window.alert('Remova ou mova os cursos e trilhas relacionados antes de excluir esta categoria.')
      return
    }

    if (!window.confirm(`Deseja remover a categoria "${category.name}"?`)) return
    await deleteCategory(category.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input className="h-10 max-w-sm" placeholder="Buscar categoria" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button onClick={() => { setEditingCategory(null); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          Categoria
        </Button>
      </div>

      <CategoryTable
        data={{ ...catalog, categories: filtered }}
        onEdit={(category) => { setEditingCategory(category); setDialogOpen(true) }}
        onDelete={(category) => { void handleDelete(category) }}
      />

      <CategoryDialog
        open={dialogOpen}
        initialValue={editingCategory}
        isSaving={isSaving}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingCategory(null) }}
        onSubmit={async (payload) => {
          if (editingCategory) await updateCategory(editingCategory.id, payload)
          else await createCategory(payload)
          setDialogOpen(false)
          setEditingCategory(null)
        }}
      />
    </div>
  )
}
