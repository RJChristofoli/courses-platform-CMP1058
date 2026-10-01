import { Prisma, PrismaClient } from '@prisma/client'

type TransactionClient = Prisma.TransactionClient

export async function withSerializableRetry<T>(
  prisma: PrismaClient,
  operation: (transaction: TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await prisma.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2034'
        && attempt < 2
      ) continue
      throw error
    }
  }
}

export async function advisoryLock(transaction: TransactionClient, key: string) {
  await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0)) IS NULL AS acquired`
}

export function lockCourseLearning(transaction: TransactionClient, courseId: number) {
  return advisoryLock(transaction, `course-learning-${courseId}`)
}

export async function renumberTrackCourses(transaction: TransactionClient, trackId: number) {
  const relations = await transaction.trackCourse.findMany({ where: { trackId }, orderBy: [{ order: 'asc' }, { id: 'asc' }] })
  await Promise.all(relations.map((relation, index) =>
    transaction.trackCourse.update({ where: { id: relation.id }, data: { order: index + 1 } }),
  ))
}

export async function recomputeCourseCompletion(transaction: TransactionClient, courseId: number) {
  const [course, enrollments] = await Promise.all([
    transaction.course.findUnique({
      where: { id: courseId },
      select: { modules: { select: { lessons: { select: { id: true } } } } },
    }),
    transaction.enrollment.findMany({ where: { courseId }, select: { id: true, userId: true, enrolledAt: true } }),
  ])
  if (!course) return

  const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
  for (const enrollment of enrollments) {
    let completedAt: Date | null = null
    if (lessonIds.length > 0) {
      const progress = await transaction.lessonProgress.findMany({
        where: { userId: enrollment.userId, lessonId: { in: lessonIds } },
        select: { status: true, completedAt: true },
      })
      if (progress.length === lessonIds.length && progress.every((item) => item.status === 'Completed')) {
        const timestamps = progress.map((item) => item.completedAt!).sort((a, b) => b.getTime() - a.getTime())
        const lastCompleted = timestamps[0]
        if (lastCompleted >= enrollment.enrolledAt) completedAt = lastCompleted
      }
    }
    await transaction.enrollment.update({ where: { id: enrollment.id }, data: { completedAt } })
  }
}
