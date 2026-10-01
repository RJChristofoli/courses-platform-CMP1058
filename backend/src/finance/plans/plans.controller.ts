import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { PlanDto } from './dto/plan.dto'
import { PlansService } from './plans.service'

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plans: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Lista planos para perfis autenticados' })
  list() { return this.plans.list() }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number) { return this.plans.get(id) }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria plano de preço simulado (admin)' })
  create(@Body() input: PlanDto) { return this.plans.create(input) }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: PlanDto) {
    return this.plans.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 409, description: 'Plano em uso por assinatura' })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.plans.remove(id) }
}
