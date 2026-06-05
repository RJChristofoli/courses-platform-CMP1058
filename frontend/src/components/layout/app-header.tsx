import { Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Painel de controle',
    subtitle: 'Uma visao clara da operacao academica e financeira.',
  },
  '/catalogo/categoria': {
    title: 'Catalogo de cursos',
    subtitle: 'Gerencie categorias, cursos, estrutura e trilhas.',
  },
  '/catalogo/curso': {
    title: 'Catalogo de cursos',
    subtitle: 'Gerencie categorias, cursos, estrutura e trilhas.',
  },
  '/catalogo/estrutura': {
    title: 'Catalogo de cursos',
    subtitle: 'Gerencie categorias, cursos, estrutura e trilhas.',
  },
  '/catalogo/trilha': {
    title: 'Catalogo de cursos',
    subtitle: 'Gerencie categorias, cursos, estrutura e trilhas.',
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
    <header className="flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-slate-950 md:text-2xl">{copy.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{copy.subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 md:w-[24rem] md:flex-row md:items-center md:justify-end">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="h-9 pl-9" placeholder="Buscar por cursos, usuarios ou trilhas" />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Avatar>
            <AvatarFallback>RL</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Rafael Lima</p>
            <p className="truncate text-xs text-slate-500">Coordenacao academica</p>
          </div>
        </div>
      </div>
    </header>
  )
}
