# 02 — Modelo de dados PostgreSQL/Prisma

## Convenções

- Todos os modelos têm `id Int @id @default(autoincrement())`.
- IDs das relações são obrigatórios salvo indicação explícita de nulabilidade.
- Datas usam `DateTime` com tipo PostgreSQL `timestamptz`; saída JSON é ISO UTC.
- Valores financeiros usam `Decimal(12,2)`; duração da aula é inteiro em minutos.
- Campos únicos e índices são definidos em migrations. Não depender somente de validação no service para impedir duplicidades concorrentes.
- Enums de banco podem usar identificadores convencionais; DTOs devem mapear para os valores HTTP especificados, especialmente o progresso em português.

## Modelos e campos

### User

`id`, `fullName String`, `email String @unique`, `passwordHash String`, `createdAt DateTime @default(now())`, `role UserRole`.

UserRole: `admin`, `student`, `instructor`. Email armazenado normalizado (trim e lowercase). `passwordHash` é exclusivo da persistência/consulta de credenciais; não participa de DTOs de saída.

### Category

`id`, `name String`, `description String`.

Nome não é chave única nesta entrega. Cursos e trilhas referenciam categoria.

### Course

`id`, `title String`, `description String`, `instructorId Int`, `categoryId Int`, `level String`, `publishedAt DateTime`.

Instrutor referencia User; categoria referencia Category. `totalLessons` e `totalHours` são campos calculados na resposta, não colunas editáveis: quantidade de aulas e soma de minutos / 60, arredondada para duas casas. Curso sem aulas retorna zero em ambos.

### Module

`id`, `courseId Int`, `title String`, `order Int`.

### Lesson

`id`, `moduleId Int`, `title String`, `contentType String`, `contentUrl String`, `durationMinutes Int`, `order Int`.

### Track

`id`, `title String`, `description String`, `categoryId Int`.

### TrackCourse

`id`, `trackId Int`, `courseId Int`, `order Int`. Restrição única `(trackId, courseId)`.

Ordens de módulos, aulas e vínculos são inteiros positivos. Normalização transacional mantém sequências contíguas a partir de 1 após inserção, exclusão, movimentação ou reordenação. Índices `(courseId, order)`, `(moduleId, order)` e `(trackId, order)`; não usar unicidade imediata em `order` que impeça trocas intermediárias dentro de uma transação.

### Enrollment

`id`, `userId Int`, `courseId Int`, `enrolledAt DateTime @default(now())`, `completedAt DateTime?`. Restrição única `(userId, courseId)`.

User deve ser estudante. Conclusão é calculada pelas aulas atuais do curso e seus progressos, conforme spec 05.

### LessonProgress

`id`, `userId Int`, `lessonId Int`, `completedAt DateTime?`, `status ProgressStatus`. Restrição única `(userId, lessonId)`.

Valores HTTP: `Concluido` e `Em andamento`. Campo de conclusão só pode ser não nulo no primeiro estado.

### Certificate

`id`, `userId Int`, `courseId Int`, `trackId Int?`, `verificationCode String @unique`, `issuedAt DateTime @default(now())`. Restrição única `(userId, courseId)`.

Certifica um curso; vínculo opcional de trilha informa contexto. Um aluno não recebe múltiplos certificados do mesmo curso por escolher contextos diferentes.

### Plan

`id`, `name String`, `description String`, `price Decimal(12,2)`, `durationMonths Int`.

### Subscription

`id`, `userId Int`, `planId Int`, `startDate DateTime`, `endDate DateTime`, `status SubscriptionStatus`.

Estados HTTP: `active`, `paused`, `cancelled`, `expired`. User deve ser estudante. Permitir mais de uma assinatura por aluno, inclusive do mesmo plano, para manter o CRUD atual simples.

### Payment

`id`, `subscriptionId Int`, `amountPaid Decimal(12,2)`, `paymentDate DateTime`, `paymentMethod String`, `gatewayTransactionId String @unique`.

ID de transação é uma referência simulada preenchida pelo administrador; não representa comunicação com gateway.

## Índices e integridade

- Indexar chaves estrangeiras usadas em filtros que não sejam prefixo de um índice único já existente: `Course.instructorId/categoryId`, `Track.categoryId`, `TrackCourse.courseId`, `Enrollment.courseId`, `LessonProgress.lessonId`, `Certificate.courseId/trackId`, `Subscription.userId/planId` e `Payment.subscriptionId`.
- FKs impedem relações inexistentes. Services validam perfil de usuário e demais invariantes que não são expressas por FK.
- Valores monetários não negativos para plano, positivos para pagamento, máximo `9999999999.99`. Validar sem conversão intermediária para ponto flutuante.
- Não exigir unicidade de nomes, títulos ou matrícula por assinatura; somente as restrições explicitadas.

## Política de exclusão

- Category: impedir exclusão com cursos ou trilhas (`409`). FKs com Restrict.
- User: impedir exclusão enquanto houver cursos atribuídos como instrutor (`409`); exigir reatribuição prévia. Outras relações do usuário (matrículas, progressos, certificados, assinaturas e pagamentos das assinaturas) são removidas por cascata.
- Course: remover módulos/aulas/progressos associados, TrackCourse, matrículas e certificados por cascata; manter a trilha e renormalizar sua ordem.
- Module: remover aulas e seus progressos por cascata; renormalizar módulos restantes.
- Lesson: remover seus progressos por cascata; renormalizar aulas restantes.
- Track: remover TrackCourse por cascata e definir `Certificate.trackId` como null; manter cursos e certificados.
- Enrollment: service remove também progresso do mesmo aluno nas aulas do curso e seu certificado do curso, na mesma transação.
- Plan: impedir exclusão quando referenciado por assinaturas (`409`). FK com Restrict.
- Subscription: remover pagamentos por cascata.
- Payment, LessonProgress e Certificate: exclusão direta; remover progresso recalcula conclusão da matrícula.

Deleções ou movimentações de aulas/módulos recalculam conclusão das matrículas afetadas. São transações de demonstração com baixo volume; não é necessário processamento assíncrono.

## Critérios de aceite

- Migration inicial recria o schema em banco vazio.
- FKs e restrições únicas rejeitam referências inválidas e duplicidades mesmo sob duas solicitações concorrentes.
- Datas, enums e Decimal são serializados conforme o contrato HTTP.
- Cada política de cascata/restrição é coberta por um cenário de integração.
- Uma falha durante alteração de múltiplos registros reverte a transação inteira.
