import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateLessonDto, ListLessonsDto, ReorderLessonsDto, UpdateLessonDto } from './dto/lesson.dto'
import { LessonsService } from './lessons.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { ApiErrorResponseDto, LessonResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Lessons')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller()
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get('lessons')
  @ApiOperation({ summary: 'Lista aulas; instructor recebe apenas aulas dos próprios cursos' })
  @ApiListResponse(LessonResponseDto, 'Aulas ordenadas por módulo e posição')
  list(@Query() filter: ListLessonsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.lessons.list(filter, actor)
  }

  @Get('lessons/:id')
  @ApiItemResponse(LessonResponseDto, 'Aula consultada')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.lessons.get(id, actor)
  }

  @Post('lessons')
  @Roles('admin')
  @ApiOperation({ summary: 'Cria aula em um módulo (admin)' })
  @ApiCreatedItemResponse(LessonResponseDto, 'Aula criada com posição')
  create(@Body() input: CreateLessonDto) { return this.lessons.create(input) }

  @Put('lessons/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza aula e sua posição (admin)' })
  @ApiItemResponse(LessonResponseDto, 'Aula atualizada')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Aula não pode mudar de curso' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateLessonDto) {
    return this.lessons.update(id, input)
  }

  @Put('courses/:courseId/lessons/order')
  @Roles('admin')
  @ApiOperation({ summary: 'Substitui a ordem e módulo de todas as aulas do curso' })
  @ApiListResponse(LessonResponseDto, 'Aulas atualizadas em transação')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Lista não corresponde à estrutura atual' })
  reorder(
    @Param('courseId', ParsePositiveIntPipe) courseId: number,
    @Body() input: ReorderLessonsDto,
  ) {
    return this.lessons.reorder(courseId, input)
  }

  @Delete('lessons/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Aula removida e conclusão do curso recalculada')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.lessons.remove(id) }
}
