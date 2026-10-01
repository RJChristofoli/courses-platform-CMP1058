import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CourseDto, ListCoursesDto } from './dto/course.dto'
import { CoursesService } from './courses.service'

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista cursos; instructor recebe somente os próprios' })
  list(@Query() filter: ListCoursesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.courses.list(filter, actor)
  }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.courses.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Cria curso (admin)' })
  create(@Body() input: CourseDto) { return this.courses.create(input) }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: CourseDto) {
    return this.courses.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.courses.remove(id) }
}
