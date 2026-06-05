import { GripVertical, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ActionMenu } from '@/components/ui/action-menu'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AcademicCatalogData, Track, TrackPayload } from '@/types/models'

interface TrackWorkspaceProps {
  data: AcademicCatalogData
  onCreateTrack: (payload: TrackPayload) => Promise<void>
  onUpdateTrack: (trackId: number, payload: TrackPayload) => Promise<void>
  onDeleteTrack: (track: Track) => void
}

export function TrackWorkspace({ data, onCreateTrack, onUpdateTrack, onDeleteTrack }: TrackWorkspaceProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [trackForm, setTrackForm] = useState<TrackPayload | null>(null)
  const [search, setSearch] = useState('')
  const [courseSearch, setCourseSearch] = useState('')
  const [dragCourseId, setDragCourseId] = useState<number | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const tracks = useMemo(
    () => data.tracks.filter((track) => track.title.toLowerCase().includes(search.toLowerCase())),
    [data.tracks, search],
  )
  const selectedTrack = data.tracks.find((track) => track.id === selectedTrackId) ?? null

  useEffect(() => {
    if (tracks.length === 0) {
      setSelectedTrackId(null)
      return
    }
    setSelectedTrackId((current) => (current && tracks.some((track) => track.id === current) ? current : tracks[0].id))
  }, [tracks])

  useEffect(() => {
    if (!selectedTrack) {
      setTrackForm(null)
      return
    }
    const courseIds = data.trackCourses
      .filter((relation) => relation.trackId === selectedTrack.id)
      .sort((left, right) => left.order - right.order)
      .map((relation) => relation.courseId)

    setTrackForm({
      title: selectedTrack.title,
      description: selectedTrack.description,
      categoryId: selectedTrack.categoryId,
      courseIds,
    })
  }, [data.trackCourses, selectedTrack])

  const availableCourses = useMemo(() => {
    if (!trackForm) return []
    return data.courses.filter((course) => {
      const sameCategory = course.categoryId === trackForm.categoryId
      const notSelected = !trackForm.courseIds.includes(course.id)
      const matchesSearch = course.title.toLowerCase().includes(courseSearch.toLowerCase())
      return sameCategory && notSelected && matchesSearch
    })
  }, [courseSearch, data.courses, trackForm])

  async function saveTrack() {
    if (!trackForm) return
    if (selectedTrack) {
      await onUpdateTrack(selectedTrack.id, trackForm)
    } else {
      await onCreateTrack(trackForm)
    }
  }

  function reorderCourses(targetCourseId: number) {
    if (!trackForm || dragCourseId === null) return
    const ordered = [...trackForm.courseIds]
    const from = ordered.indexOf(dragCourseId)
    const to = ordered.indexOf(targetCourseId)
    if (from === -1 || to === -1) return
    const [moved] = ordered.splice(from, 1)
    ordered.splice(to, 0, moved)
    setTrackForm({ ...trackForm, courseIds: ordered })
    setDragCourseId(null)
  }

  return (
    <div className="grid min-h-[720px] grid-cols-[28%_72%] gap-4 xl:min-h-[760px]">
      <section className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Trilhas</p>
          <Button
            size="sm"
            onClick={() => {
              setSelectedTrackId(null)
              setTrackForm({
                title: 'Nova trilha',
                description: '',
                categoryId: data.categories[0]?.id ?? 0,
                courseIds: [],
              })
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Trilha
          </Button>
        </div>
        <div className="border-b border-slate-200 px-4 py-3">
          <Input className="h-9" placeholder="Buscar trilha" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          {tracks.length === 0 ? (
            <EmptyState
              className="m-4"
              title="Nenhuma trilha encontrada"
              description="Crie ou localize uma trilha para organizar a jornada de aprendizagem."
            />
          ) : null}

          {tracks.map((track) => {
            const count = data.trackCourses.filter((relation) => relation.trackId === track.id).length
            return (
              <button
                key={track.id}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50',
                  selectedTrackId === track.id && 'bg-slate-100',
                )}
                onClick={() => setSelectedTrackId(track.id)}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{track.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{count} curso(s)</p>
                </div>
                <ActionMenu
                  items={[
                    { label: 'Editar', onSelect: () => setSelectedTrackId(track.id) },
                    { label: 'Remover', tone: 'danger', onSelect: () => onDeleteTrack(track) },
                  ]}
                />
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid min-h-0 grid-cols-[58%_42%] gap-4">
        <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Fluxo da trilha</p>
              <p className="mt-1 text-xs text-slate-500">
                {trackForm ? 'Reordene os cursos para definir a progressao da aprendizagem.' : 'Selecione uma trilha.'}
              </p>
            </div>
            {trackForm ? (
              <button
                type="button"
                className="text-sm font-medium text-slate-600 hover:text-slate-950"
                onClick={() => setShowQuickAdd((current) => !current)}
              >
                + Adicionar curso
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            {!trackForm ? <p className="text-sm text-slate-500">Selecione uma trilha.</p> : null}

            {trackForm && trackForm.courseIds.length === 0 ? (
              <EmptyState
                title="Nenhum curso adicionado a trilha"
                description="Busque um curso no painel lateral para comecar."
                action={
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-700 hover:text-slate-950"
                    onClick={() => setShowQuickAdd(true)}
                  >
                    + Adicionar curso
                  </button>
                }
              />
            ) : null}

            {showQuickAdd && trackForm ? (
              <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">Adicionar curso na sequencia</p>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 hover:text-slate-900"
                    onClick={() => setShowQuickAdd(false)}
                  >
                    Fechar
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {availableCourses.slice(0, 5).map((course) => {
                    const category = data.categories.find((category) => category.id === course.categoryId)?.name ?? 'Sem categoria'
                    return (
                      <button
                        key={course.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
                        onClick={() => setTrackForm({ ...trackForm, courseIds: [...trackForm.courseIds, course.id] })}
                      >
                        <span>
                          <span className="font-medium text-slate-900">{course.title}</span>
                          <span className="ml-2 text-slate-500">{category} · {course.level}</span>
                        </span>
                        <Plus className="h-4 w-4 text-slate-400" />
                      </button>
                    )
                  })}
                  {availableCourses.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum curso disponivel para esta categoria.</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {trackForm?.courseIds.map((courseId, index) => {
              const course = data.courses.find((item) => item.id === courseId)
              const category = data.categories.find((item) => item.id === course?.categoryId)?.name ?? 'Sem categoria'

              return (
                <div
                  key={courseId}
                  className="mb-3 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                  draggable
                  onDragStart={() => setDragCourseId(courseId)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => reorderCourses(courseId)}
                >
                  <GripVertical className="mt-1 h-4 w-4 text-slate-400" />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{course?.title ?? 'Curso nao encontrado'}</p>
                    <p className="mt-1 text-xs text-slate-500">{category} · {course?.level ?? 'Nivel indefinido'}</p>
                  </div>
                  <ActionMenu
                    items={[
                      {
                        label: 'Remover da trilha',
                        tone: 'danger',
                        onSelect: () => {
                          if (!trackForm) return
                          setTrackForm({
                            ...trackForm,
                            courseIds: trackForm.courseIds.filter((id) => id !== courseId),
                          })
                        },
                      },
                    ]}
                  />
                </div>
              )
            })}

            {trackForm && trackForm.courseIds.length > 0 ? (
              <button
                type="button"
                className="mt-1 text-sm font-medium text-slate-600 hover:text-slate-950"
                onClick={() => setShowQuickAdd(true)}
              >
                + Adicionar curso
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Propriedades</p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">
            {trackForm ? (
              <div className="space-y-4">
                <label className="block space-y-1.5 text-sm text-slate-700">
                  <span className="font-medium">Titulo</span>
                  <Input value={trackForm.title} onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })} />
                </label>
                <label className="block space-y-1.5 text-sm text-slate-700">
                  <span className="font-medium">Categoria</span>
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                    value={trackForm.categoryId}
                    onChange={(e) => setTrackForm({ ...trackForm, categoryId: Number(e.target.value), courseIds: [] })}
                  >
                    {data.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5 text-sm text-slate-700">
                  <span className="font-medium">Descricao</span>
                  <textarea
                    className="min-h-28 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    value={trackForm.description}
                    onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  />
                </label>
                <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">Adicionar curso</p>
                  <Input
                    className="h-9"
                    placeholder="Buscar curso"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                  <div className="max-h-60 overflow-auto">
                    {availableCourses.map((course) => {
                      const category = data.categories.find((item) => item.id === course.categoryId)?.name ?? 'Sem categoria'
                      return (
                        <button
                          key={course.id}
                          type="button"
                          className="flex w-full items-center justify-between border-b border-slate-100 px-2 py-2 text-left text-sm hover:bg-slate-50"
                          onClick={() => setTrackForm({ ...trackForm, courseIds: [...trackForm.courseIds, course.id] })}
                        >
                          <span>
                            <span className="font-medium text-slate-900">{course.title}</span>
                            <span className="ml-2 text-slate-500">{category} · {course.level}</span>
                          </span>
                          <Plus className="h-4 w-4 text-slate-400" />
                        </button>
                      )
                    })}
                    {availableCourses.length === 0 ? (
                      <p className="px-2 py-2 text-sm text-slate-500">Nenhum curso disponivel para adicionar.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Selecione ou crie uma trilha.</p>
            )}
          </div>
          <div className="border-t border-slate-200 px-4 py-3">
            <Button className="w-full" disabled={!trackForm} onClick={() => void saveTrack()}>
              Salvar trilha
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
