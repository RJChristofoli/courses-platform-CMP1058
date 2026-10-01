import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsIn, IsInt, IsOptional, Matches, Min } from 'class-validator'

const statuses = ['Concluido', 'Em andamento'] as const

export class CreateLessonProgressDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonId!: number

  @ApiProperty({ enum: statuses })
  @IsIn(statuses)
  status!: typeof statuses[number]

  @ApiPropertyOptional({ format: 'date-time', nullable: true, description: 'Omitir para usar agora ao concluir' })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  completedAt?: string | null
}

export class UpdateLessonProgressDto extends CreateLessonProgressDto {}

export class ListLessonProgressDto {
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
  lessonId?: number

  @ApiPropertyOptional({ enum: statuses })
  @IsOptional()
  @IsIn(statuses)
  status?: typeof statuses[number]
}
