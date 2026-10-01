import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { httpError } from '../../common/http-error'
import { advisoryLock, withSerializableRetry } from '../../common/transactions'
import { PrismaService } from '../../prisma/prisma.service'

type PaymentInput = {
  subscriptionId: number
  amountPaid: string
  paymentDate: Date
  paymentMethod: string
  gatewayTransactionId: string
}

function present<T extends { amountPaid: Prisma.Decimal }>(payment: T) {
  return { ...payment, amountPaid: payment.amountPaid.toFixed(2) }
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(subscriptionId: number | undefined, studentId?: number) {
    const rows = await this.prisma.payment.findMany({
      where: {
        ...(subscriptionId ? { subscriptionId } : {}),
        ...(studentId ? { subscription: { userId: studentId } } : {}),
      },
      orderBy: { id: 'asc' },
    })
    return rows.map(present)
  }

  async findById(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id } })
    return payment ? present(payment) : null
  }

  async belongsToStudent(id: number, studentId: number) {
    return !!await this.prisma.payment.findFirst({
      where: { id, subscription: { userId: studentId } },
      select: { id: true },
    })
  }

  create(input: PaymentInput) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `subscription-payments-${input.subscriptionId}`)
      const amount = new Prisma.Decimal(input.amountPaid)
      if (!amount.greaterThan(0)) throw httpError(400, 'VALIDATION_ERROR', 'O valor pago deve ser positivo')
      const subscription = await transaction.subscription.findUnique({ where: { id: input.subscriptionId } })
      if (!subscription) throw httpError(404, 'NOT_FOUND', 'Assinatura não encontrada')
      if (input.paymentDate < subscription.startDate) {
        throw httpError(409, 'PAYMENT_PRECEDES_SUBSCRIPTION', 'A data do pagamento não pode preceder o início da assinatura')
      }
      const payment = await transaction.payment.create({
        data: { ...input, amountPaid: amount, paymentMethod: input.paymentMethod.trim(), gatewayTransactionId: input.gatewayTransactionId.trim() },
      })
      return present(payment)
    })
  }

  update(id: number, input: PaymentInput) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const current = await transaction.payment.findUnique({ where: { id } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Pagamento não encontrado')
      for (const subscriptionId of [...new Set([current.subscriptionId, input.subscriptionId])].sort((a, b) => a - b)) {
        await advisoryLock(transaction, `subscription-payments-${subscriptionId}`)
      }
      const amount = new Prisma.Decimal(input.amountPaid)
      if (!amount.greaterThan(0)) throw httpError(400, 'VALIDATION_ERROR', 'O valor pago deve ser positivo')
      const subscription = await transaction.subscription.findUnique({ where: { id: input.subscriptionId } })
      if (!subscription) throw httpError(404, 'NOT_FOUND', 'Assinatura não encontrada')
      if (input.paymentDate < subscription.startDate) {
        throw httpError(409, 'PAYMENT_PRECEDES_SUBSCRIPTION', 'A data do pagamento não pode preceder o início da assinatura')
      }
      return present(await transaction.payment.update({
        where: { id },
        data: {
          ...input,
          amountPaid: amount,
          paymentMethod: input.paymentMethod.trim(),
          gatewayTransactionId: input.gatewayTransactionId.trim(),
        },
      }))
    })
  }

  remove(id: number) { return this.prisma.payment.delete({ where: { id } }) }

  isTransactionConflict(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
      && Array.isArray(error.meta?.target)
      && error.meta.target.includes('gatewayTransactionId')
  }
}
