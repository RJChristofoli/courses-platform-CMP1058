import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ParsePositiveIntPipe } from '../../common/pipes/parse-positive-int.pipe'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { CertificatesService } from './certificates.service'
import { CreateCertificateDto, ListCertificatesDto, UpdateCertificateDto } from './dto/certificate.dto'

@ApiTags('Certificates')
@ApiBearerAuth()
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Admin consulta todos; aluno consulta os próprios certificados' })
  list(@Query() filter: ListCertificatesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificates.list(filter, actor)
  }

  @Get(':id')
  get(@Param('id', ParsePositiveIntPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificates.get(id, actor)
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Emite certificado de curso concluído (admin)' })
  @ApiResponse({ status: 409, description: 'Curso incompleto, contexto incorreto ou certificado existente' })
  create(@Body() input: CreateCertificateDto) { return this.certificates.create(input) }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualiza contexto da trilha; código e emissão permanecem imutáveis' })
  update(@Param('id', ParsePositiveIntPipe) id: number, @Body() input: UpdateCertificateDto) {
    return this.certificates.update(id, input)
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParsePositiveIntPipe) id: number) { return this.certificates.remove(id) }
}
