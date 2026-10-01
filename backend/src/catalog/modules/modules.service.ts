import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { httpError } from '../../common/http-error'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateModuleDto, ReorderModulesDto, UpdateModuleDto } from './dto/module.dto'
import { ModulesRepository } from './modules.repository'

@Injectable()
export class ModulesService {
  constructor(private readonly modules: ModulesRepository, private readonly prisma: PrismaService) {}

  async list(courseId: number | undefined, actor: AuthenticatedUser) {
    return this.modules.list(courseId, actor.role === 'instructor' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    const module = await this.modules.findById(id)
    if (!module) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
    if (actor.role === 'instructor' && !await this.ownsCourse(module.courseId, actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
    }
    return module
  }

  async create(input: CreateModuleDto) {
    await this.assertCourse(input.courseId)
    return this.modules.create(input)
  }

  async update(id: number, input: UpdateModuleDto) {
    await this.assertCourse(input.courseId)
    return this.modules.update(id, input)
  }

  async remove(id: number) {
    const module = await this.modules.findById(id)
    if (!module) throw httpError(404, 'NOT_FOUND', 'Módulo não encontrado')
    await this.modules.remove(id)
    return undefined
  }

  async reorder(courseId: number, input: ReorderModulesDto) {
    await this.assertCourse(courseId)
    return this.modules.reorder(courseId, input.moduleIds)
  }

  private assertCourse(courseId: number) {
    return this.prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }).then((course) => {
      if (!course) throw httpError(404, 'NOT_FOUND', 'Curso não encontrado')
    })
  }

  private async ownsCourse(courseId: number, instructorId: number) {
    return !!await this.prisma.course.findFirst({ where: { id: courseId, instructorId }, select: { id: true } })
  }
}
