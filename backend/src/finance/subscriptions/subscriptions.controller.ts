import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { ListSubscriptionsDto, SubscriptionDto } from './dto/subscription.dto'
import { SubscriptionsService } from './subscriptions.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { ApiErrorResponseDto, SubscriptionResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Subscriptions')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin lista tudo; aluno consulta as próprias assinaturas' })
  @ApiListResponse(SubscriptionResponseDto, 'Assinaturas planas com datas ISO e status documentado')
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Instrutor sem acesso' })
  list(@Query() filter: ListSubscriptionsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.subscriptions.list(filter, actor)
  }

  @Get(':id')
  @ApiItemResponse(SubscriptionResponseDto, 'Assinatura consultada')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.subscriptions.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria assinatura simulada (admin)' })
  @ApiCreatedItemResponse(SubscriptionResponseDto, 'Assinatura simulada criada')
  create(@Body() input: SubscriptionDto) { return this.subscriptions.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Referência imutável ou início posterior a pagamento existente' })
  @ApiItemResponse(SubscriptionResponseDto, 'Assinatura atualizada')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: SubscriptionDto) {
    return this.subscriptions.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove assinatura e pagamentos associados' })
  @ApiDeletedResponse('Assinatura e pagamentos associados removidos em transação')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.subscriptions.remove(id) }
}
