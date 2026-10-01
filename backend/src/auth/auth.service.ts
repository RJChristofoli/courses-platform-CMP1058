import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { UsersRepository } from '../users/users.repository'
import { httpError } from '../common/http-error'
import { AuthenticatedUser } from '../common/authenticated-user'
import { durationInSeconds } from '../common/duration'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginDto) {
    const user = await this.users.findCredentialsByEmail(input.email.trim().toLowerCase())
    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw httpError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos')
    }

    const expiresIn = durationInSeconds(process.env.JWT_EXPIRES_IN!)
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      tokenType: 'Bearer',
      expiresIn,
      user: this.users.toResponse(user),
    }
  }

  currentUser(user: AuthenticatedUser) {
    return this.users.toResponse(user)
  }
}
