import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateModuleDto, ListModulesDto, ReorderModulesDto, UpdateModuleDto } from './dto/module.dto'
import { ModulesService } from './modules.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { ApiErrorResponseDto, ModuleResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Modules')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller()
export class ModulesController {
  constructor(private readonly modules: ModulesService) {}

  @Get('modules')
  @ApiOperation({ summary: 'Lista módulos; opcionalmente filtra por curso' })
  @ApiListResponse(ModuleResponseDto, 'Módulos planos, ordenados por curso e posição')
  list(@Query() filter: ListModulesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.modules.list(filter.courseId, actor)
  }

  @Get('modules/:id')
  @ApiItemResponse(ModuleResponseDto, 'Módulo consultado')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.modules.get(id, actor)
  }

  @Post('modules')
  @Roles('admin')
  @ApiOperation({ summary: 'Cria módulo e insere na ordem do curso (admin)' })
  @ApiCreatedItemResponse(ModuleResponseDto, 'Módulo criado com posição')
  create(@Body() input: CreateModuleDto) { return this.modules.create(input) }

  @Put('modules/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza módulo e sua posição (admin)' })
  @ApiItemResponse(ModuleResponseDto, 'Módulo atualizado')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateModuleDto) {
    return this.modules.update(id, input)
  }

  @Put('courses/:courseId/modules/order')
  @Roles('admin')
  @ApiOperation({ summary: 'Substitui a ordem completa dos módulos do curso' })
  @ApiListResponse(ModuleResponseDto, 'Módulos reordenados em transação')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'A lista não corresponde aos módulos atuais' })
  reorder(
    @Param('courseId', ParsePositiveIntPipe) courseId: number,
    @Body() input: ReorderModulesDto,
  ) {
    return this.modules.reorder(courseId, input)
  }

  @Delete('modules/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Módulo removido e demais posições renumeradas')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.modules.remove(id) }
}
