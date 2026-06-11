import { BookOpen, CreditCard, Users } from 'lucide-react'

export const navigationItems = [
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
