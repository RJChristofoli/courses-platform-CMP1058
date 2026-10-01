import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { Roles } from '../../common/decorators/roles.decorator'
import { CategoryDto } from './dto/category.dto'
import { CategoriesService } from './categories.service'

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista categorias' })
  list() { return this.categories.list() }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number) { return this.categories.get(id) }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria categoria (admin)' })
  @ApiResponse({ status: 201 })
  create(@Body() input: CategoryDto) { return this.categories.create(input) }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: CategoryDto) {
    return this.categories.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 409, description: 'Categoria ainda em uso' })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.categories.remove(id) }
}
