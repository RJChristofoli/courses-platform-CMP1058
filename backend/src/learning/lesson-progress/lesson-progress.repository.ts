import { Injectable } from '@nestjs/common'
import { Prisma, ProgressStatus } from '@prisma/client'
import { httpError } from '../../common/http-error'
import { lockCourseLearning, recomputeCourseCompletion, withSerializableRetry } from '../../common/transactions'
import { PrismaService } from '../../prisma/prisma.service'

const statusMap = { Concluido: 'Completed', 'Em andamento': 'InProgress' } as const

function present<T extends { status: ProgressStatus }>(progress: T) {
  return { ...progress, status: progress.status === 'Completed' ? 'Concluido' : 'Em andamento' }
}

@Injectable()
export class LessonProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: { userId?: number; lessonId?: number; status?: 'Concluido' | 'Em andamento' }, studentId?: number) {
    const rows = await this.prisma.lessonProgress.findMany({
      where: {
        ...(filter.lessonId ? { lessonId: filter.lessonId } : {}),
        ...(studentId ? { userId: studentId } : filter.userId ? { userId: filter.userId } : {}),
        ...(filter.status ? { status: statusMap[filter.status] } : {}),
      },
      orderBy: { id: 'asc' },
    })
    return rows.map(present)
  }

  async findById(id: number) {
    const progress = await this.prisma.lessonProgress.findUnique({ where: { id } })
    return progress ? present(progress) : null
  }

  create(input: { userId: number; lessonId: number; status: 'Concluido' | 'Em andamento'; completedAt?: Date | null }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const lesson = await transaction.lesson.findUnique({ where: { id: input.lessonId }, include: { module: { select: { courseId: true } } } })
      if (!lesson) throw httpError(404, 'NOT_FOUND', 'Aula não encontrada')
      await lockCourseLearning(transaction, lesson.module.courseId)
      return present(await this.writeProgress(transaction, null, input, lesson.module.courseId))
    })
  }

  update(id: number, input: { userId: number; lessonId: number; status: 'Concluido' | 'Em andamento'; completedAt?: Date | null }) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const current = await transaction.lessonProgress.findUnique({ where: { id }, include: { lesson: { include: { module: { select: { courseId: true } } } } } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Progresso não encontrado')
      if (input.userId !== current.userId || input.lessonId !== current.lessonId) {
        throw httpError(409, 'PROGRESS_TARGET_CHANGE_FORBIDDEN', 'Aluno e aula do progresso são imutáveis')
      }
      const courseId = current.lesson.module.courseId
      await lockCourseLearning(transaction, courseId)
      return present(await this.writeProgress(transaction, current, input, courseId))
    })
  }

  remove(id: number) {
    return withSerializableRetry(this.prisma, async (transaction) => {
      const current = await transaction.lessonProgress.findUnique({ where: { id }, include: { lesson: { include: { module: { select: { courseId: true } } } } } })
      if (!current) throw httpError(404, 'NOT_FOUND', 'Progresso não encontrado')
      const courseId = current.lesson.module.courseId
      await lockCourseLearning(transaction, courseId)
      const deleted = await transaction.lessonProgress.delete({ where: { id } })
      await recomputeCourseCompletion(transaction, courseId)
      return present(deleted)
    })
  }

  private async writeProgress(
    transaction: Prisma.TransactionClient,
    current: Prisma.LessonProgressGetPayload<{ include: { lesson: { include: { module: { select: { courseId: true } } } } } }> | null,
    input: { userId: number; lessonId: number; status: 'Concluido' | 'Em andamento'; completedAt?: Date | null },
    courseId: number,
  ) {
    const user = await transaction.user.findUnique({ where: { id: input.userId }, select: { role: true } })
    if (!user) throw httpError(404, 'NOT_FOUND', 'Aluno não encontrado')
    if (user.role !== 'student') throw httpError(409, 'STUDENT_REQUIRED', 'O progresso precisa pertencer a um aluno')
    const enrollment = await transaction.enrollment.findUnique({ where: { userId_courseId: { userId: input.userId, courseId } } })
    if (!enrollment) throw httpError(409, 'ENROLLMENT_REQUIRED', 'O aluno precisa estar matriculado no curso')

    let completedAt: Date | null = null
    if (input.status === 'Concluido') {
      completedAt = input.completedAt ?? (current?.status === 'Completed' ? current.completedAt : null) ?? new Date()
      if (completedAt > new Date()) throw httpError(400, 'VALIDATION_ERROR', 'A conclusão não pode estar no futuro')
      if (completedAt < enrollment.enrolledAt) throw httpError(409, 'PROGRESS_PRECEDES_ENROLLMENT', 'A conclusão não pode preceder a matrícula')
    } else if (input.completedAt != null) {
      throw httpError(400, 'VALIDATION_ERROR', 'Progresso em andamento deve ter completedAt nulo')
    }

    const data = { status: statusMap[input.status], completedAt }
    const result = current
      ? await transaction.lessonProgress.update({ where: { id: current.id }, data })
      : await transaction.lessonProgress.create({ data: { ...data, userId: input.userId, lessonId: input.lessonId } })
    await recomputeCourseCompletion(transaction, courseId)
    return result
  }
}
