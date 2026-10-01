import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsIn, IsOptional, MaxLength } from 'class-validator'

export class ListUsersDto {
  @ApiPropertyOptional({ enum: ['admin', 'instructor', 'student'] })
  @IsOptional()
  @IsIn(['admin', 'instructor', 'student'])
  role?: 'admin' | 'instructor' | 'student'

  @ApiPropertyOptional({ example: 'ana@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string
}
