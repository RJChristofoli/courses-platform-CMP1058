import { ApiProperty } from '@nestjs/swagger'
import { IsString, Length, MaxLength } from 'class-validator'

export class CategoryDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Length(1, 200)
  name!: string

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  description!: string
}
