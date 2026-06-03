import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
}

export function EmptyState({
  title,
  description,
  actionLabel = 'Tentar novamente mais tarde',
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{description}</p>
        <Button variant="outline">{actionLabel}</Button>
      </CardContent>
    </Card>
  )
}
