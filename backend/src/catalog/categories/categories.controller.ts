import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { Roles } from '../../common/decorators/roles.decorator'
import { CategoryDto } from './dto/category.dto'
import { CategoriesService } from './categories.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { CategoryResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Categories')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista categorias' })
  @ApiListResponse(CategoryResponseDto, 'Categorias em ordem crescente de ID')
  list() { return this.categories.list() }

  @Get(':id')
  @ApiItemResponse(CategoryResponseDto, 'Categoria consultada')
  get(@Param('id', ParsePositiveIntPipe) id: number) { return this.categories.get(id) }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria categoria (admin)' })
  @ApiCreatedItemResponse(CategoryResponseDto, 'Categoria criada')
  create(@Body() input: CategoryDto) { return this.categories.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiItemResponse(CategoryResponseDto, 'Categoria atualizada')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: CategoryDto) {
    return this.categories.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Categoria removida sem dependências acadêmicas')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.categories.remove(id) }
}
