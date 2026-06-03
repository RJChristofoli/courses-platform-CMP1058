import { Plus } from 'lucide-react'
import { useState } from 'react'
import { TrackDialog } from '@/components/catalog/catalog-dialogs'
import { TrackPanel } from '@/components/catalog/track-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import type { Track } from '@/types/models'

export function CatalogTrackPage() {
  const { data, isSaving, createTrack, updateTrack, deleteTrack } = useCatalogOutlet()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)

  const catalog = data!

  async function handleDelete(track: Track) {
    if (!window.confirm(`Deseja remover a trilha "${track.title}"?`)) {
      return
    }

    await deleteTrack(track.id)
  }

  return (
    <div className="grid grid-cols-[1.35fr_0.72fr] gap-6">
      <TrackPanel
        data={catalog}
        onEdit={(track) => {
          setEditingTrack(track)
          setDialogOpen(true)
        }}
        onDelete={(track) => {
          void handleDelete(track)
        }}
      />

      <Card className="sticky top-4 h-fit">
        <CardHeader>
          <CardTitle>Gestao de trilhas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Construa jornadas por categoria e associe cursos na ordem ideal de aprendizagem.
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setEditingTrack(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova trilha
          </Button>
          <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
            Trilhas dependem de cursos existentes na mesma categoria. Primeiro organize os cursos, depois componha as jornadas.
          </div>
        </CardContent>
      </Card>

      <TrackDialog
        open={dialogOpen}
        initialValue={editingTrack}
        data={catalog}
        isSaving={isSaving}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingTrack(null)
          }
        }}
        onSubmit={async (payload) => {
          if (editingTrack) {
            await updateTrack(editingTrack.id, payload)
          } else {
            await createTrack(payload)
          }
          setDialogOpen(false)
          setEditingTrack(null)
        }}
      />
    </div>
  )
}
