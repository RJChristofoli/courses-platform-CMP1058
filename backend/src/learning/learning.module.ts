import { Module } from '@nestjs/common'
import { CertificatesController } from './certificates/certificates.controller'
import { CertificatesRepository } from './certificates/certificates.repository'
import { CertificatesService } from './certificates/certificates.service'
import { EnrollmentsController } from './enrollments/enrollments.controller'
import { EnrollmentsRepository } from './enrollments/enrollments.repository'
import { EnrollmentsService } from './enrollments/enrollments.service'
import { LessonProgressController } from './lesson-progress/lesson-progress.controller'
import { LessonProgressRepository } from './lesson-progress/lesson-progress.repository'
import { LessonProgressService } from './lesson-progress/lesson-progress.service'

@Module({
  controllers: [EnrollmentsController, LessonProgressController, CertificatesController],
  providers: [
    EnrollmentsRepository, EnrollmentsService,
    LessonProgressRepository, LessonProgressService,
    CertificatesRepository, CertificatesService,
  ],
})
export class LearningModule {}
