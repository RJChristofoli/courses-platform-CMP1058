import { Injectable } from '@nestjs/common'
import { httpError } from '../../common/http-error'
import { CategoriesRepository } from './categories.repository'
import { CategoryDto } from './dto/category.dto'

@Injectable()
export class CategoriesService {
  constructor(private readonly categories: CategoriesRepository) {}

  list() { return this.categories.list() }

  async get(id: number) {
    const category = await this.categories.findById(id)
    if (!category) throw httpError(404, 'NOT_FOUND', 'Categoria não encontrada')
    return category
  }

  create(input: CategoryDto) { return this.categories.create(input) }

  async update(id: number, input: CategoryDto) {
    await this.get(id)
    return this.categories.update(id, input)
  }

  async remove(id: number) {
    await this.get(id)
    if (await this.categories.inUse(id)) throw httpError(409, 'CATEGORY_IN_USE', 'A categoria possui cursos ou trilhas')
    await this.categories.remove(id)
  }
}
