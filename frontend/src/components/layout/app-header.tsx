import { Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Painel de controle',
    subtitle: 'Uma visao clara da operacao academica e financeira.',
  },
  '/catalogo': {
    title: 'Catalogo academico',
    subtitle: 'Cursos, categorias e trilhas organizados para escalar o conteudo.',
  },
  '/usuarios': {
    title: 'Usuarios e progresso',
    subtitle: 'Pessoas, matriculas e acompanhamento da jornada de aprendizagem.',
  },
  '/financeiro': {
    title: 'Financeiro',
    subtitle: 'Planos, assinaturas e pagamentos em uma mesma visao.',
  },
}

export function AppHeader() {
  const location = useLocation()
  const copy = titles[location.pathname] ?? titles['/dashboard']

  return (
    <header className="flex flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">
          Plataforma de Cursos
        </p>
        <h2 className="mt-2 text-3xl font-bold">{copy.title}</h2>
        <p className="mt-2 max-w-2xl text-sm">{copy.subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 md:w-[26rem] md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar por cursos, usuarios ou trilhas" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Avatar>
            <AvatarFallback>RL</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-slate-900">Rafael Lima</p>
            <p className="text-xs text-slate-500">Coordenacao academica</p>
          </div>
        </div>
      </div>
    </header>
  )
}
