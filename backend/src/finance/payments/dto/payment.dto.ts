import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDateString, IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator'

const moneyPattern = /^\d{1,10}\.\d{2}$/

export class PaymentDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subscriptionId!: number

  @ApiProperty({ example: '49.90', pattern: moneyPattern.source })
  @IsString()
  @Matches(moneyPattern)
  amountPaid!: string

  @ApiProperty({ format: 'date-time' })
  @IsDateString({ strict: true })
  @Matches(/(?:Z|[+-]\d{2}:\d{2})$/)
  paymentDate!: string

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @Length(1, 50)
  paymentMethod!: string

  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  gatewayTransactionId!: string
}

export class ListPaymentsDto {
  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subscriptionId?: number
}
