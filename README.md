# Plataforma de Cursos - CMP1058

Plataforma academica de gestao de cursos desenvolvida com React + TypeScript no frontend e JSON Server no backend.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Componentes no padrao shadcn/ui
- JSON Server
- Docker Compose

## Como executar

```bash
docker compose up --build
```

Servicos disponiveis:

- Frontend: `http://localhost:4173`
- API JSON Server: `http://localhost:3001`

## Modulos implementados

### Catalogo

- Categorias em DataTable
- Cursos em DataTable
- Estrutura em 3 colunas: cursos, arvore de modulos/aulas e propriedades
- Trilhas com sequencia visual e drag and drop
- Menus contextuais para acoes operacionais
- Reordenacao de modulos, aulas e cursos em trilhas

### Usuarios

- CRUD de usuarios
- CRUD de matriculas
- CRUD de progresso por aula
- CRUD de certificados
- Visualizacao operacional com tabelas densas e filtros de busca

### Financeiro

- CRUD de planos
- CRUD de assinaturas
- CRUD de pagamentos
- Relacionamento entre aluno, plano, assinatura e receita simulada

## Estrutura do projeto

```text
backend/
  db.json
  Dockerfile
frontend/
  src/
    components/
    hooks/
    pages/
    services/
    types/
  Dockerfile
docker-compose.yml
```

## Observacoes

- O backend utiliza JSON Server e dados seedados em `backend/db.json`.
- As regras de negocio e limpeza de relacionamentos foram tratadas no frontend para manter consistencia dos dados simulados.
- A sidebar desktop pode ser recolhida e expandida para ampliar a area util da interface.

## Validacao realizada

- `npm run build`
- `npm run lint`
- `docker compose up --build`
