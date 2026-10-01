import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuthenticatedUser } from '../common/authenticated-user'
import { PrismaService } from '../prisma/prisma.service'

const userResponseSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  createdAt: true,
} as const

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  toResponse(user: AuthenticatedUser) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }
  }

  findCredentialsByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, select: userResponseSelect })
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id }, select: userResponseSelect })
  }

  findMany(filter: { role?: 'admin' | 'instructor' | 'student'; email?: string }) {
    const where: Prisma.UserWhereInput = {
      ...(filter.role ? { role: filter.role } : {}),
      ...(filter.email ? { email: filter.email } : {}),
    }
    return this.prisma.user.findMany({ where, select: userResponseSelect, orderBy: { id: 'asc' } })
  }

  create(input: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data: input, select: userResponseSelect })
  }

  update(id: number, input: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data: input, select: userResponseSelect })
  }

  delete(id: number) {
    return this.prisma.user.delete({ where: { id }, select: userResponseSelect })
  }

  async usage(id: number) {
    const [courses, enrollments, progress, certificates, subscriptions, adminCount] = await Promise.all([
      this.prisma.course.count({ where: { instructorId: id } }),
      this.prisma.enrollment.count({ where: { userId: id } }),
      this.prisma.lessonProgress.count({ where: { userId: id } }),
      this.prisma.certificate.count({ where: { userId: id } }),
      this.prisma.subscription.count({ where: { userId: id } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
    ])
    return { courses, enrollments, progress, certificates, subscriptions, adminCount }
  }

  isEmailConflict(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError
      && error.code === 'P2002'
      && Array.isArray(error.meta?.target)
      && error.meta.target.includes('email')
  }
}
