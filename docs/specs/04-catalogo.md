# 04 — Catálogo acadêmico

## Contrato comum

Escrita exclusiva do admin; consultas obedecem spec 03. Todas as respostas mantêm IDs de relações como campos planos. DTOs de criação e PUT usam os campos graváveis abaixo; `id` não é recebido no corpo.

Limites: nomes/títulos 1–200 caracteres; descrições 0–5000; level e contentType 1–50; URL até 2048. Valores textuais são aparados, exceto quando a regra exigir preservação.

Referência inexistente recebe `404`; perfil de instrutor inválido ou dependência impeditiva recebe `409`. IDs duplicados em listas de reordenação/vínculos recebem `400`.

## Categorias — /categories

- CRUD padrão.
- Campos: `name`, `description`, ambos obrigatórios.
- GET de listagem sem filtros específicos.
- Exclusão com cursos ou trilhas: `409`, `CATEGORY_IN_USE`.

## Cursos — /courses

- CRUD padrão.
- Campos obrigatórios: `title`, `description`, `instructorId`, `categoryId`, `level`, `publishedAt` (ISO com fuso).
- `level` permanece texto livre; não introduzir enum incompatível com formulários atuais.
- Instrutor deve existir e possuir perfil `instructor`; caso contrário `409`, `INVALID_INSTRUCTOR`.
- GET aceita `categoryId` e `instructorId`.
- Resposta inclui campos persistidos e `totalLessons`, `totalHours` calculados conforme spec 02. Não aceita esses totais em POST/PUT.
- Exclusão aplica cascatas e renormalização descritas na spec 02 em uma operação atômica.

## Módulos — /modules

- CRUD padrão.
- CreateModule: `courseId`, `title` obrigatórios; `order` opcional, default última posição + 1.
- UpdateModule: `courseId`, `title`, `order` obrigatórios. Nesta versão, `courseId` é imutável; tentativa de trocar curso retorna `409`, `MODULE_COURSE_CHANGE_FORBIDDEN`.
- GET aceita `courseId`; ordenação por `order`, depois `id`.
- `order` deve ser inteiro entre 1 e N+1 na criação, ou entre 1 e N na atualização, considerando os módulos do curso. Uma inserção/movimentação desloca os demais registros na transação.
- Exclusão remove aulas/progressos e renormaliza os módulos restantes.

### PUT /courses/:id/modules/order

Entrada: `{ "moduleIds": [3, 1, 2] }`. A lista deve conter exatamente todos os módulos atuais do curso, sem duplicidade. Curso vazio aceita `[]`; outro conjunto retorna `409`, `ORDER_SET_MISMATCH`.

Atualizar todas as posições na mesma transação. Retornar `200` com array de módulos ordenados. Validar e ler o conjunto dentro da transação, com serialização por curso ou isolamento serializável e retry limitado de conflitos, para impedir atualização parcial sob concorrência.

## Aulas — /lessons

- CRUD padrão.
- CreateLesson: `moduleId`, `title`, `contentType`, `contentUrl`, `durationMinutes` obrigatórios; `order` opcional, default última posição + 1.
- UpdateLesson: os mesmos campos, incluindo `order` obrigatório.
- `contentType` é texto livre, preservando opções atuais; `contentUrl` aceita URL HTTP/HTTPS válida. Nenhum upload é necessário.
- `durationMinutes` é inteiro não negativo. `order` segue regra de inserção/movimentação dos módulos, aplicada à coleção de aulas.
- GET aceita `moduleId`.
- Mudança de módulo é permitida somente dentro do mesmo curso; entre cursos retorna `409`, `LESSON_COURSE_CHANGE_FORBIDDEN`. Preservar progresso existente na movimentação dentro do curso.
- Inserção, movimentação e exclusão atualizam a ordem e recalculam conclusão das matrículas afetadas em transação.

### PUT /courses/:id/lessons/order

Entrada: `{ "lessons": [{ "id": 10, "moduleId": 2, "order": 1 }, { "id": 11, "moduleId": 3, "order": 1 }] }`.

- A lista deve conter exatamente todas as aulas do curso, uma vez cada.
- Todos os módulos de destino devem pertencer ao curso.
- Cada módulo recebe ordens únicas e contíguas de 1 até sua quantidade de aulas; módulos vazios são permitidos.
- Curso sem aulas aceita lista vazia. Conjunto incompleto ou diferente retorna `409`, `ORDER_SET_MISMATCH`; ordem inválida retorna `400`.
- Operação atômica com a mesma garantia de concorrência da reordenação de módulos. Retorno `200` com aulas ordenadas por ordem do módulo, ordem da aula e ID.

## Trilhas — /tracks

- CRUD padrão.
- Create/UpdateTrack: `title`, `description`, `categoryId`, `courseIds` obrigatórios.
- `courseIds` é array de IDs únicos na ordem desejada; pode ser vazio.
- GET aceita `categoryId`. Resposta de Track mantém `id`, `title`, `description`, `categoryId`; vínculos são consultados em `/trackCourses`.
- Criação grava trilha e vínculos de uma vez; atualização substitui a seleção/ordem de cursos em uma transação. Não executar vários POST/DELETE no navegador.
- Para pares mantidos, preservar IDs de TrackCourse; excluir vínculos removidos e criar os novos. Vínculos não são identificadores estáveis para consumidores externos.
- Todos os cursos devem existir; não exigir que tenham a mesma categoria da trilha.
- Se um vínculo removido era contexto de um certificado, limpar `trackId` desse certificado na mesma transação.
- Exclusão mantém cursos e certificados; certificados ficam com `trackId: null`.

## Vínculos de trilha — /trackCourses

Somente `GET /trackCourses` e `GET /trackCourses/:id`. Filtros: `trackId`, `courseId`. Ordenação: `trackId`, `order`, `id`.

Escrita é feita exclusivamente via `courseIds` em `/tracks`. POST/PUT/DELETE neste recurso não existem; retornar `404`. Atualizar o cliente para remover chamadas antigas de escrita.

## Critérios de aceite

- Admin executa CRUD dos cinco recursos; `/trackCourses` é consultável sem escrita direta.
- Curso só aceita usuário instructor e categoria existente.
- Totais refletem criação, alteração de duração e exclusão de aulas.
- Exclusão de categoria usada retorna `409`; exclusão de curso remove suas dependências sem excluir a trilha.
- Criação de trilha com um curso inexistente não deixa trilha/vínculos parcialmente criados.
- Reordenação inválida não altera posições; válida persiste e reaparece na interface após recarregar.
- Movimentar aula entre módulos do mesmo curso mantém progresso e normaliza as duas listas.
- Instructor recebe apenas os próprios cursos e seus descendentes; student consulta o catálogo conforme spec 03.
