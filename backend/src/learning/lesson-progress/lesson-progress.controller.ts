import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateLessonProgressDto, ListLessonProgressDto, UpdateLessonProgressDto } from './dto/lesson-progress.dto'
import { LessonProgressService } from './lesson-progress.service'

@ApiTags('LessonProgress')
@ApiBearerAuth()
@Controller('lessonProgress')
export class LessonProgressController {
  constructor(private readonly progress: LessonProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Admin lista tudo; aluno consulta seu próprio progresso' })
  list(@Query() filter: ListLessonProgressDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.progress.list(filter, actor)
  }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.progress.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Registra progresso; exige matrícula (admin)' })
  @ApiResponse({ status: 409, description: 'Matrícula ausente, duplicidade ou data incompatível' })
  create(@Body() input: CreateLessonProgressDto) { return this.progress.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza estado do progresso, mantendo aluno e aula (admin)' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateLessonProgressDto) {
    return this.progress.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.progress.remove(id) }
}
