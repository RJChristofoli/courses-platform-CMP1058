import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'
import { configureApp } from '../src/config/configure-app'
import { hash } from 'bcryptjs'
import * as request from 'supertest'
import { execFileSync } from 'node:child_process'

const testDatabaseUrl = process.env.TEST_DATABASE_URL
if (!testDatabaseUrl || !new URL(testDatabaseUrl).pathname.endsWith('_test')) {
  throw new Error('Os testes E2E exigem TEST_DATABASE_URL para um banco isolado com sufixo _test.')
}
if (process.env.DATABASE_URL && process.env.DATABASE_URL === testDatabaseUrl) {
  throw new Error('O banco E2E não pode ser o banco de demonstração.')
}

process.env.DATABASE_URL = testDatabaseUrl
process.env.JWT_SECRET ??= 'e2e-only-secret-do-not-use-outside-tests-123456'
process.env.JWT_EXPIRES_IN ??= '1h'
process.env.PORT ??= '3001'
process.env.CORS_ORIGINS ??= 'http://localhost:4173'

const password = 'E2ePassword123!'
const isoDate = (offset: number) => new Date(Date.now() + offset).toISOString()

describe('API E2E', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
  let studentToken: string
  let otherStudentToken: string
  let instructorToken: string
  let adminId: number
  let instructorId: number
  let studentId: number
  let otherStudentId: number

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module')
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    configureApp(app)
    await app.init()
    prisma = app.get(PrismaService)

    await resetDatabase()
    execFileSync('npm', ['run', 'db:seed'], { stdio: 'pipe', env: process.env })
    await prisma.user.create({ data: { fullName: 'Cadastro preservado', email: 'extra@test.local', passwordHash: await hash(password, 4), role: 'student' } })
    execFileSync('npm', ['run', 'db:seed'], { stdio: 'pipe', env: process.env })
    expect(await prisma.user.count()).toBe(5)
    expect(await prisma.user.count({ where: { email: 'extra@test.local' } })).toBe(1)
    expect(await prisma.course.count()).toBe(2)

    await resetDatabase()
    const passwordHash = await hash(password, 4)
    const [admin, instructor, student, otherStudent] = await Promise.all([
      prisma.user.create({ data: { fullName: 'Admin Teste', email: 'admin@test.local', passwordHash, role: 'admin' } }),
      prisma.user.create({ data: { fullName: 'Instrutor Teste', email: 'instructor@test.local', passwordHash, role: 'instructor' } }),
      prisma.user.create({ data: { fullName: 'Aluna Teste', email: 'student@test.local', passwordHash, role: 'student' } }),
      prisma.user.create({ data: { fullName: 'Outro Aluno', email: 'other@test.local', passwordHash, role: 'student' } }),
    ])
    adminId = admin.id
    instructorId = instructor.id
    studentId = student.id
    otherStudentId = otherStudent.id

    const api = request(app.getHttpServer())
    const login = async (email: string) => (await api.post('/auth/login').send({ email, password })).body.accessToken as string
    ;[adminToken, instructorToken, studentToken, otherStudentToken] = await Promise.all([
      login(admin.email), login(instructor.email), login(student.email), login(otherStudent.email),
    ])
  })

  afterAll(async () => {
    await app?.close()
  })

  const as = (token: string) => ({ Authorization: `Bearer ${token}` })

  async function resetDatabase() {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "payments", "subscriptions", "plans", "certificates", "lessonProgress", "enrollments", "trackCourses", "tracks", "lessons", "modules", "courses", "categories", "users" RESTART IDENTITY CASCADE')
  }

  it('documents the API, rejects anonymous access and returns safe session profiles', async () => {
    const api = request(app.getHttpServer())
    const docs = await api.get('/docs-json').expect(200)
    const openapi = docs.body
    expect(openapi.paths['/auth/login']).toBeDefined()
    expect(openapi.components.securitySchemes.bearer).toBeDefined()
    expect(openapi.tags.map((tag: { name: string }) => tag.name)).toEqual(expect.arrayContaining([
      'Auth', 'Users', 'Categories', 'Courses', 'Modules', 'Lessons', 'Tracks', 'TrackCourses',
      'Enrollments', 'LessonProgress', 'Certificates', 'Plans', 'Subscriptions', 'Payments', 'Health',
    ]))
    expect(JSON.stringify(openapi.components.schemas)).not.toContain('passwordHash')
    expect(openapi.components.schemas.CourseResponseDto.properties).toMatchObject({ totalLessons: {}, totalHours: {} })
    expect(openapi.components.schemas.EnrollmentResponseDto.properties.completedAt.nullable).toBe(true)
    expect(openapi.components.schemas.LessonProgressResponseDto.properties.status.enum).toEqual(['Concluido', 'Em andamento'])
    expect(openapi.components.schemas.CertificateResponseDto.properties.trackId.nullable).toBe(true)
    expect(openapi.components.schemas.PlanResponseDto.properties.price).toMatchObject({ type: 'string', format: 'decimal' })
    for (const [_path, methods] of Object.entries(openapi.paths)) {
      for (const [method, operation] of Object.entries(methods as Record<string, { responses: Record<string, { content?: Record<string, { schema?: { $ref?: string } }> }> }>)) {
        if (!['get', 'post', 'put', 'delete'].includes(method)) continue
        for (const [status, response] of Object.entries(operation.responses)) {
          if (status.startsWith('4') || status === '503') {
            expect(response.content?.['application/json']?.schema?.$ref).toBe('#/components/schemas/ApiErrorResponseDto')
          }
        }
        if (method !== 'delete') {
          expect(Object.entries(operation.responses).some(([status, response]) =>
            status.startsWith('2') && Boolean(response.content?.['application/json']?.schema),
          )).toBe(true)
        }
      }
    }

    await api.get('/categories').expect(401).expect(({ body }) => expect(body.code).toBe('UNAUTHORIZED'))
    const me = await api.get('/auth/me').set(as(studentToken)).expect(200)
    expect(me.body).toMatchObject({ id: studentId, role: 'student' })
    expect(me.body.passwordHash).toBeUndefined()
    await api.post('/auth/login').send({ email: 'student@test.local', password: 'wrong' }).expect(401)
    await api.get('/users').set(as(studentToken)).expect(403)
    await api.get(`/users/${studentId}`).set(as(studentToken)).expect(200)
    await api.get(`/users/${otherStudentId}`).set(as(studentToken)).expect(404)
    await api.post('/categories').set(as(studentToken)).send({ name: 'No', description: '' }).expect(403)
    await api.get('/health').expect(200).expect(({ body }) => expect(body).toEqual({ status: 'ok' }))

    const createdUser = await api.post('/users').set(as(adminToken)).send({
      fullName: 'Nova Conta', email: 'new-student@test.local', password, role: 'student',
    }).expect(201)
    expect(createdUser.body.passwordHash).toBeUndefined()
    await api.post('/users').set(as(adminToken)).send({
      fullName: 'Usuário inválido', email: 'invalid@test.local', password, passwordHash: 'não permitido', role: 'student',
    }).expect(400)
    await api.post('/auth/login').send({ email: createdUser.body.email, password }).expect(200)
    await api.put(`/users/${createdUser.body.id}`).set(as(adminToken)).send({
      fullName: 'Nova Conta Atualizada', email: createdUser.body.email, role: 'student',
    }).expect(200)
    await api.post('/auth/login').send({ email: createdUser.body.email, password }).expect(200)
    await api.put(`/users/${createdUser.body.id}`).set(as(adminToken)).send({
      fullName: 'Nova Conta Atualizada', email: createdUser.body.email, role: 'student', password: 'ChangedPassword123!',
    }).expect(200)
    await api.post('/auth/login').send({ email: createdUser.body.email, password }).expect(401)
    await api.post('/auth/login').send({ email: createdUser.body.email, password: 'ChangedPassword123!' }).expect(200)
    await api.get('/courses').set(as(adminToken)).query({ unexpected: '1' }).expect(400)
  })

  it('creates catalog data, calculates course totals and applies ordering atomically', async () => {
    const api = request(app.getHttpServer())
    const category = await api.post('/categories').set(as(adminToken)).send({ name: 'Web', description: 'Cursos web' }).expect(201)
    const course = await api.post('/courses').set(as(adminToken)).send({
      title: 'Nest para cursos', description: 'API de demonstração', instructorId, categoryId: category.body.id,
      level: 'Iniciante', publishedAt: isoDate(-86400000), totalLessons: 900, totalHours: 999,
    }).expect(400)
    expect(course.body.code).toBe('VALIDATION_ERROR')
    const createdCourse = await api.post('/courses').set(as(adminToken)).send({
      title: 'Nest para cursos', description: 'API de demonstração', instructorId, categoryId: category.body.id,
      level: 'Iniciante', publishedAt: isoDate(-86400000),
    }).expect(201)
    const courseId = createdCourse.body.id as number
    expect(createdCourse.body).toMatchObject({ totalLessons: 0, totalHours: 0 })

    const moduleA = await api.post('/modules').set(as(adminToken)).send({ courseId, title: 'Módulo A' }).expect(201)
    const moduleB = await api.post('/modules').set(as(adminToken)).send({ courseId, title: 'Módulo B' }).expect(201)
    const lessonA = await api.post('/lessons').set(as(adminToken)).send({
      moduleId: moduleA.body.id, title: 'Aula A', contentType: 'Video', contentUrl: 'https://example.test/a', durationMinutes: 30,
    }).expect(201)
    const lessonB = await api.post('/lessons').set(as(adminToken)).send({
      moduleId: moduleB.body.id, title: 'Aula B', contentType: 'Texto', contentUrl: 'https://example.test/b', durationMinutes: 45,
    }).expect(201)

    const totals = await api.get(`/courses/${courseId}`).set(as(studentToken)).expect(200)
    expect(totals.body).toMatchObject({ totalLessons: 2, totalHours: 1.25 })

    await api.put(`/courses/${courseId}/modules/order`).set(as(adminToken)).send({ moduleIds: [moduleB.body.id] }).expect(409)
    const before = await api.get('/modules').set(as(adminToken)).query({ courseId }).expect(200)
    expect(before.body.map((module: { id: number }) => module.id)).toEqual([moduleA.body.id, moduleB.body.id])
    const concurrentModuleOrders = await Promise.all([
      api.put(`/courses/${courseId}/modules/order`).set(as(adminToken)).send({ moduleIds: [moduleB.body.id, moduleA.body.id] }),
      api.put(`/courses/${courseId}/modules/order`).set(as(adminToken)).send({ moduleIds: [moduleA.body.id, moduleB.body.id] }),
    ])
    expect(concurrentModuleOrders.map(({ status }) => status)).toEqual([200, 200])
    const orderedModules = await api.get('/modules').set(as(adminToken)).query({ courseId }).expect(200)
    expect(orderedModules.body.map((module: { id: number }) => module.id).sort()).toEqual([moduleA.body.id, moduleB.body.id].sort())
    expect(orderedModules.body.map((module: { order: number }) => module.order)).toEqual([1, 2])

    const lessonsBefore = await api.get('/lessons').set(as(adminToken)).expect(200)
    const courseLessonsBefore = lessonsBefore.body.filter((lesson: { moduleId: number }) => [moduleA.body.id, moduleB.body.id].includes(lesson.moduleId))
    await api.put(`/courses/${courseId}/lessons/order`).set(as(adminToken)).send({ lessons: [
      { id: lessonA.body.id, moduleId: moduleB.body.id, order: 1 },
    ] }).expect(409)
    const lessonsAfterInvalidOrder = await api.get('/lessons').set(as(adminToken)).expect(200)
    expect(lessonsAfterInvalidOrder.body.filter((lesson: { moduleId: number }) => [moduleA.body.id, moduleB.body.id].includes(lesson.moduleId))).toEqual(courseLessonsBefore)

    await api.put(`/courses/${courseId}/lessons/order`).set(as(adminToken)).send({ lessons: [
      { id: lessonA.body.id, moduleId: moduleB.body.id, order: 1 },
      { id: lessonB.body.id, moduleId: moduleA.body.id, order: 1 },
    ] }).expect(200)

    const track = await api.post('/tracks').set(as(adminToken)).send({
      title: 'Trilha Web', description: '', categoryId: category.body.id, courseIds: [courseId],
    }).expect(201)
    const relations = await api.get('/trackCourses').set(as(adminToken)).query({ trackId: track.body.id }).expect(200)
    expect(relations.body).toHaveLength(1)
    await api.post('/trackCourses').set(as(adminToken)).send({ trackId: track.body.id, courseId, order: 2 }).expect(404)

    await api.post('/tracks').set(as(adminToken)).send({
      title: 'Trilha inválida', description: '', categoryId: category.body.id, courseIds: [courseId, 999999],
    }).expect(404)
    const tracksAfterFailedCreate = await api.get('/tracks').set(as(adminToken)).expect(200)
    expect(tracksAfterFailedCreate.body.some((item: { title: string }) => item.title === 'Trilha inválida')).toBe(false)
    await api.put(`/tracks/${track.body.id}`).set(as(adminToken)).send({
      title: 'Alteração inválida', description: 'deve reverter', categoryId: category.body.id, courseIds: [courseId, 999999],
    }).expect(404)
    const unchangedTrack = await api.get(`/tracks/${track.body.id}`).set(as(adminToken)).expect(200)
    expect(unchangedTrack.body.title).toBe('Trilha Web')
    const unchangedRelations = await api.get('/trackCourses').set(as(adminToken)).query({ trackId: track.body.id }).expect(200)
    expect(unchangedRelations.body).toHaveLength(1)

    const secondCourse = await api.post('/courses').set(as(adminToken)).send({
      title: 'Curso de outro instrutor', description: '', instructorId: adminId, categoryId: category.body.id,
      level: 'Avançado', publishedAt: isoDate(-86400000),
    }).expect(409)
    expect(secondCourse.body.code).toBe('INVALID_INSTRUCTOR')
    const instructorCourses = await api.get('/courses').set(as(instructorToken)).expect(200)
    expect(instructorCourses.body.map((item: { id: number }) => item.id)).toEqual([courseId])
  })

  it('derives course completion, issues certificates and isolates student records', async () => {
    const api = request(app.getHttpServer())
    const course = await prisma.course.findFirstOrThrow()
    const lessons = await prisma.lesson.findMany({ where: { module: { courseId: course.id } }, orderBy: { id: 'asc' } })
    const enrolledAt = isoDate(-86400000)
    const concurrentEnrollments = await Promise.all([
      api.post('/enrollments').set(as(adminToken)).send({ userId: studentId, courseId: course.id, enrolledAt }),
      api.post('/enrollments').set(as(adminToken)).send({ userId: studentId, courseId: course.id, enrolledAt }),
    ])
    expect(concurrentEnrollments.map(({ status }) => status).sort()).toEqual([201, 409])
    const enrollment = concurrentEnrollments.find(({ status }) => status === 201)!
    expect(enrollment.body.completedAt).toBeNull()
    await api.post('/enrollments').set(as(adminToken)).send({ userId: studentId, courseId: course.id }).expect(409)

    await api.post('/lessonProgress').set(as(adminToken)).send({ userId: studentId, lessonId: lessons[0].id, status: 'Concluido' }).expect(201)
    let currentEnrollment = await api.get(`/enrollments/${enrollment.body.id}`).set(as(adminToken)).expect(200)
    expect(currentEnrollment.body.completedAt).toBeNull()
    await api.post('/lessonProgress').set(as(adminToken)).send({ userId: studentId, lessonId: lessons[1].id, status: 'Concluido' }).expect(201)
    currentEnrollment = await api.get(`/enrollments/${enrollment.body.id}`).set(as(adminToken)).expect(200)
    expect(currentEnrollment.body.completedAt).toBeTruthy()

    const [firstProgress, secondProgress] = await prisma.lessonProgress.findMany({ where: { userId: studentId }, orderBy: { lessonId: 'asc' } })
    const concurrentProgressUpdates = await Promise.all([
      api.put(`/lessonProgress/${firstProgress.id}`).set(as(adminToken)).send({ userId: studentId, lessonId: firstProgress.lessonId, status: 'Em andamento' }),
      api.put(`/lessonProgress/${secondProgress.id}`).set(as(adminToken)).send({ userId: studentId, lessonId: secondProgress.lessonId, status: 'Concluido' }),
    ])
    expect(concurrentProgressUpdates.map(({ status }) => status)).toEqual([200, 200])
    currentEnrollment = await api.get(`/enrollments/${enrollment.body.id}`).set(as(adminToken)).expect(200)
    expect(currentEnrollment.body.completedAt).toBeNull()
    await api.put(`/lessonProgress/${firstProgress.id}`).set(as(adminToken)).send({ userId: studentId, lessonId: firstProgress.lessonId, status: 'Concluido' }).expect(200)
    currentEnrollment = await api.get(`/enrollments/${enrollment.body.id}`).set(as(adminToken)).expect(200)
    expect(currentEnrollment.body.completedAt).toBeTruthy()

    const certificate = await api.post('/certificates').set(as(adminToken)).send({ userId: studentId, courseId: course.id }).expect(201)
    expect(certificate.body.verificationCode).toMatch(/^[0-9a-f-]{36}$/i)
    expect(certificate.body.issuedAt).toBeTruthy()
    await api.post('/certificates').set(as(adminToken)).send({ userId: studentId, courseId: course.id }).expect(409)
    await api.get('/certificates').set(as(studentToken)).expect(200).expect(({ body }) => {
      expect(body).toHaveLength(1)
      expect(body[0].id).toBe(certificate.body.id)
    })
    await api.get(`/certificates/${certificate.body.id}`).set(as(otherStudentToken)).expect(404)
    await api.get('/enrollments').set(as(otherStudentToken)).query({ userId: studentId }).expect(200).expect(({ body }) => expect(body).toEqual([]))

    const progress = await prisma.lessonProgress.findFirstOrThrow({ where: { userId: studentId } })
    await api.put(`/lessonProgress/${progress.id}`).set(as(adminToken)).send({ userId: studentId, lessonId: progress.lessonId, status: 'Em andamento' }).expect(200)
    const reopened = await api.get(`/enrollments/${enrollment.body.id}`).set(as(adminToken)).expect(200)
    expect(reopened.body.completedAt).toBeNull()
    const historical = await api.get(`/certificates/${certificate.body.id}`).set(as(studentToken)).expect(200)
    expect(historical.body.id).toBe(certificate.body.id)
    await api.delete(`/enrollments/${enrollment.body.id}`).set(as(adminToken)).expect(204)
    await api.get(`/certificates/${certificate.body.id}`).set(as(adminToken)).expect(404)
  })

  it('preserves exact money, validates financial rules and limits students to their own payments', async () => {
    const api = request(app.getHttpServer())
    const plan = await api.post('/plans').set(as(adminToken)).send({ name: 'Mensal', description: '', price: '49.90', durationMonths: 1 }).expect(201)
    expect(plan.body.price).toBe('49.90')
    const startDate = isoDate(-86400000)
    const endDate = isoDate(86400000 * 30)
    const subscription = await api.post('/subscriptions').set(as(adminToken)).send({ userId: studentId, planId: plan.body.id, startDate, endDate, status: 'active' }).expect(201)
    const payment = await api.post('/payments').set(as(adminToken)).send({
      subscriptionId: subscription.body.id, amountPaid: '49.90', paymentDate: isoDate(0), paymentMethod: 'Pix', gatewayTransactionId: 'E2E-TRX-001',
    }).expect(201)
    expect(payment.body.amountPaid).toBe('49.90')
    await api.post('/payments').set(as(adminToken)).send({
      subscriptionId: subscription.body.id, amountPaid: '0.00', paymentDate: isoDate(0), paymentMethod: 'Pix', gatewayTransactionId: 'E2E-TRX-ZERO',
    }).expect(400)

    const otherSubscription = await api.post('/subscriptions').set(as(adminToken)).send({
      userId: otherStudentId, planId: plan.body.id, startDate, endDate, status: 'active',
    }).expect(201)
    const otherPayment = await api.post('/payments').set(as(adminToken)).send({
      subscriptionId: otherSubscription.body.id, amountPaid: '9.90', paymentDate: isoDate(0), paymentMethod: 'Pix', gatewayTransactionId: 'E2E-TRX-002',
    }).expect(201)

    await api.get('/payments').set(as(studentToken)).expect(200).expect(({ body }) => {
      expect(body.map((item: { id: number }) => item.id)).toEqual([payment.body.id])
    })
    await api.get(`/payments/${otherPayment.body.id}`).set(as(studentToken)).expect(404)
    await api.delete(`/plans/${plan.body.id}`).set(as(adminToken)).expect(409)

    await api.put(`/subscriptions/${subscription.body.id}`).set(as(adminToken)).send({
      userId: otherStudentId, planId: plan.body.id, startDate, endDate, status: 'active',
    }).expect(409)
    await api.delete(`/subscriptions/${otherSubscription.body.id}`).set(as(adminToken)).expect(204)
    await api.get(`/payments/${otherPayment.body.id}`).set(as(adminToken)).expect(404)
    await api.delete(`/subscriptions/${subscription.body.id}`).set(as(adminToken)).expect(204)
  })

  it('applies catalog, learning and user cascades atomically', async () => {
    const api = request(app.getHttpServer())
    const course = await prisma.course.findFirstOrThrow()
    const category = await prisma.category.findUniqueOrThrow({ where: { id: course.categoryId } })
    const originalTrack = await prisma.track.findFirstOrThrow({ where: { categoryId: category.id } })
    const secondTrack = await api.post('/tracks').set(as(adminToken)).send({
      title: 'Trilha secundária', description: '', categoryId: category.id, courseIds: [course.id],
    }).expect(201)
    await api.post('/enrollments').set(as(adminToken)).send({ userId: studentId, courseId: course.id, enrolledAt: isoDate(-86400000) }).expect(201)

    let lessons = await prisma.lesson.findMany({ where: { module: { courseId: course.id } }, orderBy: { id: 'asc' } })
    const extraLesson = await api.post('/lessons').set(as(adminToken)).send({
      moduleId: lessons[0].moduleId, title: 'Aula temporária', contentType: 'Texto', contentUrl: 'https://example.test/temp', durationMinutes: 10,
    }).expect(201)
    lessons = await prisma.lesson.findMany({ where: { module: { courseId: course.id } }, orderBy: { id: 'asc' } })
    for (const lesson of lessons) {
      await api.post('/lessonProgress').set(as(adminToken)).send({ userId: studentId, lessonId: lesson.id, status: 'Concluido' }).expect(201)
    }
    let enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: studentId, courseId: course.id } } })
    expect(enrollment.completedAt).toBeTruthy()

    const progressForExtraLesson = await prisma.lessonProgress.findUniqueOrThrow({ where: { userId_lessonId: { userId: studentId, lessonId: extraLesson.body.id } } })
    await api.delete(`/lessonProgress/${progressForExtraLesson.id}`).set(as(adminToken)).expect(204)
    enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: studentId, courseId: course.id } } })
    expect(enrollment.completedAt).toBeNull()
    await api.post('/lessonProgress').set(as(adminToken)).send({ userId: studentId, lessonId: extraLesson.body.id, status: 'Concluido' }).expect(201)
    await api.delete(`/lessons/${extraLesson.body.id}`).set(as(adminToken)).expect(204)
    expect(await prisma.lessonProgress.count({ where: { userId: studentId, lessonId: extraLesson.body.id } })).toBe(0)
    expect((await api.get(`/courses/${course.id}`).set(as(studentToken)).expect(200)).body.totalLessons).toBe(2)

    const certificate = await api.post('/certificates').set(as(adminToken)).send({
      userId: studentId, courseId: course.id, trackId: originalTrack.id,
    }).expect(201)
    await api.delete(`/categories/${category.id}`).set(as(adminToken)).expect(409)
    const modules = await prisma.module.findMany({ where: { courseId: course.id }, orderBy: { order: 'asc' } })
    const lessonsInFirstModule = await prisma.lesson.count({ where: { moduleId: modules[0].id } })
    await api.delete(`/modules/${modules[0].id}`).set(as(adminToken)).expect(204)
    expect(await prisma.lessonProgress.count({ where: { userId: studentId } })).toBe(2 - lessonsInFirstModule)
    const remainingModule = await prisma.module.findFirstOrThrow({ where: { courseId: course.id } })
    expect(remainingModule.order).toBe(1)
    enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: studentId, courseId: course.id } } })
    expect(enrollment.completedAt).toBeTruthy()
    await api.delete(`/modules/${remainingModule.id}`).set(as(adminToken)).expect(204)
    enrollment = await prisma.enrollment.findUniqueOrThrow({ where: { userId_courseId: { userId: studentId, courseId: course.id } } })
    expect(enrollment.completedAt).toBeNull()
    expect(await prisma.lessonProgress.count({ where: { userId: studentId } })).toBe(0)
    expect((await api.get(`/certificates/${certificate.body.id}`).set(as(studentToken)).expect(200)).body.id).toBe(certificate.body.id)
    await api.delete(`/users/${instructorId}`).set(as(adminToken)).expect(409)

    await api.delete(`/courses/${course.id}`).set(as(adminToken)).expect(204)
    expect(await prisma.enrollment.count({ where: { courseId: course.id } })).toBe(0)
    expect(await prisma.certificate.count({ where: { courseId: course.id } })).toBe(0)
    expect(await prisma.trackCourse.count({ where: { courseId: course.id } })).toBe(0)
    expect(await prisma.track.count({ where: { id: { in: [originalTrack.id, secondTrack.body.id] } } })).toBe(2)
    await api.delete(`/categories/${category.id}`).set(as(adminToken)).expect(409)

    const secondCourse = await api.post('/courses').set(as(adminToken)).send({
      title: 'Curso para testar cascatas', description: '', instructorId, categoryId: category.id,
      level: 'Iniciante', publishedAt: isoDate(-86400000),
    }).expect(201)
    await api.put(`/tracks/${originalTrack.id}`).set(as(adminToken)).send({
      title: originalTrack.title, description: originalTrack.description, categoryId: category.id, courseIds: [secondCourse.body.id],
    }).expect(200)
    const module = await api.post('/modules').set(as(adminToken)).send({ courseId: secondCourse.body.id, title: 'Único módulo' }).expect(201)
    const lesson = await api.post('/lessons').set(as(adminToken)).send({
      moduleId: module.body.id, title: 'Única aula', contentType: 'Texto', contentUrl: 'https://example.test/only', durationMinutes: 15,
    }).expect(201)

    const cascadeUser = await api.post('/users').set(as(adminToken)).send({
      fullName: 'Aluno para cascata', email: 'cascade@test.local', password, role: 'student',
    }).expect(201)
    const startDate = isoDate(-86400000)
    const endDate = isoDate(86400000 * 30)
    const plan = await prisma.plan.findFirstOrThrow()
    const subscription = await api.post('/subscriptions').set(as(adminToken)).send({
      userId: cascadeUser.body.id, planId: plan.id, startDate, endDate, status: 'active',
    }).expect(201)
    const payment = await api.post('/payments').set(as(adminToken)).send({
      subscriptionId: subscription.body.id, amountPaid: '1.00', paymentDate: isoDate(0), paymentMethod: 'Pix', gatewayTransactionId: 'CASCADE-USER-001',
    }).expect(201)
    const cascadeEnrollment = await api.post('/enrollments').set(as(adminToken)).send({
      userId: cascadeUser.body.id, courseId: secondCourse.body.id, enrolledAt: startDate,
    }).expect(201)
    const cascadeProgress = await api.post('/lessonProgress').set(as(adminToken)).send({
      userId: cascadeUser.body.id, lessonId: lesson.body.id, status: 'Concluido',
    }).expect(201)
    const cascadeCertificate = await api.post('/certificates').set(as(adminToken)).send({
      userId: cascadeUser.body.id, courseId: secondCourse.body.id,
    }).expect(201)
    await api.delete(`/users/${cascadeUser.body.id}`).set(as(adminToken)).expect(204)
    expect(await prisma.subscription.count({ where: { id: subscription.body.id } })).toBe(0)
    expect(await prisma.payment.count({ where: { id: payment.body.id } })).toBe(0)
    expect(await prisma.enrollment.count({ where: { id: cascadeEnrollment.body.id } })).toBe(0)
    expect(await prisma.lessonProgress.count({ where: { id: cascadeProgress.body.id } })).toBe(0)
    expect(await prisma.certificate.count({ where: { id: cascadeCertificate.body.id } })).toBe(0)

    const studentEnrollment = await api.post('/enrollments').set(as(adminToken)).send({
      userId: studentId, courseId: secondCourse.body.id, enrolledAt: startDate,
    }).expect(201)
    await api.post('/lessonProgress').set(as(adminToken)).send({ userId: studentId, lessonId: lesson.body.id, status: 'Concluido' }).expect(201)
    const trackCertificate = await api.post('/certificates').set(as(adminToken)).send({
      userId: studentId, courseId: secondCourse.body.id, trackId: originalTrack.id,
    }).expect(201)
    await api.delete(`/tracks/${originalTrack.id}`).set(as(adminToken)).expect(204)
    expect((await api.get(`/certificates/${trackCertificate.body.id}`).set(as(studentToken)).expect(200)).body.trackId).toBeNull()
    await api.get(`/courses/${secondCourse.body.id}`).set(as(studentToken)).expect(200)
    await api.delete(`/tracks/${secondTrack.body.id}`).set(as(adminToken)).expect(204)
    await api.delete(`/courses/${secondCourse.body.id}`).set(as(adminToken)).expect(204)
    expect(await prisma.enrollment.count({ where: { id: studentEnrollment.body.id } })).toBe(0)
    await api.delete(`/categories/${category.id}`).set(as(adminToken)).expect(204)
  })
})
