import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { advisoryLock, recomputeCourseCompletion, withSerializableRetry } from '../../common/transactions'
import { httpError } from '../../common/http-error'
import { LessonOrderItemDto } from './dto/lesson.dto'

type LessonFields = {
  moduleId: number
  title: string
  contentType: string
  contentUrl: string
  durationMinutes: number
}

@Injectable()
export class LessonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(moduleId?: number, instructorId?: number) {
    return this.prisma.lesson.findMany({
      where: {
        ...(moduleId ? { moduleId } : {}),
        ...(instructorId ? { module: { course: { instructorId } } } : {}),
      },
      orderBy: [{ moduleId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
    })
  }

  findById(id: number) { return this.prisma.lesson.findUnique({ where: { id } }) }

  create(input: LessonFields & { order?: number }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const module = await transaction.module.findUnique({ where: { id: input.moduleId } })
      if (!module) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
      await advisoryLock(transaction, `lessons-course-${module.courseId}`)
      const target = await transaction.module.findUnique({ where: { id: input.moduleId } })
      if (!target) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
      const lessons = await transaction.lesson.findMany({ where: { moduleId: target.id }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      const position = input.order ?? lessons.length + 1
      this.assertOrder(position, lessons.length + 1)
      const created = await transaction.lesson.create({ data: { ...input, title: input.title.trim(), order: lessons.length + 1 } })
      lessons.splice(position - 1, 0, created)
      await this.assignOrders(transaction, lessons)
      await recomputeCourseCompletion(transaction, module.courseId)
      return { ...created, order: position }
    })
  }

  update(id: number, input: LessonFields & { order: number }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const current = await transaction.lesson.findUnique({ where: { id }, include: { module: true } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Aula não encontrada')
      const destination = await transaction.module.findUnique({ where: { id: input.moduleId } })
      if (!destination) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
      if (current.module.courseId !== destination.courseId) {
        throw httpError(409, 'LESSON_COURSE_CHANGE_FORBIDDEN', 'A aula não pode mudar de curso')
      }
      await advisoryLock(transaction, `lessons-course-${current.module.courseId}`)

      const sourceLessons = await transaction.lesson.findMany({ where: { moduleId: current.moduleId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      const targetLessons = current.moduleId === destination.id
        ? sourceLessons
        : await transaction.lesson.findMany({ where: { moduleId: destination.id }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      this.assertOrder(input.order, current.moduleId === destination.id ? sourceLessons.length : targetLessons.length + 1)

      if (current.moduleId === destination.id) {
        const ordered = sourceLessons.filter((lesson) => lesson.id !== id)
        ordered.splice(input.order - 1, 0, { ...current, ...input })
        await transaction.lesson.update({ where: { id }, data: this.lessonData(input) })
        await this.assignOrders(transaction, ordered)
      } else {
        const sourceRemaining = sourceLessons.filter((lesson) => lesson.id !== id)
        targetLessons.splice(input.order - 1, 0, { ...current, ...input, moduleId: destination.id })
        await transaction.lesson.update({ where: { id }, data: this.lessonData(input) })
        await this.assignOrders(transaction, sourceRemaining)
        await this.assignOrders(transaction, targetLessons)
      }
      return transaction.lesson.findUniqueOrThrow({ where: { id } })
    })
  }

  remove(id: number) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const current = await transaction.lesson.findUnique({ where: { id }, include: { module: true } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Aula não encontrada')
      await advisoryLock(transaction, `lessons-course-${current.module.courseId}`)
      await transaction.lesson.delete({ where: { id } })
      const remaining = await transaction.lesson.findMany({ where: { moduleId: current.moduleId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
      await this.assignOrders(transaction, remaining)
      await recomputeCourseCompletion(transaction, current.module.courseId)
      return current
    })
  }

  reorder(courseId: number, updates: LessonOrderItemDto[]) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `lessons-course-${courseId}`)
      const current = await transaction.lesson.findMany({ where: { module: { courseId } } })
      if (current.length !== updates.length || current.some((lesson) => !updates.some((entry) => entry.id === lesson.id))) {
        throw httpError(409, 'ORDER_SET_MISMATCH', 'A lista precisa conter todas as aulas do curso uma única vez')
      }
      const modules = await transaction.module.findMany({ where: { courseId }, select: { id: true } })
      const moduleIds = new Set(modules.map((module) => module.id))
      if (updates.some((entry) => !moduleIds.has(entry.moduleId))) {
        throw httpError(409, 'ORDER_SET_MISMATCH', 'Toda aula precisa permanecer em um módulo do mesmo curso')
      }
      const grouped = new Map<number, LessonOrderItemDto[]>()
      for (const entry of updates) {
        const group = grouped.get(entry.moduleId) ?? []
        group.push(entry)
        grouped.set(entry.moduleId, group)
      }
      for (const group of grouped.values()) {
        const values = group.map((entry) => entry.order).sort((a, b) => a - b)
        if (values.some((value, index) => value !== index + 1)) {
          throw new BadRequestException('As aulas de cada módulo precisam usar ordens contíguas a partir de 1')
        }
      }
      await Promise.all(updates.map((entry) => transaction.lesson.update({
        where: { id: entry.id },
        data: { moduleId: entry.moduleId, order: entry.order },
      })))
      return transaction.lesson.findMany({
        where: { module: { courseId } },
        orderBy: [{ moduleId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
      })
    })
  }

  private async assignOrders(transaction: Prisma.TransactionClient, lessons: { id: number }[]) {
    await Promise.all(lessons.map((lesson, index) =>
      transaction.lesson.update({ where: { id: lesson.id }, data: { order: index + 1 } }),
    ))
  }

  private lessonData(input: LessonFields) {
    return { ...input, title: input.title.trim(), contentType: input.contentType.trim(), contentUrl: input.contentUrl.trim() }
  }

  private assertOrder(order: number, max: number) {
    if (order < 1 || order > max) throw new BadRequestException(`A ordem deve ficar entre 1 e ${max}`)
  }
}
