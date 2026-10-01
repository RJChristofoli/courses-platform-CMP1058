import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { httpError } from '../../common/http-error'
import { lockCourseLearning, withSerializableRetry } from '../../common/transactions'

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: { userId?: number; courseId?: number }, studentId?: number) {
    return this.prisma.enrollment.findMany({
      where: {
        ...(filter.courseId ? { courseId: filter.courseId } : {}),
        ...(studentId ? { userId: studentId } : filter.userId ? { userId: filter.userId } : {}),
      },
      orderBy: { id: 'asc' },
    })
  }

  findById(id: number) { return this.prisma.enrollment.findUnique({ where: { id } }) }

  create(input: { userId: number; courseId: number; enrolledAt: Date }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      if (input.enrolledAt > new Date()) throw httpError(400, 'VALIDATION_ERROR', 'A data de matrícula não pode estar no futuro')
      const [user, course] = await Promise.all([
        transaction.user.findUnique({ where: { id: input.userId }, select: { role: true } }),
        transaction.course.findUnique({ where: { id: input.courseId }, select: { id: true } }),
      ])
      if (!user || !course) throw httpError(404, 'NOT_FOUND', 'Aluno ou curso não encontrado')
      if (user.role !== 'student') throw httpError(409, 'STUDENT_REQUIRED', 'A matrícula precisa pertencer a um aluno')
      const duplicate = await transaction.enrollment.findUnique({
        where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
      })
      if (duplicate) throw httpError(409, 'ENROLLMENT_ALREADY_EXISTS', 'O aluno já está matriculado neste curso')
      await lockCourseLearning(transaction, input.courseId)
      const [progress, certificate] = await Promise.all([
        transaction.lessonProgress.findMany({
          where: { userId: input.userId, lesson: { module: { courseId: input.courseId } }, status: 'Completed' },
          select: { completedAt: true },
        }),
        transaction.certificate.findUnique({ where: { userId_courseId: { userId: input.userId, courseId: input.courseId } }, select: { issuedAt: true } }),
      ])
      if (progress.some((item) => item.completedAt && item.completedAt < input.enrolledAt)
        || (certificate && certificate.issuedAt < input.enrolledAt)) {
        throw httpError(409, 'ENROLLMENT_DATE_PRECEDES_ACTIVITY', 'A matrícula não pode ser posterior a atividade ou certificado existente')
      }
      return transaction.enrollment.create({ data: input })
    })
  }

  update(id: number, input: { userId: number; courseId: number; enrolledAt: Date }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const enrollment = await transaction.enrollment.findUnique({ where: { id } })
      if (!enrollment) throw httpError(404, 'NOT_FOUND', 'Matrícula não encontrada')
      if (input.userId !== enrollment.userId || input.courseId !== enrollment.courseId) {
        throw httpError(409, 'ENROLLMENT_TARGET_CHANGE_FORBIDDEN', 'Aluno e curso da matrícula são imutáveis')
      }
      if (input.enrolledAt > new Date()) throw httpError(400, 'VALIDATION_ERROR', 'A data de matrícula não pode estar no futuro')
      await lockCourseLearning(transaction, enrollment.courseId)
      const [progress, certificate] = await Promise.all([
        transaction.lessonProgress.findMany({
          where: { userId: enrollment.userId, lesson: { module: { courseId: enrollment.courseId } }, status: 'Completed' },
          select: { completedAt: true },
        }),
        transaction.certificate.findUnique({ where: { userId_courseId: { userId: enrollment.userId, courseId: enrollment.courseId } }, select: { issuedAt: true } }),
      ])
      if (progress.some((item) => item.completedAt && item.completedAt < input.enrolledAt)
        || (certificate && certificate.issuedAt < input.enrolledAt)) {
        throw httpError(409, 'ENROLLMENT_DATE_PRECEDES_ACTIVITY', 'A matrícula não pode ser posterior a atividade ou certificado existente')
      }
      return transaction.enrollment.update({ where: { id }, data: { enrolledAt: input.enrolledAt } })
    })
  }

  remove(id: number) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const enrollment = await transaction.enrollment.findUnique({ where: { id } })
      if (!enrollment) throw httpError(404, 'NOT_FOUND', 'Matrícula não encontrada')
      await lockCourseLearning(transaction, enrollment.courseId)
      await transaction.lessonProgress.deleteMany({
        where: { userId: enrollment.userId, lesson: { module: { courseId: enrollment.courseId } } },
      })
      await transaction.certificate.deleteMany({ where: { userId: enrollment.userId, courseId: enrollment.courseId } })
      return transaction.enrollment.delete({ where: { id } })
    })
  }
}
