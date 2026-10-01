import { ForbiddenException, Injectable } from '@nestjs/common'
import { hash } from 'bcryptjs'
import { AuthenticatedUser } from '../common/authenticated-user'
import { httpError } from '../common/http-error'
import { CreateUserDto } from './dto/create-user.dto'
import { ListUsersDto } from './dto/list-users.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersRepository } from './users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly users: UsersRepository) {}

  async list(actor: AuthenticatedUser, filter: ListUsersDto) {
    if (actor.role !== 'admin') throw new ForbiddenException('Somente administradores podem listar todos os usuários')
    return this.users.findMany({ role: filter.role, email: filter.email?.trim().toLowerCase() })
  }

  async findOne(id: number, actor: AuthenticatedUser) {
    if (actor.role !== 'admin' && actor.id !== id) {
      throw httpError(404, 'NOT_FOUND', 'Usuário não encontrado')
    }
    const user = await this.users.findById(id)
    if (!user) throw httpError(404, 'NOT_FOUND', 'Usuário não encontrado')
    return user
  }

  async create(input: CreateUserDto) {
    this.validatePasswordBytes(input.password)
    const email = input.email.trim().toLowerCase()
    try {
      return await this.users.create({
        fullName: input.fullName.trim(),
        email,
        passwordHash: await hash(input.password, 12),
        role: input.role,
      })
    } catch (error) {
      if (this.users.isEmailConflict(error)) {
        throw httpError(409, 'EMAIL_ALREADY_EXISTS', 'Email já cadastrado')
      }
      throw error
    }
  }

  async update(id: number, input: UpdateUserDto, actor: AuthenticatedUser) {
    const current = await this.findOne(id, actor)
    if (id === actor.id && actor.role === 'admin' && input.role !== 'admin') {
      throw httpError(409, 'SELF_ADMIN_CHANGE_FORBIDDEN', 'O administrador não pode remover seu próprio perfil admin')
    }
    const usage = await this.users.usage(id)
    if (current.role === 'admin' && input.role !== 'admin' && usage.adminCount <= 1) {
      throw httpError(409, 'LAST_ADMIN_REQUIRED', 'A plataforma precisa manter ao menos um administrador')
    }
    if (input.role !== 'instructor' && usage.courses > 0) {
      throw httpError(409, 'USER_HAS_COURSES', 'Reatribua os cursos antes de alterar o perfil do instrutor')
    }
    if (input.role !== 'student'
      && usage.enrollments + usage.progress + usage.certificates + usage.subscriptions > 0) {
      throw httpError(409, 'USER_HAS_LEARNING_DATA', 'Remova os dados acadêmicos e financeiros antes de alterar o perfil')
    }
    if (input.password) this.validatePasswordBytes(input.password)

    try {
      return await this.users.update(id, {
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        ...(input.password ? { passwordHash: await hash(input.password, 12) } : {}),
      })
    } catch (error) {
      if (this.users.isEmailConflict(error)) {
        throw httpError(409, 'EMAIL_ALREADY_EXISTS', 'Email já cadastrado')
      }
      throw error
    }
  }

  async remove(id: number, actor: AuthenticatedUser) {
    const user = await this.findOne(id, actor)
    if (user.id === actor.id && user.role === 'admin') {
      throw httpError(409, 'SELF_ADMIN_CHANGE_FORBIDDEN', 'O administrador não pode excluir a própria conta')
    }
    const usage = await this.users.usage(id)
    if (usage.courses > 0) {
      throw httpError(409, 'USER_HAS_COURSES', 'Reatribua os cursos antes de excluir o instrutor')
    }
    if (user.role === 'admin' && usage.adminCount <= 1) {
      throw httpError(409, 'LAST_ADMIN_REQUIRED', 'A plataforma precisa manter ao menos um administrador')
    }
    return this.users.delete(id)
  }

  private validatePasswordBytes(password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw httpError(400, 'VALIDATION_ERROR', 'Senha deve possuir no máximo 72 bytes em UTF-8')
    }
  }
}
