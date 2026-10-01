import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { ListSubscriptionsDto, SubscriptionDto } from './dto/subscription.dto'
import { SubscriptionsService } from './subscriptions.service'

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin lista tudo; aluno consulta as próprias assinaturas' })
  @ApiResponse({ status: 403, description: 'Instrutor sem acesso' })
  list(@Query() filter: ListSubscriptionsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.subscriptions.list(filter, actor)
  }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.subscriptions.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria assinatura simulada (admin)' })
  create(@Body() input: SubscriptionDto) { return this.subscriptions.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiResponse({ status: 409, description: 'Referência imutável ou início posterior a pagamento existente' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: SubscriptionDto) {
    return this.subscriptions.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove assinatura e pagamentos associados' })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.subscriptions.remove(id) }
}
