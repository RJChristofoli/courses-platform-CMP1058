import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()
const day = (value: string) => new Date(`${value}T12:00:00.000Z`)

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!'
  const instructorPassword = process.env.SEED_INSTRUCTOR_PASSWORD ?? 'Instructor123!'
  const studentPassword = process.env.SEED_STUDENT_PASSWORD ?? 'Student123!'
  const [adminHash, instructorHash, studentHash] = await Promise.all([
    hash(adminPassword, 12),
    hash(instructorPassword, 12),
    hash(studentPassword, 12),
  ])

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    create: { id: 1, fullName: 'Admin Demonstração', email: 'admin@example.com', passwordHash: adminHash, role: 'admin', createdAt: day('2026-09-01') },
    update: { fullName: 'Admin Demonstração', passwordHash: adminHash, role: 'admin' },
  })
  await prisma.user.upsert({
    where: { email: 'instrutor@example.com' },
    create: { id: 2, fullName: 'Carlos Henrique', email: 'instrutor@example.com', passwordHash: instructorHash, role: 'instructor', createdAt: day('2026-09-02') },
    update: { fullName: 'Carlos Henrique', passwordHash: instructorHash, role: 'instructor' },
  })
  for (const student of [
    { id: 3, email: 'aluno@example.com', fullName: 'Marina Lopes' },
    { id: 4, email: 'aluno2@example.com', fullName: 'Fernanda Souza' },
  ]) {
    await prisma.user.upsert({
      where: { email: student.email },
      create: { ...student, passwordHash: studentHash, role: 'student', createdAt: day('2026-09-03') },
      update: { fullName: student.fullName, passwordHash: studentHash, role: 'student' },
    })
  }

  await prisma.category.upsert({
    where: { id: 1 },
    create: { id: 1, name: 'Desenvolvimento Web', description: 'Interfaces, APIs e aplicações modernas.' },
    update: { name: 'Desenvolvimento Web', description: 'Interfaces, APIs e aplicações modernas.' },
  })
  await prisma.category.upsert({
    where: { id: 2 },
    create: { id: 2, name: 'Dados e IA', description: 'Análise, automação e inteligência artificial.' },
    update: { name: 'Dados e IA', description: 'Análise, automação e inteligência artificial.' },
  })

  await prisma.course.upsert({
    where: { id: 1 },
    create: { id: 1, title: 'React para Plataformas Escaláveis', description: 'Interfaces modulares e acessíveis.', instructorId: 2, categoryId: 1, level: 'Intermediario', publishedAt: day('2026-09-05') },
    update: { title: 'React para Plataformas Escaláveis', instructorId: 2, categoryId: 1, level: 'Intermediario' },
  })
  await prisma.course.upsert({
    where: { id: 2 },
    create: { id: 2, title: 'Fundamentos de Dados', description: 'Leitura de indicadores para produtos.', instructorId: 2, categoryId: 2, level: 'Iniciante', publishedAt: day('2026-09-06') },
    update: { title: 'Fundamentos de Dados', instructorId: 2, categoryId: 2, level: 'Iniciante' },
  })

  for (const module of [
    { id: 1, courseId: 1, title: 'Fundamentos', order: 1 },
    { id: 2, courseId: 1, title: 'Arquitetura de Interface', order: 2 },
    { id: 3, courseId: 2, title: 'Leitura de Indicadores', order: 1 },
  ]) await prisma.module.upsert({ where: { id: module.id }, create: module, update: module })

  for (const lesson of [
    { id: 1, moduleId: 1, title: 'Introdução ao React', contentType: 'Video', contentUrl: 'https://example.com/react-intro', durationMinutes: 25, order: 1 },
    { id: 2, moduleId: 2, title: 'Componentes reutilizáveis', contentType: 'Texto', contentUrl: 'https://example.com/components', durationMinutes: 35, order: 1 },
    { id: 3, moduleId: 3, title: 'Indicadores de produto', contentType: 'Video', contentUrl: 'https://example.com/indicadores', durationMinutes: 30, order: 1 },
  ]) await prisma.lesson.upsert({ where: { id: lesson.id }, create: lesson, update: lesson })

  await prisma.track.upsert({
    where: { id: 1 },
    create: { id: 1, title: 'Jornada de Desenvolvimento Web', description: 'Fundamentos para criar aplicações web.', categoryId: 1 },
    update: { title: 'Jornada de Desenvolvimento Web', categoryId: 1 },
  })
  await prisma.trackCourse.upsert({ where: { trackId_courseId: { trackId: 1, courseId: 1 } }, create: { trackId: 1, courseId: 1, order: 1 }, update: { order: 1 } })
  await prisma.trackCourse.upsert({ where: { trackId_courseId: { trackId: 1, courseId: 2 } }, create: { trackId: 1, courseId: 2, order: 2 }, update: { order: 2 } })

  await prisma.plan.upsert({
    where: { id: 1 },
    create: { id: 1, name: 'Essencial', description: 'Acesso demonstrativo por um mês.', price: '39.90', durationMonths: 1 },
    update: { name: 'Essencial', price: '39.90', durationMonths: 1 },
  })
  await prisma.plan.upsert({
    where: { id: 2 },
    create: { id: 2, name: 'Acadêmico Plus', description: 'Acesso demonstrativo semestral.', price: '199.90', durationMonths: 6 },
    update: { name: 'Acadêmico Plus', price: '199.90', durationMonths: 6 },
  })

  const completedAt = day('2026-09-10')
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: 3, courseId: 1 } },
    create: { id: 1, userId: 3, courseId: 1, enrolledAt: day('2026-09-05'), completedAt },
    update: { completedAt },
  })
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: 4, courseId: 1 } },
    create: { id: 2, userId: 4, courseId: 1, enrolledAt: day('2026-09-06') },
    update: { completedAt: null },
  })
  for (const progress of [
    { id: 1, userId: 3, lessonId: 1, completedAt: day('2026-09-09'), status: 'Completed' as const },
    { id: 2, userId: 3, lessonId: 2, completedAt, status: 'Completed' as const },
    { id: 3, userId: 4, lessonId: 1, completedAt: day('2026-09-10'), status: 'Completed' as const },
  ]) await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: progress.userId, lessonId: progress.lessonId } },
    create: progress,
    update: { completedAt: progress.completedAt, status: progress.status },
  })

  await prisma.certificate.upsert({
    where: { userId_courseId: { userId: 3, courseId: 1 } },
    create: { id: 1, userId: 3, courseId: 1, trackId: 1, verificationCode: 'DEMO-CERT-STUDENT-001', issuedAt: day('2026-09-11') },
    update: { trackId: 1 },
  })

  await prisma.subscription.upsert({
    where: { id: 1 },
    create: { id: 1, userId: 3, planId: 2, startDate: day('2026-09-05'), endDate: day('2027-03-05'), status: 'active' },
    update: { userId: 3, planId: 2, status: 'active' },
  })
  await prisma.subscription.upsert({
    where: { id: 2 },
    create: { id: 2, userId: 4, planId: 1, startDate: day('2026-09-06'), endDate: day('2026-10-06'), status: 'active' },
    update: { userId: 4, planId: 1, status: 'active' },
  })
  await prisma.payment.upsert({
    where: { gatewayTransactionId: 'DEMO-TRX-001' },
    create: { id: 1, subscriptionId: 1, amountPaid: '199.90', paymentDate: day('2026-09-05'), paymentMethod: 'Cartão', gatewayTransactionId: 'DEMO-TRX-001' },
    update: { subscriptionId: 1, amountPaid: '199.90', paymentDate: day('2026-09-05') },
  })
  await prisma.payment.upsert({
    where: { gatewayTransactionId: 'DEMO-TRX-002' },
    create: { id: 2, subscriptionId: 2, amountPaid: '39.90', paymentDate: day('2026-09-06'), paymentMethod: 'Pix', gatewayTransactionId: 'DEMO-TRX-002' },
    update: { subscriptionId: 2, amountPaid: '39.90', paymentDate: day('2026-09-06') },
  })

  for (const table of ['users', 'categories', 'courses', 'modules', 'lessons', 'tracks', 'trackCourses', 'enrollments', 'lessonProgress', 'certificates', 'plans', 'subscriptions', 'payments']) {
    await prisma.$queryRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "${table}"), 1), true)`)
  }

  console.log('Seed idempotente concluído. Credenciais de demonstração estão no README.')
}

main()
  .catch((error) => {
    console.error('Falha ao executar o seed de demonstração.')
    console.error(error instanceof Error ? error.message : 'Erro inesperado')
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
