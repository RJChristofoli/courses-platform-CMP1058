import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsString, Length, Matches, Max, Min } from 'class-validator'

const moneyPattern = /^\d{1,10}\.\d{2}$/

export class PlanDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  name!: string

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @Length(0, 5000)
  description!: string

  @ApiProperty({ example: '49.90', pattern: moneyPattern.source })
  @IsString()
  @Matches(moneyPattern)
  price!: string

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1200)
  durationMonths!: number
}
