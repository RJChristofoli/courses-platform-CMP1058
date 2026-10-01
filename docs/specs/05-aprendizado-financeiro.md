# 05 — Aprendizado e financeiro simulado

## Regras comuns

Escrita exclusiva de admin; leituras seguem spec 03. CRUD padrão, filtros opcionais e respostas planas. Referências inexistentes recebem `404`; incompatibilidade de perfil, duplicidade ou regra de negócio recebe `409`.

Datas não podem preceder o evento do qual dependem. Não há scheduler, cobrança real ou integração externa.

## Matrículas — /enrollments

- GET aceita `userId`, `courseId`.
- CreateEnrollment: `userId`, `courseId` obrigatórios; `enrolledAt` opcional (default agora).
- UpdateEnrollment: `userId`, `courseId`, `enrolledAt` obrigatórios. Usuário e curso são imutáveis: mudança exige excluir/criar e retorna `409`, `ENROLLMENT_TARGET_CHANGE_FORBIDDEN` no PUT.
- Usuário deve ser `student`; apenas uma matrícula por par usuário/curso.
- Resposta: `id`, `userId`, `courseId`, `enrolledAt`, `completedAt`.
- `completedAt` é somente leitura. Formulário atual deve parar de enviá-lo.
- Exclusão remove progressos do aluno nas aulas desse curso e certificado do curso, em uma transação.
- `enrolledAt` não pode ser posterior a progressos já concluídos desse curso nem a certificado já emitido.
- Não aceitar `enrolledAt` no futuro; esta entrega registra matrículas efetivadas, sem agendamento.

### Conclusão do curso

Uma matrícula está concluída quando o curso tem ao menos uma aula e todas as aulas atuais têm progresso `Concluido` para aquele aluno. Curso vazio permanece não concluído.

- Ao atingir a condição, definir `completedAt` como o maior `completedAt` dos progressos das aulas atuais; nunca antes de `enrolledAt`.
- Ao perder a condição, definir `completedAt: null`.
- Recalcular após criar/alterar/excluir progresso, adicionar/excluir aula e excluir módulo. Reordenação pura não muda a condição.
- Cada mutação e seu recálculo são atômicos. Serializar alterações concorrentes por curso/aluno ou usar isolamento serializável com retry limitado, garantindo o estado final.
- Certificados existentes são históricos e não são automaticamente revogados quando o curso ou o progresso muda. Exclusão de matrícula, curso ou aluno remove os certificados conforme política explícita.

## Progresso — /lessonProgress

- GET aceita `userId`, `lessonId`, `status`.
- CreateLessonProgress: `userId`, `lessonId`, `status` obrigatórios; `completedAt` opcional/anulável.
- UpdateLessonProgress: mesmos campos obrigatórios; alvo aluno/aula é imutável (`409`, `PROGRESS_TARGET_CHANGE_FORBIDDEN`).
- Usuário deve ser student e ter matrícula no curso ao qual pertence a aula; ausência de matrícula retorna `409`, `ENROLLMENT_REQUIRED`.
- Restrição única `(userId, lessonId)`.
- `status` aceita `Concluido` ou `Em andamento`.
- `Concluido`: data omitida na criação ou na transição de estado usa agora; data omitida quando já concluído preserva a existente. Null é inválido. Data informada deve ser >= enrolledAt e não pode estar no futuro.
- `Em andamento`: gravar `completedAt: null`; data não nula enviada recebe `400`.
- Excluir progresso recalcula conclusão da matrícula.

## Certificados — /certificates

