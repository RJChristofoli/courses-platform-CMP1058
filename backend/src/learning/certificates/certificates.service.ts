import { ForbiddenException, Injectable } from '@nestjs/common'
import { AuthenticatedUser } from '../../common/authenticated-user'
import { httpError } from '../../common/http-error'
import { CreateCertificateDto, ListCertificatesDto, UpdateCertificateDto } from './dto/certificate.dto'
import { CertificatesRepository } from './certificates.repository'

@Injectable()
export class CertificatesService {
  constructor(private readonly certificates: CertificatesRepository) {}

  list(filter: ListCertificatesDto, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    return this.certificates.list(filter, actor.role === 'student' ? actor.id : undefined)
  }

  async get(id: number, actor: AuthenticatedUser) {
    this.assertReadable(actor)
    const certificate = await this.certificates.findById(id)
    if (!certificate || (actor.role === 'student' && certificate.userId !== actor.id)) {
      throw httpError(404, 'NOT_FOUND', 'Certificado não encontrado')
    }
    return certificate
  }

  create(input: CreateCertificateDto) {
    return this.certificates.create({ userId: input.userId, courseId: input.courseId, trackId: input.trackId })
  }

  async update(id: number, input: UpdateCertificateDto) {
    return this.certificates.update(id, { userId: input.userId, courseId: input.courseId, trackId: input.trackId })
  }

  async remove(id: number) { await this.certificates.remove(id) }

  private assertReadable(actor: AuthenticatedUser) {
    if (actor.role === 'instructor') throw new ForbiddenException('Instrutores não acessam certificados dos alunos')
  }
}
