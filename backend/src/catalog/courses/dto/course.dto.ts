import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CourseDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @Length(0, 5000)
  description!: string

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  instructorId!: number

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @Length(1, 50)
  level!: string

  @ApiProperty({ example: '2026-10-01T08:00:00.000Z', format: 'date-time' })
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  publishedAt!: string
}

export class ListCoursesDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  categoryId?: number

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  instructorId?: number
}
