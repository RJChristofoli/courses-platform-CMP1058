import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator'

export class UpdateUserDto {
  @ApiProperty({ example: 'Ana Souza', maxLength: 150 })
  @IsString()
  @Length(1, 150)
  fullName!: string

  @ApiProperty({ example: 'ana@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ enum: ['admin', 'instructor', 'student'] })
  @IsIn(['admin', 'instructor', 'student'])
  role!: 'admin' | 'instructor' | 'student'

  @ApiPropertyOptional({ minLength: 8, maxLength: 72, description: 'Omitir para manter a senha atual' })
  @IsOptional()
  @IsString()
  @Length(8, 72)
  password?: string
}
