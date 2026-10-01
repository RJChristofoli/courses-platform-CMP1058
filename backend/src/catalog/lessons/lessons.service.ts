import { Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateLessonDto, ListLessonsDto, ReorderLessonsDto, UpdateLessonDto } from './dto/lesson.dto'
import { LessonsRepository } from './lessons.repository'

@Injectable()
export class LessonsService {
  constructor(private readonly lessons: LessonsRepository, private readonly prisma: PrismaService) {}

  list(filter: ListLessonsDto, actor: AuthenticatedUser) {
    return this.lessons.list(filter.moduleId, actor.role === 'instructor' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    const lesson = await this.lessons.findById(id)
    if (!lesson) throw httpError(404, 'NOT_FOUND', 'Aula não encontrada')
    if (actor.role === 'instructor' && !await this.ownsModule(lesson.moduleId, actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Aula não encontrada')
    }
    return lesson
  }

  async create(input: CreateLessonDto) {
    await this.assertModule(input.moduleId)
    return this.lessons.create(input)
  }

  async update(id: number, input: UpdateLessonDto) {
    await this.lessons.findById(id).then((lesson) => {
      if (!lesson) throw httpError(404, 'NOT_FOUND', 'Aula não encontrada')
    })
    await this.assertModule(input.moduleId)
    return this.lessons.update(id, input)
  }

  async remove(id: number) {
    await this.lessons.remove(id)
  }

  async reorder(courseId: number, input: ReorderLessonsDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) throw httpError(404, 'NOT_FOUND', 'Curso não encontrado')
    return this.lessons.reorder(courseId, input.lessons)
  }

  private async assertModule(moduleId: number) {
    if (!await this.prisma.module.findUnique({ where: { id: moduleId }, select: { id: true } })) {
      throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
    }
  }

  private async ownsModule(moduleId: number, instructorId: number) {
    return !!await this.prisma.module.findFirst({ where: { id: moduleId, course: { instructorId } }, select: { id: true } })
  }
}
