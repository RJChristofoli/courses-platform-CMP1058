import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { advisoryLock, withSerializableRetry } from '../../common/transactions'
import { httpError } from '../../common/http-error'

@Injectable()
export class TracksRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(categoryId?: number) {
    return this.prisma.track.findMany({
      where: categoryId ? { categoryId } : {},
      orderBy: { id: 'asc' },
    })
  }

  findById(id: number) { return this.prisma.track.findUnique({ where: { id } }) }

  create(input: { title: string; description: string; categoryId: number; courseIds: number[] }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const track = await transaction.track.create({
        data: { title: input.title.trim(), description: input.description.trim(), categoryId: input.categoryId },
      })
      if (input.courseIds.length) {
        await transaction.trackCourse.createMany({
          data: input.courseIds.map((courseId, index) => ({ trackId: track.id, courseId, order: index + 1 })),
        })
      }
      return track
    })
  }

  update(id: number, input: { title: string; description: string; categoryId: number; courseIds: number[] }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `track-courses-${id}`)
      const existing = await transaction.track.findUnique({ where: { id } })
      if (!existing) throw httpError(404, 'NOT_FOUND', 'Trilha não encontrada')
      const relations = await transaction.trackCourse.findMany({ where: { trackId: id } })
      const byCourse = new Map(relations.map((relation) => [relation.courseId, relation]))
      const desired = new Set(input.courseIds)
      const removed = relations.filter((relation) => !desired.has(relation.courseId))

      if (removed.length) {
        const removedCourseIds = removed.map((relation) => relation.courseId)
        await transaction.certificate.updateMany({
          where: { trackId: id, courseId: { in: removedCourseIds } },
          data: { trackId: null },
        })
        await transaction.trackCourse.deleteMany({ where: { id: { in: removed.map((relation) => relation.id) } } })
      }

      await transaction.track.update({
        where: { id },
        data: { title: input.title.trim(), description: input.description.trim(), categoryId: input.categoryId },
      })
      for (const [index, courseId] of input.courseIds.entries()) {
        const current = byCourse.get(courseId)
        if (current) {
          await transaction.trackCourse.update({ where: { id: current.id }, data: { order: index + 1 } })
        } else {
          await transaction.trackCourse.create({ data: { trackId: id, courseId, order: index + 1 } })
        }
      }
      return transaction.track.findUniqueOrThrow({ where: { id } })
    })
  }

  remove(id: number) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await advisoryLock(transaction, `track-courses-${id}`)
      return transaction.track.delete({ where: { id } })
    })
  }
}
