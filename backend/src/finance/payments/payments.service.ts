import { ForbiddenException, Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { ListPaymentsDto, PaymentDto } from './dto/payment.dto'
import { PaymentsRepository } from './payments.repository'

@Injectable()
export class PaymentsService {
  constructor(private readonly payments: PaymentsRepository) {}

  list(filter: ListPaymentsDto, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    return this.payments.list(filter.subscriptionId, actor.role === 'student' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    const payment = await this.payments.findById(id)
    if (!payment || (actor.role === 'student' && !await this.payments.belongsToStudent(id, actor.id))) {
      throw httpError(404, 'NOT_FOUND', 'Pagamento não encontrado')
    }
    return payment
  }

  async create(input: PaymentDto) {
    try {
      return await this.payments.create(this.toInput(input))
    } catch (error) {
      if (this.payments.isTransactionConflict(error)) {
        throw httpError(409, 'TRANSACTION_ALREADY_EXISTS', 'Referência de pagamento já cadastrada')
      }
      throw error
    }
  }

  async update(id: number, input: PaymentDto) {
    try {
      return await this.payments.update(id, this.toInput(input))
    } catch (error) {
      if (this.payments.isTransactionConflict(error)) {
        throw httpError(409, 'TRANSACTION_ALREADY_EXISTS', 'Referência de pagamento já cadastrada')
      }
      throw error
    }
  }

  async remove(id: number) { await this.payments.remove(id) }

  private toInput(input: PaymentDto) {
    return {
      subscriptionId: input.subscriptionId,
      amountPaid: input.amountPaid,
      paymentDate: new Date(input.paymentDate),
      paymentMethod: input.paymentMethod,
      gatewayTransactionId: input.gatewayTransactionId,
    }
  }

  private assertReadable(actor: AuthenticatedUser) {
    if (actor.role === 'instructor') throw new ForbiddenException('Instrutores não acessam dados financeiros')
  }
}
