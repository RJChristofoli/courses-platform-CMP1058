import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CreateEnrollmentDto, ListEnrollmentsDto, UpdateEnrollmentDto } from './dto/enrollment.dto'
import { EnrollmentsService } from './enrollments.service'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { ApiErrorResponseDto, EnrollmentResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Enrollments')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin consulta todas; aluno consulta as próprias matrículas' })
  @ApiListResponse(EnrollmentResponseDto, 'Matrículas planas com conclusão calculada ou nula')
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Instrutor sem acesso' })
  list(@Query() filter: ListEnrollmentsDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.enrollments.list(filter, actor)
  }

  @Get(':id')
  @ApiItemResponse(EnrollmentResponseDto, 'Matrícula e data de conclusão calculada')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.enrollments.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Matricula aluno em curso (admin)' })
  @ApiCreatedItemResponse(EnrollmentResponseDto, 'Matrícula criada sem conclusão inicial')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Aluno inválido ou matrícula duplicada' })
  create(@Body() input: CreateEnrollmentDto) { return this.enrollments.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza data da matrícula; aluno, curso e conclusão são calculados' })
  @ApiItemResponse(EnrollmentResponseDto, 'Matrícula atualizada com conclusão recalculada')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateEnrollmentDto) {
    return this.enrollments.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove matrícula, progresso do curso e certificado associado' })
  @ApiDeletedResponse('Matrícula e registros dependentes removidos em transação')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.enrollments.remove(id) }
}
