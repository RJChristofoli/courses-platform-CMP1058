import { Plus } from 'lucide-react'
import { useState } from 'react'
import { CategoryDialog } from '@/components/catalog/catalog-dialogs'
import { CategoryPanel } from '@/components/catalog/category-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import type { Category } from '@/types/models'

export function CatalogCategoryPage() {
  const { data, isSaving, createCategory, updateCategory, deleteCategory } = useCatalogOutlet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const categories = data!

  async function handleDelete(category: Category) {
    const hasDependencies =
      categories.courses.some((course) => course.categoryId === category.id) ||
      categories.tracks.some((track) => track.categoryId === category.id)

    if (hasDependencies) {
      window.alert('Remova ou mova os cursos e trilhas relacionados antes de excluir esta categoria.')
      return
    }

    if (!window.confirm(`Deseja remover a categoria "${category.name}"?`)) {
      return
    }

    await deleteCategory(category.id)
  }

  return (
    <div className="grid grid-cols-[1.35fr_0.72fr] gap-6">
      <CategoryPanel
        data={categories}
        onEdit={(category) => {
          setEditingCategory(category)
          setDialogOpen(true)
        }}
        onDelete={(category) => {
          void handleDelete(category)
        }}
      />

      <Card className="sticky top-4 h-fit">
        <CardHeader>
          <CardTitle>Gestao de categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Use categorias para organizar o portifolio academico e direcionar a criacao de trilhas.
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setEditingCategory(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova categoria
          </Button>
          <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
            Antes de excluir uma categoria, garanta que cursos e trilhas tenham sido reclassificados.
          </div>
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        initialValue={editingCategory}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingCategory(null)
          }
        }}
        onSubmit={async (payload) => {
          if (editingCategory) {
            await updateCategory(editingCategory.id, payload)
          } else {
            await createCategory(payload)
          }
          setDialogOpen(false)
          setEditingCategory(null)
        }}
      />
    </div>
  )
}
