import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: { id: 'asc' } })
  }

  findById(id: number) {
    return this.prisma.category.findUnique({ where: { id } })
  }

  create(input: { name: string; description: string }) {
    return this.prisma.category.create({ data: { name: input.name.trim(), description: input.description.trim() } })
  }

  update(id: number, input: { name: string; description: string }) {
    return this.prisma.category.update({ where: { id }, data: { name: input.name.trim(), description: input.description.trim() } })
  }

  async inUse(id: number) {
    const [courses, tracks] = await Promise.all([
      this.prisma.course.count({ where: { categoryId: id } }),
      this.prisma.track.count({ where: { categoryId: id } }),
    ])
    return courses + tracks > 0
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } })
  }
}
