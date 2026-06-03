import { BookOpen, CreditCard, LayoutDashboard, Users } from 'lucide-react'

export const navigationItems = [
  {
    label: 'Dashboard',
    description: 'Visao geral da plataforma',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Catalogo',
    description: 'Cursos, categorias e trilhas',
    href: '/catalogo/curso',
    icon: BookOpen,
  },
  {
    label: 'Usuarios',
    description: 'Pessoas, matriculas e progresso',
    href: '/usuarios',
    icon: Users,
  },
  {
    label: 'Financeiro',
    description: 'Planos, assinaturas e pagamentos',
    href: '/financeiro',
    icon: CreditCard,
  },
] as const
