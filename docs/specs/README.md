# Especificações da API NestJS

## Objetivo e status

Especificar a substituição do JSON Server por NestJS, JWT, Swagger, PostgreSQL e Prisma, mantendo o frontend React e os módulos acadêmicos e financeiros existentes. Estes documentos definem o comportamento esperado; não representam funcionalidades já implementadas.

Contexto: trabalho de faculdade, sem sistema em produção. O banco pode ser criado do zero. Não haverá importação obrigatória do `backend/db.json`, coexistência de backends ou estratégia de migração de dados existentes. Migrations do Prisma continuam necessárias para reproduzir a estrutura do banco.

Status: implementadas nesta entrega; os critérios abaixo permanecem como referência para validação manual. Mudanças nessas premissas devem ser registradas nas specs antes de alterar os contratos.

## Documentos e ordem de implementação

1. [Arquitetura e infraestrutura](01-arquitetura-infraestrutura.md): camadas, Docker, configuração e persistência.
2. [Modelo de dados](02-modelo-dados.md): entidades, tipos, índices e exclusões.
3. [Autenticação e usuários](03-autenticacao-usuarios.md): JWT, senhas, permissões e CRUD.
4. [Catálogo](04-catalogo.md): categorias, cursos, estrutura e trilhas.
5. [Aprendizado e financeiro](05-aprendizado-financeiro.md): matrículas, progresso, certificados e financeiro simulado.
6. [Frontend, documentação e validação](06-integracao-validacao.md): integração, Swagger, seed e aceite geral.

O modelo de dados deve ser consolidado junto à infraestrutura antes dos módulos de negócio. A integração do frontend acompanha cada módulo; a última spec reúne a validação final.

## Premissas adotadas

- O painel existente é administrativo e exige perfil `admin`.
- Existem três perfis: `admin`, `instructor` e `student`. Admins gerenciam todos os recursos; os outros perfis têm consultas delimitadas na spec de autenticação.
- Não serão criados portais de aluno/instrutor nesta entrega. Suas permissões poderão ser demonstradas no Swagger e nos testes.
- Usuários são cadastrados pelo administrador. Não há registro público, recuperação de senha, confirmação de email ou refresh token nesta entrega.
- O JWT expira em uma hora. A sessão exige novo login após expirar.
- Pagamentos e assinaturas são registros simulados; não há gateway, cobrança, webhook ou liberação de acesso por pagamento.
- Matrícula e progresso determinam a conclusão do curso. Certificados são emitidos manualmente pelo administrador após a conclusão, sem geração de PDF.
- `trackId` em certificado identifica o contexto de um curso dentro de uma trilha. Certificação da trilha inteira está fora do escopo.
- O backend calcula quantidade de aulas, carga horária e data de conclusão da matrícula.

Essas escolhas completam pontos não definidos na conversa e mantêm o projeto demonstrável sem ampliar a interface existente.

## Convenções de contrato

- API direta: `http://localhost:3001`, sem prefixo global. No frontend, `/api` é o proxy para essa API.
- Preservar recursos atuais em camelCase: `trackCourses` e `lessonProgress`, por exemplo.
- CRUD padrão: `GET /recurso`, `GET /recurso/:id`, `POST /recurso`, `PUT /recurso/:id`, `DELETE /recurso/:id`, salvo exceções expressas.
- `POST` retorna `201` e o objeto criado; consultas e `PUT` retornam `200`; exclusão retorna `204` sem corpo.
- Listagens retornam arrays de objetos planos com IDs das relações, sem envelope, paginação ou relações aninhadas. Ordem padrão: `id` crescente; itens ordenáveis: `order`, depois `id`.
- `PUT` recebe todos os campos graváveis obrigatórios do recurso. Campos opcionais omitidos mantêm o valor atual; `null` limpa somente campos explicitamente anuláveis. `PATCH` não faz parte do CRUD inicial.
- IDs: inteiros positivos. Datas: ISO 8601 com fuso explícito, armazenadas e retornadas em UTC. Datas opcionais têm defaults descritos por recurso.
- Valores monetários: strings decimais com duas casas, como `"49.90"`, tanto na entrada quanto na saída; banco usa `Decimal(12,2)`.
- Textos obrigatórios são aparados e não podem ficar vazios. Descrições podem ser vazias. Campos desconhecidos no corpo ou na query retornam `400`.
- Filtros de listagem são opcionais e combinados por AND. IDs filtrados são inteiros positivos; enums aceitam apenas valores documentados. Filtros válidos sem resultados retornam `[]`.
- Erros: `400` para formato inválido; `401` para autenticação inválida; `403` para falta de permissão; `404` para recurso inexistente; `409` para duplicidade, dependência impeditiva ou regra de negócio não atendida.
- Formato de erro: `{ "statusCode": 409, "code": "EMAIL_ALREADY_EXISTS", "message": "Email já cadastrado" }`. Validação usa `code: "VALIDATION_ERROR"` e pode incluir `details: [{ "field": "email", "message": "Email inválido" }]`.
- Não expor stack traces, SQL, segredos, senha ou hash em respostas. Swagger deve documentar os erros de cada operação.

## Fontes do repositório

- `backend/package.json`: JSON Server como único backend atual.
- `backend/db.json`: 13 coleções; na inspeção estavam vazias.
- `frontend/src/types/models.ts`: modelos e payloads existentes.
- `frontend/src/services/api.ts`: contratos CRUD e operações de relacionamento feitas pelo cliente.
- `frontend/src/hooks/use-academic-catalog.ts`: exclusões e reordenações no frontend.
- `frontend/src/hooks/use-platform-admin.ts`: operações de usuários e financeiro.
- `frontend/src/App.tsx`: rotas do painel atual, sem login.
- `docker-compose.yml` e `frontend/nginx.conf`: execução e proxy existentes.

## Critério de conclusão

A entrega só estará concluída quando os critérios das seis specs forem atendidos: aplicação executável por Docker Compose, autenticação e permissões reais, CRUD persistente, regras no backend, Swagger utilizável e frontend integrado sem JSON Server.
