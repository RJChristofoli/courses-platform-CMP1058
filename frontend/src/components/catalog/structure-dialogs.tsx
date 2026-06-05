import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Lesson, LessonPayload, Module, ModulePayload } from '@/types/models'

interface ModuleDialogProps {
  open: boolean
  initialValue: Module | null
  courseId: number
  nextOrder: number
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: ModulePayload) => Promise<void>
}

export function ModuleDialog({
  open,
  initialValue,
  courseId,
  nextOrder,
  isSaving,
  onOpenChange,
  onSubmit,
}: ModuleDialogProps) {
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState(nextOrder)

  useEffect(() => {
    setTitle(initialValue?.title ?? '')
    setOrder(initialValue?.order ?? nextOrder)
  }, [initialValue, nextOrder, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar modulo' : 'Adicionar modulo'}</DialogTitle>
          <DialogDescription>
            Estruture o curso em modulos com ordem clara para a navegacao do aluno.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit({
              courseId,
              title,
              order,
            })
          }}
        >
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Titulo do modulo
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Ordem
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value))}
              required
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar modulo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface LessonDialogProps {
  open: boolean
  initialValue: Lesson | null
  moduleId: number
  nextOrder: number
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: LessonPayload) => Promise<void>
}

export function LessonDialog({
  open,
  initialValue,
  moduleId,
  nextOrder,
  isSaving,
  onOpenChange,
  onSubmit,
}: LessonDialogProps) {
  const [payload, setPayload] = useState<LessonPayload>({
    moduleId,
    title: '',
    contentType: 'Video',
    contentUrl: '',
    durationMinutes: 10,
    order: nextOrder,
  })

  useEffect(() => {
    setPayload({
      moduleId,
      title: initialValue?.title ?? '',
      contentType: initialValue?.contentType ?? 'Video',
      contentUrl: initialValue?.contentUrl ?? '',
      durationMinutes: initialValue?.durationMinutes ?? 10,
      order: initialValue?.order ?? nextOrder,
    })
  }, [initialValue, moduleId, nextOrder, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Editar aula' : 'Adicionar aula'}</DialogTitle>
          <DialogDescription>
            Cadastre o conteudo da aula respeitando o modulo e a ordem de exibicao.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-6 grid grid-cols-2 gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit(payload)
          }}
        >
          <label className="col-span-2 block space-y-2 text-sm font-medium text-slate-700">
            Titulo da aula
            <Input
              value={payload.title}
              onChange={(event) =>
                setPayload((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Tipo de conteudo
            <select
              className="flex h-10 w-full rounded-xl border border-input bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
              value={payload.contentType}
              onChange={(event) =>
                setPayload((current) => ({ ...current, contentType: event.target.value }))
              }
            >
              <option value="Video">Video</option>
              <option value="Texto">Texto</option>
              <option value="Quiz">Quiz</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Ordem
            <Input
              type="number"
              min={1}
              value={payload.order}
              onChange={(event) =>
                setPayload((current) => ({ ...current, order: Number(event.target.value) }))
              }
              required
            />
          </label>
          <label className="col-span-2 block space-y-2 text-sm font-medium text-slate-700">
            URL do conteudo
            <Input
              value={payload.contentUrl}
              onChange={(event) =>
                setPayload((current) => ({ ...current, contentUrl: event.target.value }))
              }
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Duracao em minutos
            <Input
              type="number"
              min={1}
              value={payload.durationMinutes}
              onChange={(event) =>
                setPayload((current) => ({ ...current, durationMinutes: Number(event.target.value) }))
              }
              required
            />
          </label>
          <div className="col-span-2 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">
            O campo de URL pode receber um video, um material de leitura ou um link de atividade.
          </div>
          <div className="col-span-2">
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar aula'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
