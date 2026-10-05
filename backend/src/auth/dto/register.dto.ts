import { PickType } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { CreateUserDto } from '../../users/dto/create-user.dto'

export class RegisterDto extends PickType(CreateUserDto, ['fullName', 'email', 'password'] as const) {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  fullName!: string

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  email!: string
}
