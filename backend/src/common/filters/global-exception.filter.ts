import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2025') {
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: 'Registro não encontrado',
        })
      }
      if (['P2002', 'P2003', 'P2014'].includes(exception.code)) {
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: 'A operação viola uma regra de integridade dos dados',
        })
      }
    }

    const httpException = exception instanceof HttpException ? exception : null
    const status = httpException?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR
    if (status >= 500) this.logger.error(`Unhandled error on ${request.method} ${request.path}`)
    const body = httpException?.getResponse()
    const responseBody = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}
    const rawMessage = responseBody.message
    const isValidation = status === HttpStatus.BAD_REQUEST && Array.isArray(rawMessage)
    const message = typeof rawMessage === 'string'
      ? rawMessage
      : isValidation
        ? 'Dados inválidos'
        : typeof body === 'string'
          ? body
          : status >= 500
            ? 'Erro interno do servidor'
            : 'Não foi possível processar a solicitação'

    const details = isValidation
      ? rawMessage.map((entry) => ({ field: String(entry).split(' ')[0], message: String(entry) }))
      : undefined
    const code = typeof responseBody.code === 'string'
      ? responseBody.code
      : isValidation
        ? 'VALIDATION_ERROR'
        : status === HttpStatus.UNAUTHORIZED
          ? 'UNAUTHORIZED'
          : status === HttpStatus.FORBIDDEN
            ? 'FORBIDDEN'
            : status === HttpStatus.NOT_FOUND
              ? 'NOT_FOUND'
              : status === HttpStatus.CONFLICT
                ? 'CONFLICT'
                : status >= 500
                  ? 'INTERNAL_ERROR'
                  : 'BAD_REQUEST'

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
      ...(status >= 500 ? {} : { path: request.url }),
    })
  }
}
