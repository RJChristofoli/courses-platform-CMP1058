import { Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { PrismaService } from '../../prisma/prisma.service'
import { ListTrackCoursesDto, ListTracksDto, TrackDto } from './dto/track.dto'
import { TrackCoursesRepository } from './track-courses.repository'
import { TracksRepository } from './tracks.repository'

@Injectable()
export class TracksService {
  constructor(
    private readonly tracks: TracksRepository,
    private readonly trackCourses: TrackCoursesRepository,
    private readonly prisma: PrismaService,
  ) {}

  list(filter: ListTracksDto) { return this.tracks.list(filter.categoryId) }

  async get(id: number) {
    const track = await this.tracks.findById(id)
    if (!track) throw httpError(404, 'NOT_FOUND', 'Trilha não encontrada')
    return track
  }

  async create(input: TrackDto) {
    await this.validateReferences(input)
    return this.tracks.create(input)
  }

  async update(id: number, input: TrackDto) {
    await this.get(id)
    await this.validateReferences(input)
    return this.tracks.update(id, input)
  }

  async remove(id: number) {
    await this.get(id)
    await this.tracks.remove(id)
  }

  listRelations(filter: ListTrackCoursesDto, actor: AuthenticatedUser) {
    return this.trackCourses.list(filter, actor)
  }

  async getRelation(id: number, actor: AuthenticatedUser) {
    const relation = await this.trackCourses.findById(id, actor)
    if (!relation) throw httpError(404, 'NOT_FOUND', 'Vínculo não encontrado')
    return relation
  }

  private async validateReferences(input: TrackDto) {
    const category = await this.prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } })
    if (!category) throw httpError(404, 'NOT_FOUND', 'Categoria não encontrada')
    if (!input.courseIds.length) return
    const courses = await this.prisma.course.findMany({ where: { id: { in: input.courseIds } }, select: { id: true } })
    if (courses.length !== input.courseIds.length) throw httpError(404, 'NOT_FOUND', 'Um ou mais cursos não foram encontrados')
  }
}
