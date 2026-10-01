import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator'

const statuses = ['active', 'paused', 'cancelled', 'expired'] as const

export class SubscriptionDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  planId!: number

  @ApiProperty({ format: 'date-time' })
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  startDate!: string

  @ApiProperty({ format: 'date-time' })
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  endDate!: string

  @ApiProperty({ enum: statuses })
  @IsIn(statuses)
  status!: typeof statuses[number]
}

export class ListSubscriptionsDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  planId?: number

  @ApiPropertyOptional({ enum: statuses })
  @IsOptional()
  @IsString()
  @Matches(/^(active|paused|cancelled|expired)$/)
  status?: typeof statuses[number]
}
