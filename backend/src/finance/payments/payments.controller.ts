import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { ListPaymentsDto, PaymentDto } from './dto/payment.dto'
import { PaymentsService } from './payments.service'

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin lista tudo; aluno consulta pagamentos das próprias assinaturas' })
  @ApiResponse({ status: 403, description: 'Instrutor sem acesso' })
  list(@Query() filter: ListPaymentsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.payments.list(filter, actor)
  }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.payments.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Registra pagamento simulado (admin)' })
  @ApiResponse({ status: 409, description: 'Valor/date incompatível ou referência já usada' })
  create(@Body() input: PaymentDto) { return this.payments.create(input) }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: PaymentDto) {
    return this.payments.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.payments.remove(id) }
}
