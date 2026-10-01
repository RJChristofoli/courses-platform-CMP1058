import { Module } from '@nestjs/common'
import { PaymentsController } from './payments/payments.controller'
import { PaymentsRepository } from './payments/payments.repository'
import { PaymentsService } from './payments/payments.service'
import { PlansController } from './plans/plans.controller'
import { PlansRepository } from './plans/plans.repository'
import { PlansService } from './plans/plans.service'
import { SubscriptionsController } from './subscriptions/subscriptions.controller'
import { SubscriptionsRepository } from './subscriptions/subscriptions.repository'
import { SubscriptionsService } from './subscriptions/subscriptions.service'

@Module({
  controllers: [PlansController, SubscriptionsController, PaymentsController],
  providers: [
    PlansRepository, PlansService,
    SubscriptionsRepository, SubscriptionsService,
    PaymentsRepository, PaymentsService,
  ],
})
export class FinanceModule {}
