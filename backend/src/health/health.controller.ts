import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PrismaService } from '../prisma/prisma.service'
import { Public } from '../common/decorators/public.decorator'
import { ApiErrorResponseDto, HealthResponseDto } from '../common/openapi/api-models.dto'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Verifica a disponibilidade da API e do banco' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  @ApiResponse({ status: 503, type: ApiErrorResponseDto, description: 'Banco indisponível' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { status: 'ok' }
    } catch {
      throw new ServiceUnavailableException('Banco de dados indisponível')
    }
  }
}
