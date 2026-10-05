import { INestApplication, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function configureApp(app: INestApplication) {
  app.enableCors({ origin: process.env.CORS_ORIGINS!.split(',').map((origin) => origin.trim()) })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Courses Platform API')
    .setDescription('API acadêmica e financeira para demonstração. Admin gerencia recursos; instructors consultam somente seus cursos; students consultam os próprios registros acadêmicos e financeiros. Rotas protegidas usam JWT Bearer; pagamentos são simulados.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('..', 'API relativa ao Swagger, com ou sem o proxy /api')
    .addTag('Auth', 'Cadastro, login e sessão JWT')
    .addTag('Users', 'Usuários e perfis')
    .addTag('Categories', 'Categorias do catálogo')
    .addTag('Courses', 'Cursos e totalizações calculadas')
    .addTag('Modules', 'Módulos e ordenação transacional')
    .addTag('Lessons', 'Aulas e ordenação transacional')
    .addTag('Tracks', 'Trilhas de cursos')
    .addTag('TrackCourses', 'Vínculos ordenados entre trilha e cursos')
    .addTag('Enrollments', 'Matrículas e conclusão calculada')
    .addTag('LessonProgress', 'Progresso do aluno por aula')
    .addTag('Certificates', 'Certificados de curso')
    .addTag('Plans', 'Planos de preço simulado')
    .addTag('Subscriptions', 'Assinaturas acadêmicas simuladas')
    .addTag('Payments', 'Pagamentos simulados')
    .addTag('Health', 'Disponibilidade da API e do banco')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs-json' })
}
