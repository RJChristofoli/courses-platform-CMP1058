import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateModuleDto, ListModulesDto, ReorderModulesDto, UpdateModuleDto } from './dto/module.dto'
import { ModulesService } from './modules.service'

@ApiTags('Modules')
@ApiBearerAuth()
@Controller()
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get('modules')
  @ApiOperation({ summary: 'Lista módulos; opcionalmente filtra por curso' })
  list(@Query() filter: ListModulesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.modules.list(filter.courseId, actor)
  }

  @Get('modules/:id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.modules.get(id, actor)
  }

  @Post('modules')
  @Roles('admin')
  @ApiOperation({ summary: 'Cria módulo e insere na ordem do curso (admin)' })
  create(@Body() input: CreateModuleDto) { return this.modules.create(input) }

  @Put('modules/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza módulo e sua posição (admin)' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateModuleDto) {
    return this.modules.update(id, input)
  }

  @Put('courses/:courseId/modules/order')
  @Roles('admin')
  @ApiOperation({ summary: 'Substitui a ordem completa dos módulos do curso' })
  @ApiResponse({ status: 409, description: 'A lista não corresponde aos módulos atuais' })
  reorder(
    @Param('courseId', ParsePositiveIntPipe) courseId: number,
    @Body() input: ReorderModulesDto,
  ) {
    return this.modules.reorder(courseId, input)
  }

  @Delete('modules/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.modules.remove(id) }
}
