import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, IsUrl, Length, Min, ValidateNested } from 'class-validator'

export class CreateLessonDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  moduleId!: number

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @Length(1, 50)
  contentType!: string

  @ApiProperty({ example: 'https://example.com/aula' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @Length(1, 2048)
  contentUrl!: string

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMinutes!: number

  @ApiPropertyOptional({ minimum: 1, description: 'Posição desejada; por padrão, adiciona ao fim do módulo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number
}

export class UpdateLessonDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  moduleId!: number

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @Length(1, 50)
  contentType!: string

  @ApiProperty({ example: 'https://example.com/aula' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @Length(1, 2048)
  contentUrl!: string

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationMinutes!: number

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order!: number
}

export class ListLessonsDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  moduleId?: number
}

export class LessonOrderItemDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  moduleId!: number

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order!: number
}

export class ReorderLessonsDto {
  @ApiProperty({ type: [LessonOrderItemDto] })
  @IsArray()
  @ArrayUnique((item: LessonOrderItemDto) => item.id)
  @ValidateNested({ each: true })
  @Type(() => LessonOrderItemDto)
  lessons!: LessonOrderItemDto[]
}
