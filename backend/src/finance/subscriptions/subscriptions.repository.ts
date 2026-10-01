import { Injectable } from '@nestjs/common'
import { Prisma, SubscriptionStatus } from '@prisma/client'
import { httpError } from '../../common/http-error'
import { advisoryLock } from '../../common/transactions'
import { PrismaService } from '../../prisma/prisma.service'

type SubscriptionInput = {
  userId: number
  planId: number
  startDate: Date
  endDate: Date
  status: SubscriptionStatus
}

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: { userId?: number; planId?: number; status?: SubscriptionStatus }, studentId?: number) {
    const where: Prisma.SubscriptionWhereInput = {
      ...(filter.planId ? { planId: filter.planId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(studentId ? { userId: studentId } : filter.userId ? { userId: filter.userId } : {}),
    }
    return this.prisma.subscription.findMany({ where, orderBy: { id: 'asc' } })
  }

  findById(id: number) { return this.prisma.subscription.findUnique({ where: { id } }) }

  create(input: SubscriptionInput) {
    return this.prisma.$transaction(async (transaction) => {
      const [user, plan] = await Promise.all([
        transaction.user.findUnique({ where: { id: input.userId }, select: { role: true } }),
        transaction.plan.findUnique({ where: { id: input.planId }, select: { id: true } }),
      ])
      if (!user || !plan) throw httpError(404, 'NOT_FOUND', 'Aluno ou plano não encontrado')
      if (user.role !== 'student') throw httpError(409, 'STUDENT_REQUIRED', 'A assinatura deve pertencer a um aluno')
      this.validateDates(input.startDate, input.endDate)
      return transaction.subscription.create({ data: input })
    })
  }

  update(id: number, input: SubscriptionInput) {
    return this.prisma.$transaction(async (transaction) => {
      await advisoryLock(transaction, `subscription-payments-${id}`)
      const current = await transaction.subscription.findUnique({ where: { id } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Assinatura não encontrada')
      const [user, plan, payments] = await Promise.all([
        transaction.user.findUnique({ where: { id: input.userId }, select: { role: true } }),
        transaction.plan.findUnique({ where: { id: input.planId }, select: { id: true } }),
        transaction.payment.findMany({ where: { subscriptionId: id }, select: { paymentDate: true } }),
      ])
      if (!user || !plan) throw httpError(404, 'NOT_FOUND', 'Aluno ou plano não encontrado')
      if (user.role !== 'student') throw httpError(409, 'STUDENT_REQUIRED', 'A assinatura deve pertencer a um aluno')
      this.validateDates(input.startDate, input.endDate)
      if (payments.length && (current.userId !== input.userId || current.planId !== input.planId)) {
        throw httpError(409, 'SUBSCRIPTION_HAS_PAYMENTS', 'Aluno e plano não podem mudar após pagamentos')
      }
      if (payments.some((payment) => payment.paymentDate < input.startDate)) {
        throw httpError(409, 'SUBSCRIPTION_START_AFTER_PAYMENT', 'O início da assinatura não pode ser posterior a um pagamento')
      }
      return transaction.subscription.update({ where: { id }, data: input })
    })
  }

  remove(id: number) {
    return this.prisma.$transaction(async (transaction) => {
      await advisoryLock(transaction, `subscription-payments-${id}`)
      if (!await transaction.subscription.findUnique({ where: { id }, select: { id: true } })) {
        throw httpError(404, 'NOT_FOUND', 'Assinatura não encontrada')
      }
      return transaction.subscription.delete({ where: { id } })
    })
  }

  private validateDates(startDate: Date, endDate: Date) {
    if (endDate <= startDate) throw httpError(400, 'VALIDATION_ERROR', 'A data final deve ser posterior à data inicial')
  }
}
