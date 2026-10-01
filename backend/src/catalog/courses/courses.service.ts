import { Injectable } from '@nestjs/common'
import { httpError } from '../../common/http-error'
import { PrismaService } from '../../prisma/prisma.service'
import { CourseDto, ListCoursesDto } from './dto/course.dto'
import { CoursesRepository } from './courses.repository'
import { AuthenticatedUser } from '../../common/authenticated-user'

@Injectable()
export class CoursesService {
  constructor(private readonly courses: CoursesRepository, private readonly prisma: PrismaService) {}

  list(filter: ListCoursesDto, actor: AuthenticatedUser) { return this.courses.list(filter, actor) }

  async get(id: number, actor?: AuthenticatedUser) {
    const course = await this.courses.findById(id)
    if (!course || (actor?.role === 'instructor' && course.instructorId !== actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Curso não encontrado')
    }
    return course
  }

  async create(input: CourseDto) {
    await this.validateReferences(input)
    return this.courses.create(this.toInput(input))
  }

  async update(id: number, input: CourseDto) {
    await this.get(id)
    await this.validateReferences(input)
    return this.courses.update(id, this.toInput(input))
  }

  async remove(id: number) {
    await this.get(id)
    await this.courses.remove(id)
  }

  private async validateReferences(input: CourseDto) {
    const [category, instructor] = await Promise.all([
      this.prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { id: input.instructorId }, select: { id: true, role: true } }),
    ])
    if (!category) throw httpError(404, 'NOT_FOUND', 'Categoria não encontrada')
    if (!instructor) throw httpError(404, 'NOT_FOUND', 'Instrutor não encontrado')
    if (instructor.role !== 'instructor') throw httpError(409, 'INVALID_INSTRUCTOR', 'O curso deve pertencer a um instrutor')
  }

  private toInput(input: CourseDto) {
    return {
      title: input.title.trim(),
      description: input.description.trim(),
      instructorId: input.instructorId,
      categoryId: input.categoryId,
      level: input.level.trim(),
      publishedAt: new Date(input.publishedAt),
    }
  }
}
