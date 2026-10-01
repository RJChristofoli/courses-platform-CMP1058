import { ForbiddenException, Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { ListSubscriptionsDto, SubscriptionDto } from './dto/subscription.dto'
import { SubscriptionsRepository } from './subscriptions.repository'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly subscriptions: SubscriptionsRepository) {}

  list(filter: ListSubscriptionsDto, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    return this.subscriptions.list(filter, actor.role === 'student' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    const subscription = await this.subscriptions.findById(id)
    if (!subscription || (actor.role === 'student' && subscription.userId !== actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Assinatura não encontrada')
    }
    return subscription
  }

  create(input: SubscriptionDto) { return this.subscriptions.create(this.toInput(input)) }

  async update(id: number, input: SubscriptionDto) {
    return this.subscriptions.update(id, this.toInput(input))
  }

  async remove(id: number) { await this.subscriptions.remove(id) }

  private toInput(input: SubscriptionDto) {
    return {
      userId: input.userId,
      planId: input.planId,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: input.status,
    }
  }

  private assertReadable(actor: AuthenticatedUser) {
    if (actor.role === 'instructor') throw new ForbiddenException('Instrutores não acessam assinaturas')
  }
}
