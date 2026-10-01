import { ForbiddenException, Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { CreateLessonProgressDto, ListLessonProgressDto, UpdateLessonProgressDto } from './dto/lesson-progress.dto'
import { LessonProgressRepository } from './lesson-progress.repository'

@Injectable()
export class LessonProgressService {
  constructor(private readonly progress: LessonProgressRepository) {}

  list(filter: ListLessonProgressDto, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    return this.progress.list(filter, actor.role === 'student' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    const record = await this.progress.findById(id)
    if (!record || (actor.role === 'student' && record.userId !== actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Progresso não encontrado')
    }
    return record
  }

  create(input: CreateLessonProgressDto) { return this.progress.create(this.toInput(input)) }

  async update(id: number, input: UpdateLessonProgressDto) {
    return this.progress.update(id, this.toInput(input))
  }

  async remove(id: number) { await this.progress.remove(id) }

  private toInput(input: CreateLessonProgressDto) {
    return {
      userId: input.userId,
      lessonId: input.lessonId,
      status: input.status,
      completedAt: input.completedAt == null ? input.completedAt : new Date(input.completedAt),
    }
  }

  private assertReadable(actor: AuthenticatedUser) {
    if (actor.role === 'instructor') throw new ForbiddenException('Instrutores não acessam progresso dos alunos')
  }
}
