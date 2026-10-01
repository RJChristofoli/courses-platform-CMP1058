import { applyDecorators, type Type } from '@nestjs/common'
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger'
import { ApiErrorResponseDto } from './api-models.dto'

export function ApiListResponse(model: Type<unknown>, description: string) {
  return ApiOkResponse({ type: [model], description })
}

export function ApiItemResponse(model: Type<unknown>, description: string) {
  return ApiOkResponse({ type: model, description })
}

export function ApiCreatedItemResponse(model: Type<unknown>, description: string) {
  return ApiCreatedResponse({ type: model, description })
}

export function ApiDeletedResponse(description: string) {
  return ApiNoContentResponse({ description })
}

export function ApiCommonErrors() {
  return applyDecorators(
    ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Entrada ou filtro inválido' }),
    ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Token ausente, inválido ou expirado' }),
    ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Perfil sem permissão para a operação' }),
    ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Registro não encontrado ou fora do escopo' }),
    ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Conflito de integridade ou regra de negócio' }),
  )
}

export function ApiLoginErrors() {
  return applyDecorators(
    ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Email ou senha em formato inválido' }),
    ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Credenciais inválidas' }),
  )
}
