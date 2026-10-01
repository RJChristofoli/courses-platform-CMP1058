import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, Length, Min } from 'class-validator'

export class CreateModuleDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId!: number

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiPropertyOptional({ minimum: 1, description: 'Posição desejada; por padrão, adiciona ao fim' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order?: number
}

export class UpdateModuleDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId!: number

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  order!: number
}

export class ListModulesDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId?: number
}

export class ReorderModulesDto {
  @ApiProperty({ type: [Number], example: [3, 1, 2] })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  moduleIds!: number[]
}
