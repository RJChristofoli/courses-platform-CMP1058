import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CertificatesService } from './certificates.service'
import { CreateCertificateDto, ListCertificatesDto, UpdateCertificateDto } from './dto/certificate.dto'
import { ApiCommonErrors, ApiCreatedItemResponse, ApiDeletedResponse, ApiItemResponse, ApiListResponse } from '../../common/openapi/api-docs'
import { ApiErrorResponseDto, CertificateResponseDto } from '../../common/openapi/api-models.dto'

@ApiTags('Certificates')
@ApiBearerAuth()
@ApiCommonErrors()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Admin consulta todos; aluno consulta os próprios certificados' })
  @ApiListResponse(CertificateResponseDto, 'Certificados com UUID, emissão e trackId anulável')
  list(@Query() filter: ListCertificatesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificates.list(filter, actor)
  }

  @Get(':id')
  @ApiItemResponse(CertificateResponseDto, 'Certificado consultado')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificates.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Emite certificado de curso concluído (admin)' })
  @ApiCreatedItemResponse(CertificateResponseDto, 'Certificado emitido com código UUID gerado pelo servidor')
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Curso incompleto, contexto incorreto ou certificado existente' })
  create(@Body() input: CreateCertificateDto) { return this.certificates.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza contexto da trilha; código e emissão permanecem imutáveis' })
  @ApiItemResponse(CertificateResponseDto, 'Contexto do certificado atualizado')
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateCertificateDto) {
    return this.certificates.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeletedResponse('Certificado removido')
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.certificates.remove(id) }
}
