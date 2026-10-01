import { ForbiddenException, Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { CreateEnrollmentDto, ListEnrollmentsDto, UpdateEnrollmentDto } from './dto/enrollment.dto'
import { EnrollmentsRepository } from './enrollments.repository'

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollments: EnrollmentsRepository) {}

  list(filter: ListEnrollmentsDto, actor: AuthenticatedUser) {
    if (actor.role === 'instructor') throw new ForbiddenException('Instrutores não acessam dados de matrícula')
    return this.enrollments.list(filter, actor.role === 'student' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    if (actor.role === 'instructor') throw new ForbiddenException('Instrutores não acessam dados de matrícula')
    const enrollment = await this.enrollments.findById(id)
    if (!enrollment || (actor.role === 'student' && enrollment.userId !== actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Matrícula não encontrada')
    }
    return enrollment
  }

  create(input: CreateEnrollmentDto) {
    return this.enrollments.create({
      userId: input.userId,
      courseId: input.courseId,
      enrolledAt: input.enrolledAt ? new Date(input.enrolledAt) : new Date(),
    })
  }

  async update(id: number, input: UpdateEnrollmentDto) {
    return this.enrollments.update(id, {
      userId: input.userId,
      courseId: input.courseId,
      enrolledAt: new Date(input.enrolledAt),
    })
  }

  async remove(id: number) { await this.enrollments.remove(id) }
}
