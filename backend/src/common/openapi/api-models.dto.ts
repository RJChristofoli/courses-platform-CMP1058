import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ValidationDetailResponseDto {
  @ApiProperty({ example: 'email' })
  field!: string

  @ApiProperty({ example: 'email must be an email' })
  message!: string
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 409 })
  statusCode!: number

  @ApiProperty({ example: 'CONFLICT' })
  code!: string

  @ApiProperty({ example: 'A operação não pode ser concluída devido a uma regra de negócio' })
  message!: string

  @ApiPropertyOptional({ type: [ValidationDetailResponseDto] })
  details?: ValidationDetailResponseDto[]

  @ApiPropertyOptional({ example: '/courses/9' })
  path?: string
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 'Ana Souza' })
  fullName!: string

  @ApiProperty({ example: 'ana@example.com' })
  email!: string

  @ApiProperty({ enum: ['admin', 'instructor', 'student'], example: 'student' })
  role!: 'admin' | 'instructor' | 'student'

  @ApiProperty({ format: 'date-time', example: '2026-10-01T12:00:00.000Z' })
  createdAt!: string
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Token JWT assinado em HS256' })
  accessToken!: string

  @ApiProperty({ enum: ['Bearer'], example: 'Bearer' })
  tokenType!: 'Bearer'

  @ApiProperty({ example: 3600, description: 'Validade em segundos' })
  expiresIn!: number

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto
}

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 'Desenvolvimento Web' })
  name!: string

  @ApiProperty({ example: 'Cursos de desenvolvimento e arquitetura web' })
  description!: string
}

export class CourseResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 'React para Plataformas Escaláveis' })
  title!: string

  @ApiProperty({ example: 'Interfaces modulares e acessíveis' })
  description!: string

  @ApiProperty({ example: 2 })
  instructorId!: number

  @ApiProperty({ example: 1 })
  categoryId!: number

  @ApiProperty({ example: 'Intermediário' })
  level!: string

  @ApiProperty({ format: 'date-time', example: '2026-09-05T12:00:00.000Z' })
  publishedAt!: string

  @ApiProperty({ example: 12, description: 'Quantidade de aulas calculada a partir dos módulos' })
  totalLessons!: number

  @ApiProperty({ example: 8.5, description: 'Carga horária calculada a partir da duração das aulas' })
  totalHours!: number
}

export class ModuleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 1 })
  courseId!: number

  @ApiProperty({ example: 'Fundamentos' })
  title!: string

  @ApiProperty({ example: 1, minimum: 1 })
  order!: number
}

export class LessonResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 1 })
  moduleId!: number

  @ApiProperty({ example: 'Introdução' })
  title!: string

  @ApiProperty({ example: 'Video' })
  contentType!: string

  @ApiProperty({ example: 'https://example.com/aula' })
  contentUrl!: string

  @ApiProperty({ example: 30, minimum: 0 })
  durationMinutes!: number

  @ApiProperty({ example: 1, minimum: 1 })
  order!: number
}

export class TrackResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 'Jornada Web' })
  title!: string

  @ApiProperty({ example: 'Fundamentos para criar aplicações web' })
  description!: string

  @ApiProperty({ example: 1 })
  categoryId!: number
}

export class TrackCourseResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 1 })
  trackId!: number

  @ApiProperty({ example: 1 })
  courseId!: number

  @ApiProperty({ example: 1, minimum: 1 })
  order!: number
}

export class EnrollmentResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 3 })
  userId!: number

  @ApiProperty({ example: 1 })
  courseId!: number

  @ApiProperty({ format: 'date-time', example: '2026-09-05T12:00:00.000Z' })
  enrolledAt!: string

  @ApiProperty({ format: 'date-time', nullable: true, example: '2026-09-11T12:00:00.000Z', description: 'Calculado quando todas as aulas estão concluídas' })
  completedAt!: string | null
}

export class LessonProgressResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 3 })
  userId!: number

  @ApiProperty({ example: 1 })
  lessonId!: number

  @ApiProperty({ enum: ['Concluido', 'Em andamento'], example: 'Concluido' })
  status!: 'Concluido' | 'Em andamento'

  @ApiProperty({ format: 'date-time', nullable: true, example: '2026-09-11T12:00:00.000Z' })
  completedAt!: string | null
}

export class CertificateResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 3 })
  userId!: number

  @ApiProperty({ example: 1 })
  courseId!: number

  @ApiProperty({ type: Number, nullable: true, example: 1 })
  trackId!: number | null

  @ApiProperty({ format: 'uuid', example: 'a1a9ec58-53c9-4d61-a22b-6cd8d84b04bd' })
  verificationCode!: string

  @ApiProperty({ format: 'date-time', example: '2026-09-11T12:00:00.000Z' })
  issuedAt!: string
}

export class PlanResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 'Essencial' })
  name!: string

  @ApiProperty({ example: 'Acesso por um mês' })
  description!: string

  @ApiProperty({ type: String, format: 'decimal', pattern: '^\\d{1,10}\\.\\d{2}$', example: '49.90' })
  price!: string

  @ApiProperty({ example: 1, minimum: 1 })
  durationMonths!: number
}

export class SubscriptionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 3 })
  userId!: number

  @ApiProperty({ example: 1 })
  planId!: number

  @ApiProperty({ format: 'date-time', example: '2026-09-05T12:00:00.000Z' })
  startDate!: string

  @ApiProperty({ format: 'date-time', example: '2026-10-05T12:00:00.000Z' })
  endDate!: string

  @ApiProperty({ enum: ['active', 'paused', 'cancelled', 'expired'], example: 'active' })
  status!: 'active' | 'paused' | 'cancelled' | 'expired'
}

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  id!: number

  @ApiProperty({ example: 1 })
  subscriptionId!: number

  @ApiProperty({ type: String, format: 'decimal', pattern: '^\\d{1,10}\\.\\d{2}$', example: '49.90' })
  amountPaid!: string

  @ApiProperty({ format: 'date-time', example: '2026-09-05T12:00:00.000Z' })
  paymentDate!: string

  @ApiProperty({ example: 'Pix' })
  paymentMethod!: string

  @ApiProperty({ example: 'DEMO-TRX-001' })
  gatewayTransactionId!: string
}

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  status!: 'ok'
}
