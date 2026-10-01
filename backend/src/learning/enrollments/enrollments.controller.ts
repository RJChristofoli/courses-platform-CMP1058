import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateEnrollmentDto, ListEnrollmentsDto, UpdateEnrollmentDto } from './dto/enrollment.dto'
import { EnrollmentsService } from './enrollments.service'

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin consulta todas; aluno consulta as próprias matrículas' })
  @ApiResponse({ status: 403, description: 'Instrutor sem acesso' })
  list(@Query() filter: ListEnrollmentsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.enrollments.list(filter, actor)
  }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.enrollments.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Matricula aluno em curso (admin)' })
  @ApiResponse({ status: 409, description: 'Aluno inválido ou matrícula duplicada' })
  create(@Body() input: CreateEnrollmentDto) { return this.enrollments.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza data da matrícula; aluno, curso e conclusão são calculados' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateEnrollmentDto) {
    return this.enrollments.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove matrícula, progresso do curso e certificado associado' })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.enrollments.remove(id) }
}
