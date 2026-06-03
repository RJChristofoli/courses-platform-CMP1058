import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardData } from '@/types/models'

interface CategoryOverviewProps {
  data: DashboardData
}

export function CategoryOverview({ data }: CategoryOverviewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {data.categories.map((category) => {
        const courseCount = data.courses.filter(
          (course) => course.categoryId === category.id,
        ).length

        return (
          <Card key={category.id}>
            <CardHeader>
              <Badge variant="secondary">{courseCount} cursos</Badge>
              <CardTitle className="mt-4">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{category.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
