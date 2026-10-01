# Plataforma de Cursos — CMP1058

Aplicação acadêmica para gestão de cursos, usuários, progresso e pagamentos simulados. O frontend React consome uma API NestJS com JWT; os dados são armazenados em PostgreSQL via Prisma ORM. O projeto não processa pagamentos reais.

## Requisitos

- Docker e Docker Compose para executar a demonstração completa.
- Node.js 20 ou superior para desenvolvimento local do backend; Node.js 18 ou superior para o frontend.
- PostgreSQL 16 para execução local dos testes de integração.

## Subir a demonstração

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec backend npm run db:seed
```

O `.env` é opcional para a demonstração local; sem ele, Compose usa os mesmos valores de exemplo.

Endereços: interface em `http://localhost:4173`, API em `http://localhost:3001`, Swagger em `http://localhost:3001/docs` e OpenAPI JSON em `http://localhost:3001/docs-json`. A interface encaminha `/api` ao backend. O container aplica migrations ao iniciar; o seed é um comando separado e repetível.

Contas de demonstração:

| Perfil | Email | Senha local padrão |
| --- | --- | --- |
| Administrador | `admin@example.com` | `Admin123!` |
| Instrutor | `instrutor@example.com` | `Instructor123!` |
| Aluna | `aluno@example.com` | `Student123!` |
| Aluna | `aluno2@example.com` | `Student123!` |

As senhas são exemplos para ambiente local e podem ser substituídas pelas variáveis `SEED_ADMIN_PASSWORD`, `SEED_INSTRUCTOR_PASSWORD` e `SEED_STUDENT_PASSWORD` antes da criação das fixtures. Ajuste também `POSTGRES_PASSWORD` e `JWT_SECRET` para um ambiente compartilhado. Os padrões do Compose são exclusivos para demonstração local.

## Desenvolvimento local

```bash
docker compose up -d postgres
cp backend/.env.example backend/.env
cd backend && npm ci && npm run db:generate && npm run db:migrate:deploy && npm run db:seed && npm run start:dev
```

Em outro terminal:

```bash
cd frontend && npm ci && npm run dev
```

O Vite disponibiliza a interface em `http://localhost:5173` e encaminha chamadas `/api` para `http://localhost:3001`. Para novas alterações de schema durante o desenvolvimento, use `npm run db:migrate:dev -- --name descricao-da-mudanca` no diretório `backend`.

## Testes e qualidade

```bash
cd frontend && npm run build && npm run lint
cd ../backend && npm run build && npm run lint && npm test
```

Os testes de integração usam o banco `courses_platform_test` e recusam uma URL sem sufixo `_test`. O Compose cria esse banco ao inicializar um volume PostgreSQL novo. Se o volume já existia antes desta configuração, crie-o uma vez com `docker compose exec postgres createdb -U courses courses_platform_test` (ignore a mensagem caso já exista). Depois execute:

```bash
cd backend
TEST_DATABASE_URL='postgresql://courses:courses_dev_only@localhost:5432/courses_platform_test?schema=public' npm run test:e2e
```

Nunca configure `TEST_DATABASE_URL` para o banco de demonstração. O script aplica migrations apenas no banco de teste e os cenários limpam somente esse banco.

## Funcionalidades e acesso

- Administradores autenticados gerenciam catálogo, usuários, matrículas, progresso, certificados e financeiro.
- Instrutores autenticados consultam seus cursos e aulas; estudantes consultam o próprio progresso, matrículas, certificados e pagamentos.
- Senhas são armazenadas como hashes bcrypt e omitidas das respostas. Sessões JWT ficam em `sessionStorage` durante a demonstração.
- Totais de cursos, conclusão de matrículas, emissão/código de certificados e precisão decimal são tratados pela API.
- Exclusões relacionadas são executadas pelo backend em transações; vínculos imutáveis e regras financeiras retornam mensagens de validação.
- O seed é idempotente, usa IDs/códigos estáveis e não remove cadastros feitos durante a demonstração.

O escopo acadêmico não inclui pagamentos reais, redefinição de senha, fluxo OAuth, rate limiting, refresh tokens nem implantação em produção.

## Especificações

As seis especificações que definiram a implementação ficam em [`docs/specs/`](docs/specs/README.md). A integração do frontend, seed, testes e roteiro de validação manual estão descritos em [`06-integracao-validacao.md`](docs/specs/06-integracao-validacao.md).
