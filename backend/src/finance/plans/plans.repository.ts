import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

function present<T extends { price: Prisma.Decimal }>(plan: T) {
  return { ...plan, price: plan.price.toFixed(2) }
}

@Injectable()
export class PlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list() { return (await this.prisma.plan.findMany({ orderBy: { id: 'asc' } })).map(present) }

  async findById(id: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id } })
    return plan ? present(plan) : null
  }

  async inUse(id: number) {
    return (await this.prisma.subscription.count({ where: { planId: id } })) > 0
  }

  async create(input: { name: string; description: string; price: string; durationMonths: number }) {
    return present(await this.prisma.plan.create({
      data: { ...input, name: input.name.trim(), description: input.description.trim(), price: new Prisma.Decimal(input.price) },
    }))
  }

  async update(id: number, input: { name: string; description: string; price: string; durationMonths: number }) {
    return present(await this.prisma.plan.update({
      where: { id },
      data: { ...input, name: input.name.trim(), description: input.description.trim(), price: new Prisma.Decimal(input.price) },
    }))
  }

  remove(id: number) { return this.prisma.plan.delete({ where: { id } }) }
}
