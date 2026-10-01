import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsIn, IsString, Length, MaxLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'Ana Souza', maxLength: 150 })
  @IsString()
  @Length(1, 150)
  fullName!: string

  @ApiProperty({ example: 'ana@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email!: string

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72)
  password!: string

  @ApiProperty({ enum: ['admin', 'instructor', 'student'] })
  @IsIn(['admin', 'instructor', 'student'])
  role!: 'admin' | 'instructor' | 'student'
}
