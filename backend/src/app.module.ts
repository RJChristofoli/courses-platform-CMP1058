import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { ConfigModule } from '@nestjs/config'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { validateEnv } from './config/validate-env'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
