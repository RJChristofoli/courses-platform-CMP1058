import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { advisoryLock, lockCourseLearning, recomputeCourseCompletion, withSerializableRetry } from '../../common/transactions'
import { httpError } from '../../common/http-error'

@Injectable()
export class ModulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(courseId?: number, instructorId?: number) {
    return this.prisma.module.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(instructorId ? { course: { instructorId } } : {}),
      },
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    })
  }

  findById(id: number) { return this.prisma.module.findUnique({ where: { id } }) }

  create(input: { courseId: number; title: string; order?: number }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `modules-course-${input.courseId}`)
      const modules = await transaction.module.findMany({ where: { courseId: input.courseId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      const position = input.order ?? modules.length + 1
      this.assertOrder(position, modules.length + 1)
      const created = await transaction.module.create({ data: { ...input, title: input.title.trim(), order: modules.length + 1 } })
      modules.splice(position - 1, 0, created)
      await Promise.all(modules.map((module, index) =>
        transaction.module.update({ where: { id: module.id }, data: { order: index + 1 } }),
      ))
      return { ...created, order: position }
    })
  }

  update(id: number, input: { courseId: number; title: string; order: number }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `modules-course-${input.courseId}`)
      const existing = await transaction.module.findUnique({ where: { id } })
      if (!existing) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
      if (existing.courseId !== input.courseId) {
        throw httpError(409, 'MODULE_COURSE_CHANGE_FORBIDDEN', 'O módulo não pode mudar de curso')
      }
      const modules = await transaction.module.findMany({ where: { courseId: input.courseId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      this.assertOrder(input.order, modules.length)
      const ordered = modules.filter((module) => module.id !== id)
      ordered.splice(input.order - 1, 0, existing)
      await transaction.module.update({ where: { id }, data: { title: input.title.trim() } })
      await Promise.all(ordered.map((module, index) =>
        transaction.module.update({ where: { id: module.id }, data: { order: index + 1 } }),
      ))
      return transaction.module.findUniqueOrThrow({ where: { id } })
    })
  }

  remove(id: number) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const existing = await transaction.module.findUnique({ where: { id } })
      if (!existing) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
      await advisoryLock(transaction, `modules-course-${existing.courseId}`)
      await lockCourseLearning(transaction, existing.courseId)
      await transaction.module.delete({ where: { id } })
      const remaining = await transaction.module.findMany({ where: { courseId: existing.courseId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      await Promise.all(remaining.map((module, index) =>
        transaction.module.update({ where: { id: module.id }, data: { order: index + 1 } }),
      ))
      await recomputeCourseCompletion(transaction, existing.courseId)
      return existing
    })
  }

  reorder(courseId: number, moduleIds: number[]) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `modules-course-${courseId}`)
      const current = await transaction.module.findMany({ where: { courseId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      if (current.length !== moduleIds.length || new Set(moduleIds).size !== moduleIds.length
        || current.some((module) => !moduleIds.includes(module.id))) {
        throw httpError(409, 'ORDER_SET_MISMATCH', 'A lista precisa conter todos os módulos do curso uma única vez')
      }
      await Promise.all(moduleIds.map((id, index) =>
        transaction.module.update({ where: { id }, data: { order: index + 1 } }),
      ))
      return transaction.module.findMany({ where: { courseId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
    })
  }

  private assertOrder(order: number, max: number) {
    if (order < 1 || order > max) throw new BadRequestException(`A ordem deve ficar entre 1 e ${max}`)
  }
}
