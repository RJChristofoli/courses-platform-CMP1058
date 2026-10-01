import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { AuthenticatedUser } from '../common/authenticated-user'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { ApiCommonErrors, ApiItemResponse, ApiLoginErrors } from '../common/openapi/api-docs'
import { LoginResponseDto, UserResponseDto } from '../common/openapi/api-models.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica um usuário e emite um JWT' })
  @ApiItemResponse(LoginResponseDto, 'JWT e perfil público, sem hash de senha')
  @ApiLoginErrors()
  login(@Body() input: LoginDto) {
    return this.auth.login(input)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiCommonErrors()
  @ApiOperation({ summary: 'Retorna o perfil público da sessão atual' })
  @ApiItemResponse(UserResponseDto, 'Perfil autenticado, sem dados de credencial')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.currentUser(user)
  }
}
