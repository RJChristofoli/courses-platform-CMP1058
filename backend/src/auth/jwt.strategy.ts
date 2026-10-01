import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    })
  }

  async validate(payload: { sub?: number }) {
    if (!Number.isInteger(payload.sub) || Number(payload.sub) < 1) return null
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    })
    return user ?? null
  }
}