- GET aceita `userId`, `courseId`, `trackId`, `verificationCode`.
- CreateCertificate: `userId`, `courseId` obrigatórios; `trackId` opcional/anulável.
- UpdateCertificate: `userId`, `courseId` obrigatórios e iguais ao alvo original; `trackId` opcional/anulável. Mudança do alvo retorna `409`, `CERTIFICATE_TARGET_CHANGE_FORBIDDEN`.
- Resposta inclui `verificationCode` gerado pelo backend com UUID aleatório, `issuedAt` gerado pelo backend e `trackId` explicitamente null quando ausente.
- Esses dois campos gerados não são recebidos em POST/PUT; não são editáveis.
- Exigir matrícula concluída no momento da criação (`409`, `COURSE_NOT_COMPLETED`). Apenas um certificado por aluno/curso (`409`, `CERTIFICATE_ALREADY_EXISTS`).
- Se houver trackId, a trilha deve existir e conter o curso; caso contrário `409`, `COURSE_NOT_IN_TRACK`.
- PUT altera apenas contexto da trilha e valida seu vínculo; não exige conclusão novamente para preservar o caráter histórico.
- DELETE permite correção administrativa. Não há endpoint público de verificação, PDF ou certificação da trilha inteira nesta entrega.

## Planos — /plans

- CRUD padrão; GET sem filtros específicos.
- Create/UpdatePlan: `name` (1–200), `description` (0–5000), `price` (string decimal não negativa), `durationMonths` (inteiro positivo), todos obrigatórios.
- `price`/`amountPaid` aceitam exatamente duas casas e limite Decimal definido na spec 02; não aceitar notação exponencial.
- Plano usado por assinatura não pode ser excluído (`409`, `PLAN_IN_USE`).

## Assinaturas — /subscriptions

- GET aceita `userId`, `planId`, `status`.
- Create/UpdateSubscription: `userId`, `planId`, `startDate`, `endDate`, `status`, todos obrigatórios.
- Usuário deve ser student; plano deve existir. `endDate` deve ser posterior a `startDate`.
- Estados: `active`, `paused`, `cancelled`, `expired`. São administrados manualmente; não há expiração automática ou cálculo obrigatório de datas a partir de durationMonths.
- O formulário pode sugerir fim por duração do plano; o backend aceita a data válida informada.
- Assinatura com pagamentos não pode mudar userId ou planId (`409`, `SUBSCRIPTION_HAS_PAYMENTS`); datas e status continuam editáveis, desde que startDate não passe a ser posterior a pagamento existente.
- Sem pagamentos, userId/planId podem mudar com validação de referências.
- DELETE remove pagamentos associados em transação/cascata.

## Pagamentos — /payments

- GET aceita `subscriptionId`; student tem escopo adicional imposto pela assinatura do próprio usuário.
- Create/UpdatePayment: `subscriptionId`, `amountPaid`, `paymentDate`, `paymentMethod`, `gatewayTransactionId`, todos obrigatórios.
- `amountPaid` é string decimal positiva; paymentMethod 1–50 caracteres e gatewayTransactionId 1–200.
- Assinatura deve existir. `paymentDate` não pode anteceder seu startDate; pagamento após endDate é permitido como lançamento administrativo tardio.
- gatewayTransactionId é único (`409`, `TRANSACTION_ALREADY_EXISTS`).
- Alterar assinatura exige validar novamente referência e data.
- Registrar pagamento não muda estado da assinatura nem cria matrícula. Não há limite baseado no preço do plano ou proibição por estado de assinatura.
- DELETE remove apenas o registro simulado.

## Critérios de aceite

- Matrícula duplicada ou de não estudante retorna `409`.
- Progresso sem matrícula é rejeitado; registrar última aula concluída atualiza completedAt na mesma transação.
- Reabrir/excluir progresso ou adicionar aula pendente torna matrícula não concluída.
- Curso sem aulas não permite emitir certificado.
- Certificado exige conclusão, gera código único e não aceita data/código do cliente.
- Remover curso de trilha limpa o contexto do certificado sem removê-lo.
- Plano usado não é excluído; excluir assinatura remove seus pagamentos.
- `"0.10"` é persistido/retornado exatamente, sem perda por ponto flutuante.
- Student não acessa assinatura/pagamento/certificado de outro aluno, nem consegue alterar qualquer registro.
- Reiniciar a aplicação mantém matrículas e registros financeiros.
