import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { AuthenticatedUser } from '../common/authenticated-user'
import { CreateUserDto } from './dto/create-user.dto'
import { ListUsersDto } from './dto/list-users.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../common/openapi/api-docs'
import { ApiErrorResponseDto, UserResponseDto } from '../common/openapi/api-models.dto'

@ApiTags('Users')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista usuários; exclusivo do perfil admin' })
  @ApiListResponse(UserResponseDto, 'Usuários públicos, sem hash de senha')
  list(@CurrentUser() actor: AuthenticatedUser, @Query() filter: ListUsersDto) {
    return this.users.list(actor, filter)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta perfil; admin ou o próprio usuário' })
  @ApiItemResponse(UserResponseDto, 'Perfil público do usuário')
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Usuário inexistente ou fora do escopo' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.findOne(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cadastra usuário (admin)' })
  @ApiCreatedItemResponse(UserResponseDto, 'Usuário criado, sem hash de senha')
  create(@Body() input: CreateUserDto) {
    return this.users.create(input)
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza usuário (admin)' })
  @ApiItemResponse(UserResponseDto, 'Usuário atualizado, sem hash de senha')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Mudança impeditiva por integridade' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.users.update(id, input, actor)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui usuário e os dados próprios definidos pelas FKs (admin)' })
  @ApiDeletedResponse('Usuário excluído')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    await this.users.remove(id, actor)
  }
}
