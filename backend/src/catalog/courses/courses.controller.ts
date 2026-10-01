import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CourseDto, ListCoursesDto } from './dto/course.dto'
import { CoursesService } from './courses.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { CourseResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Courses')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista cursos; instructor recebe somente os próprios' })
  @ApiListResponse(CourseResponseDto, 'Cursos planos; totalLessons e totalHours são calculados pelo backend')
  list(@Query() filter: ListCoursesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.courses.list(filter, actor)
  }

  @Get(':id')
  @ApiItemResponse(CourseResponseDto, 'Curso com quantidade de aulas e carga horária calculadas')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.courses.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria curso (admin)' })
  @ApiCreatedItemResponse(CourseResponseDto, 'Curso criado com totalizações calculadas')
  create(@Body() input: CourseDto) { return this.courses.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiItemResponse(CourseResponseDto, 'Curso atualizado com totalizações calculadas')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: CourseDto) {
    return this.courses.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Curso removido com a política de cascata documentada')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.courses.remove(id) }
}
