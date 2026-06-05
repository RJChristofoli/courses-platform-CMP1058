import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
  actionLabel?: string
  className?: string
}

export function EmptyState({
  title,
  description,
  action,
  actionLabel,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{description}</p>
        {action ?? (actionLabel ? <Button variant="outline">{actionLabel}</Button> : null)}
      </CardContent>
    </Card>
  )
}
