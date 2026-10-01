import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { PlanDto } from './dto/plan.dto'
import { PlansService } from './plans.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { PlanResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Plans')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Lista planos para perfis autenticados' })
  @ApiListResponse(PlanResponseDto, 'Planos; price é uma string decimal com duas casas')
  list() { return this.plans.list() }

  @Get(':id')
  @ApiItemResponse(PlanResponseDto, 'Plano e preço em decimal exato')
  get(@Param('id', ParsePositiveIntPipe) id: number) { return this.plans.get(id) }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria plano de preço simulado (admin)' })
  @ApiCreatedItemResponse(PlanResponseDto, 'Plano criado')
  create(@Body() input: PlanDto) { return this.plans.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiItemResponse(PlanResponseDto, 'Plano atualizado')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: PlanDto) {
    return this.plans.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Plano removido sem assinaturas vinculadas')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.plans.remove(id) }
}
