import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { AuthenticatedUser } from '../common/authenticated-user'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiItemResponse, ApiLoginErrors } from '../common/openapi/api-docs'
import { ApiErrorResponseDto, LoginResponseDto, UserResponseDto } from '../common/openapi/api-models.dto'
import { RegisterDto } from './dto/register.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Cria uma conta de aluno sem autenticação' })
  @ApiCreatedItemResponse(UserResponseDto, 'Conta criada, sem dados de credencial; entre por /auth/login')
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Dados de cadastro inválidos' })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Email já cadastrado' })
  register(@Body() input: RegisterDto) {
    return this.auth.register(input)
  }

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
