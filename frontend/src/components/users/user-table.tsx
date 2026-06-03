import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { DashboardData } from '@/types/models'

interface UserTableProps {
  data: DashboardData
}

export function UserTable({ data }: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pessoas cadastradas</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="pb-4 font-medium">Nome</th>
              <th className="pb-4 font-medium">Perfil</th>
              <th className="pb-4 font-medium">E-mail</th>
              <th className="pb-4 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-none">
                <td className="py-4 font-medium text-slate-900">{user.fullName}</td>
                <td className="py-4 capitalize">{user.role}</td>
                <td className="py-4">{user.email}</td>
                <td className="py-4">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
