import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { AuthenticatedUser } from '../common/authenticated-user'
import { CreateUserDto } from './dto/create-user.dto'
import { ListUsersDto } from './dto/list-users.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista usuários; exclusivo do perfil admin' })
  @ApiResponse({ status: 200, description: 'Usuários públicos, sem hash de senha' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão' })
  list(@CurrentUser() actor: AuthenticatedUser, @Query() filter: ListUsersDto) {
    return this.users.list(actor, filter)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta perfil; admin ou o próprio usuário' })
  @ApiResponse({ status: 404, description: 'Usuário inexistente ou fora do escopo' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.findOne(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cadastra usuário (admin)' })
  @ApiResponse({ status: 201, description: 'Usuário sem hash de senha' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  create(@Body() input: CreateUserDto) {
    return this.users.create(input)
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza usuário (admin)' })
  @ApiResponse({ status: 200, description: 'Usuário sem hash de senha' })
  @ApiResponse({ status: 409, description: 'Mudança impeditiva por integridade' })
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
  @ApiResponse({ status: 204, description: 'Usuário excluído' })
  @ApiResponse({ status: 409, description: 'Instrutor ainda atribuído a cursos' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    await this.users.remove(id, actor)
  }
}
