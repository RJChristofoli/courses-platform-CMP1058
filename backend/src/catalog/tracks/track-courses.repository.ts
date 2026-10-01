import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class TrackCoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: { trackId?: number; courseId?: number }, actor: AuthenticatedUser) {
    const where: Prisma.TrackCourseWhereInput = {
      ...(filter.trackId ? { trackId: filter.trackId } : {}),
      ...(filter.courseId ? { courseId: filter.courseId } : {}),
      ...(actor.role === 'instructor' ? { course: { instructorId: actor.id } } : {}),
    }
    return this.prisma.trackCourse.findMany({ where, orderBy: [{ trackId: 'asc' }, { order: 'asc' }, { id: 'asc' }] })
  }

  findById(id: number, actor: AuthenticatedUser) {
    return this.prisma.trackCourse.findFirst({
      where: { id, ...(actor.role === 'instructor' ? { course: { instructorId: actor.id } } : {}) },
    })
  }
}
