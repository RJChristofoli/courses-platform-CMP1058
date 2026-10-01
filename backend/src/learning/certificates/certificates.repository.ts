import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { Prisma } from '@prisma/client'
import { httpError } from '../../common/http-error'
import { advisoryLock, lockCourseLearning, withSerializableRetry } from '../../common/transactions'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CertificatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: { userId?: number; courseId?: number; trackId?: number; verificationCode?: string }, studentId?: number) {
    const where: Prisma.CertificateWhereInput = {
      ...(filter.courseId ? { courseId: filter.courseId } : {}),
      ...(filter.trackId ? { trackId: filter.trackId } : {}),
      ...(filter.verificationCode ? { verificationCode: filter.verificationCode } : {}),
      ...(studentId ? { userId: studentId } : filter.userId ? { userId: filter.userId } : {}),
    }
    return this.prisma.certificate.findMany({ where, orderBy: { id: 'asc' } })
  }

  findById(id: number) { return this.prisma.certificate.findUnique({ where: { id } }) }

  create(input: { userId: number; courseId: number; trackId?: number | null }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      await lockCourseLearning(transaction, input.courseId)
      if (input.trackId) await advisoryLock(transaction, `track-courses-${input.trackId}`)
      const [user, course, enrollment, lessons] = await Promise.all([
        transaction.user.findUnique({ where: { id: input.userId }, select: { role: true } }),
        transaction.course.findUnique({ where: { id: input.courseId }, select: { id: true } }),
        transaction.enrollment.findUnique({ where: { userId_courseId: { userId: input.userId, courseId: input.courseId } } }),
        transaction.lesson.count({ where: { module: { courseId: input.courseId } } }),
      ])
      if (!user || !course) throw httpError(404, 'NOT_FOUND', 'Aluno ou curso não encontrado')
      if (user.role !== 'student') throw httpError(409, 'STUDENT_REQUIRED', 'O certificado precisa pertencer a um aluno')
      if (!enrollment) throw httpError(409, 'ENROLLMENT_REQUIRED', 'O aluno precisa estar matriculado no curso')
      if (lessons === 0 || !enrollment.completedAt) {
        throw httpError(409, 'COURSE_NOT_COMPLETED', 'O aluno precisa concluir o curso antes de receber o certificado')
      }
      if (input.trackId) {
        const track = await transaction.track.findUnique({ where: { id: input.trackId }, select: { id: true } })
        if (!track) throw httpError(404, 'NOT_FOUND', 'Trilha não encontrada')
        const relation = await transaction.trackCourse.findUnique({
          where: { trackId_courseId: { trackId: input.trackId, courseId: input.courseId } },
        })
        if (!relation) throw httpError(409, 'COURSE_NOT_IN_TRACK', 'A trilha não contém o curso informado')
      }
      const existing = await transaction.certificate.findUnique({
        where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
      })
      if (existing) throw httpError(409, 'CERTIFICATE_ALREADY_EXISTS', 'O aluno já possui certificado deste curso')
      return transaction.certificate.create({
        data: { userId: input.userId, courseId: input.courseId, trackId: input.trackId ?? null, verificationCode: randomUUID() },
      })
    })
  }

  update(id: number, input: { userId: number; courseId: number; trackId?: number | null }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const current = await transaction.certificate.findUnique({ where: { id } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Certificado não encontrado')
      if (current.userId !== input.userId || current.courseId !== input.courseId) {
        throw httpError(409, 'CERTIFICATE_TARGET_CHANGE_FORBIDDEN', 'Aluno e curso do certificado são imutáveis')
      }
      await lockCourseLearning(transaction, current.courseId)
      if (input.trackId) {
        await advisoryLock(transaction, `track-courses-${input.trackId}`)
        const track = await transaction.track.findUnique({ where: { id: input.trackId }, select: { id: true } })
        if (!track) throw httpError(404, 'NOT_FOUND', 'Trilha não encontrada')
        const relation = await transaction.trackCourse.findUnique({
          where: { trackId_courseId: { trackId: input.trackId, courseId: current.courseId } },
        })
        if (!relation) throw httpError(409, 'COURSE_NOT_IN_TRACK', 'A trilha não contém o curso informado')
      }
      return transaction.certificate.update({ where: { id }, data: { trackId: input.trackId ?? null } })
    })
  }

  remove(id: number) { return this.prisma.certificate.delete({ where: { id } }) }
}
