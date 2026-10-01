import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { advisoryLock, renumberTrackCourses, withSerializableRetry } from '../../common/transactions'
import { PrismaService } from '../../prisma/prisma.service'

export interface CourseInput {
  title: string
  description: string
  instructorId: number
  categoryId: number
  level: string
  publishedAt: Date
}

const courseInclude = { modules: { select: { lessons: { select: { durationMinutes: true } } } } } as const

function withTotals<T extends { modules: { lessons: { durationMinutes: number }[] }[] }>(course: T) {
  const totalMinutes = course.modules.reduce(
    (sum, module) => sum + module.lessons.reduce((subtotal, lesson) => subtotal + lesson.durationMinutes, 0),
    0,
  )
  const { modules: _modules, ...fields } = course
  return {
    ...fields,
    totalLessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
  }
}

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { categoryId?: number; instructorId?: number }, actor: AuthenticatedUser) {
    const where: Prisma.CourseWhereInput = {
      ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
      ...(actor.role === 'instructor'
        ? { instructorId: actor.id }
        : filter.instructorId ? { instructorId: filter.instructorId } : {}),
    }
    const courses = await this.prisma.course.findMany({ where, include: courseInclude, orderBy: { id: 'asc' } })
    return courses.map(withTotals)
  }

  async findById(id: number) {
    const course = await this.prisma.course.findUnique({ where: { id }, include: courseInclude })
    return course ? withTotals(course) : null
  }

  create(input: CourseInput) {
    return this.prisma.course.create({ data: input, include: courseInclude }).then(withTotals)
  }

  update(id: number, input: CourseInput) {
    return this.prisma.course.update({ where: { id }, data: input, include: courseInclude }).then(withTotals)
  }

  remove(id: number) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const links = await transaction.trackCourse.findMany({ where: { courseId: id }, select: { trackId: true } })
      const trackIds = [...new Set(links.map((link) => link.trackId))].sort((a, b) => a - b)
      for (const trackId of trackIds) await advisoryLock(transaction, `track-courses-${trackId}`)

      await transaction.course.delete({ where: { id } })
      for (const trackId of trackIds) await renumberTrackCourses(transaction, trackId)
    })
  }
}
