# 03 — Autenticação, autorização e usuários

## Autenticação

### POST /auth/login — público

Entrada: `{ "email": "admin@example.com", "password": "senha-de-demonstracao" }`.

- Email válido; normalizar trim/lowercase. Password é string não vazia, sem trim ou normalização.
- Verificar senha com bcrypt (custo 12). Cadastro e atualização aceitam senha de 8 a 72 bytes UTF-8 para evitar truncamento silencioso.
- Email inexistente e senha incorreta retornam o mesmo `401`, `INVALID_CREDENTIALS`.
- Sucesso: `200 { "accessToken": "...", "tokenType": "Bearer", "expiresIn": 3600, "user": { "id": 1, "fullName": "Administrador", "email": "admin@example.com", "role": "admin", "createdAt": "2026-10-01T12:00:00.000Z" } }`.
- `expiresIn` reflete o TTL configurado em segundos; 3600 corresponde ao default de uma hora.
- JWT assinado em HS256 contém `sub` (ID), `iat` e `exp`. Guard aceita somente esse algoritmo, valida assinatura/expiração e consulta o usuário atual no banco.
- Perfil é lido do banco para cada requisição protegida. Usuário excluído recebe `401`; mudança de perfil passa a valer sem esperar o token expirar.
- Nunca colocar senha/hash no JWT ou na resposta.

### GET /auth/me — autenticado

Retorna `200` com usuário público atual. Ausência, formato inválido, expiração ou assinatura incorreta do token retorna `401`, `UNAUTHORIZED`.

Não existe endpoint de logout: o cliente remove a sessão local. Tokens continuam válidos até expirar, salvo exclusão do usuário; mudança de senha não revoga tokens nesta versão.

## Permissões

- Público: login, `/health` e documentação Swagger. Demais rotas exigem JWT.
- Admin: CRUD completo, listagens e ações de reordenação de todos os recursos.
- Student: GET do catálogo (`categories`, `courses`, `modules`, `lessons`, `tracks`, `trackCourses`) e GET de suas matrículas, progressos, certificados, assinaturas e pagamentos. GET de planos permitido. Sem escrita nesses recursos.
- Instructor: GET de categorias, trilhas, planos e seus próprios cursos, módulos e aulas. GET de `trackCourses` retorna apenas vínculos de cursos atribuídos ao instrutor. Sem acesso a financeiro de alunos, matrículas/progresso/certificados ou escrita nesta entrega.
- Student/Instructor: `GET /users/:id` somente para seu próprio ID; `GET /users` é exclusivo do admin.
- Ambos podem consultar `/auth/me`. Não há alteração de perfil ou senha pelo próprio usuário nesta entrega.
- Endpoints de detalhe aplicam a mesma delimitação da listagem. Quando o perfil pode consultar aquele recurso, mas o registro está fora do seu escopo, responder `404`; quando o perfil não pode executar aquela operação, responder `403`.
- Escopo é imposto no backend, independentemente de IDs fornecidos na query. Filtro por outro aluno não amplia acesso; resulta em lista vazia quando combinado ao escopo do usuário.
- Pagamento pertence ao aluno por meio da assinatura; módulo/aula pertence ao instrutor por meio do curso.
- Trilhas e categorias são metadados consultáveis por instrutores; elas não concedem acesso a cursos de outros instrutores.
- Swagger e frontend esconderem uma ação não substitui validação no backend.

## CRUD /users

Rotas CRUD padrão. Filtros de listagem: `role` e `email` (igualdade após normalização). Listagem exclusiva de admin.

### DTOs

- CreateUser: `fullName` obrigatório (1–150 caracteres), `email` obrigatório (válido, máximo 254), `password` obrigatório (8–72 bytes), `role` obrigatório (`admin | student | instructor`).
- UpdateUser via PUT: `fullName`, `email`, `role` obrigatórios; `password` opcional com a mesma validação. Omissão preserva senha; vazio/null são inválidos.
- UserResponse: `id`, `fullName`, `email`, `role`, `createdAt`.
- `createdAt` é gerado pelo backend; entrada de `createdAt` ou `passwordHash` retorna `400`.

### Regras

- Email duplicado retorna `409`, `EMAIL_ALREADY_EXISTS`.
- Apenas admin pode cadastrar ou alterar perfil admin.
- Impedir que o admin autenticado exclua a própria conta ou remova seu próprio perfil admin (`409`, `SELF_ADMIN_CHANGE_FORBIDDEN`).
- Impedir mudança de instructor para outro perfil enquanto possuir cursos.
- Impedir mudança de student para outro perfil enquanto possuir matrículas, progressos, certificados ou assinaturas.
- Impedir exclusão de instrutor com cursos; aplicar outras cascatas conforme spec 02.
- Hash calculado no service/componente de credenciais; repositories não aceitam hash fornecido por cliente HTTP.
- Consultas públicas de usuário usam seleção explícita de campos para impedir vazamento de hash.

## Critérios de aceite

- Login válido retorna token e usuário sem hash; credenciais incorretas retornam `401` genérico.
- Token adulterado, expirado, com algoritmo indevido ou associado a usuário excluído não acessa rotas protegidas.
- Atualizar perfil altera imediatamente o acesso de token existente.
- Student não consulta registros de outro aluno, inclusive pagamentos por ID e filtros de query.
- Instructor não consulta módulos/aulas de cursos alheios.
- Student e instructor não conseguem escrever ou listar todos os usuários.
- Cadastro normaliza email, impede duplicidade e guarda hash verificável.
- Atualização sem password mantém senha; com password altera o login.
- Operações impeditivas retornam `409` e mantêm os registros intactos.
