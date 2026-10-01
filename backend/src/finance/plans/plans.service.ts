import { Injectable } from '@nestjs/common'
import { httpError } from '../../common/http-error'
import { PlanDto } from './dto/plan.dto'
import { PlansRepository } from './plans.repository'

@Injectable()
export class PlansService {
  constructor(private readonly plans: PlansRepository) {}

  list() { return this.plans.list() }

  async get(id: number) {
    const plan = await this.plans.findById(id)
    if (!plan) throw httpError(404, 'NOT_FOUND', 'Plano não encontrado')
    return plan
  }

  create(input: PlanDto) { return this.plans.create(input) }

  async update(id: number, input: PlanDto) {
    await this.get(id)
    return this.plans.update(id, input)
  }

  async remove(id: number) {
    await this.get(id)
    if (await this.plans.inUse(id)) throw httpError(409, 'PLAN_IN_USE', 'O plano possui assinaturas')
    await this.plans.remove(id)
  }
}
