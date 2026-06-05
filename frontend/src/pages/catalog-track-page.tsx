import { useCatalogOutlet } from '@/components/catalog/catalog-outlet'
import { TrackWorkspace } from '@/components/catalog/track-workspace'
import type { Track } from '@/types/models'

export function CatalogTrackPage() {
  const { data, createTrack, updateTrack, deleteTrack } = useCatalogOutlet()
  const catalog = data!

  async function handleDelete(track: Track) {
    if (!window.confirm(`Deseja remover a trilha "${track.title}"?`)) return
    await deleteTrack(track.id)
  }

  return (
    <TrackWorkspace
      data={catalog}
      onCreateTrack={createTrack}
      onUpdateTrack={updateTrack}
      onDeleteTrack={(track) => { void handleDelete(track) }}
    />
  )
}
