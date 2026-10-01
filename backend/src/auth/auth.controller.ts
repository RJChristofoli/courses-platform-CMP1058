import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { AuthenticatedUser } from '../common/authenticated-user'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica um usuário e emite um JWT' })
  @ApiResponse({ status: 200, description: 'JWT e perfil público' })
  @ApiResponse({ status: 401, description: 'Email ou senha inválidos' })
  login(@Body() input: LoginDto) {
    return this.auth.login(input)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o perfil público da sessão atual' })
  @ApiResponse({ status: 200, description: 'Perfil autenticado, sem dados de credencial' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.currentUser(user)
  }
}
