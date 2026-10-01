# 01 — Arquitetura e infraestrutura

## Escopo

Manter um único repositório, com aplicações independentes em `frontend/` e `backend/`. Substituir o runtime do JSON Server por NestJS. Usar um backend modular com repositories concretos, sem introduzir microserviços, filas ou camadas de abstração adicionais.

## Organização proposta

```text
backend/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    main.ts
    app.module.ts
    prisma/
      prisma.module.ts
      prisma.service.ts
    common/
      decorators/
      guards/
      filters/
    auth/
      dto/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
    users/
      dto/
      users.module.ts
      users.controller.ts
      users.service.ts
      users.repository.ts
    catalog/
      catalog.module.ts
      categories/
      courses/
      modules/
      lessons/
      tracks/
    learning/
      learning.module.ts
      enrollments/
      lesson-progress/
      certificates/
    finance/
      finance.module.ts
      plans/
      subscriptions/
      payments/
  test/
  .env.example
  Dockerfile
  package.json
```

Cada pasta de recurso usa DTOs, controller, service e repository próprios. Os módulos agregadores registram/exportam providers necessários. `TrackCourses` pode ser atendido pelo controller e repository de trilhas, sem módulo separado.

## Responsabilidades e dependências

- Controllers recebem HTTP, aplicam decorators de acesso e descrevem OpenAPI; não executam queries Prisma.
- DTOs validam entrada e documentam campos. DTOs de saída omitem campos internos e convertem tipos como Decimal.
- Services executam regras e coordenam operações; não dependem de `Request` ou `Response` do framework HTTP.
- Repositories usam Prisma para consultas, gravações e operações transacionais. Não retornam respostas HTTP.
- PrismaService mantém uma instância compartilhada do cliente e integra conexão/desconexão ao ciclo de vida NestJS.
- Guards validam JWT e perfil. Services/repositories também restringem recursos ao usuário quando a regra depende de propriedade.
- Injeção de dependências via NestJS; repositories concretos. Não criar `BaseRepository` genérico.
- AuthModule utiliza UsersService exportado pelo UsersModule para consultar credenciais; controllers de usuários usam projeções públicas. Evitar dependência circular entre Auth e Users.

Transações que abrangem vários recursos são iniciadas por uma operação de repository que representa o caso de uso, chamada pelo service. Se outros repositories participarem, todos devem receber o mesmo cliente transacional (`Prisma.TransactionClient` ou equivalente da versão adotada). Não abrir transações independentes para uma única operação atômica. Exclusões com cascatas de FK continuam dentro da mesma operação.

## Inicialização e configuração

- NestJS ouve em `0.0.0.0:3001`; `PORT` permite configurar outra porta.
- ValidationPipe global: transformação controlada, whitelist e rejeição de campos desconhecidos. Não converter strings arbitrárias em booleanos/números nos DTOs de corpo; filtros e parâmetros têm conversão explícita.
- Filtro global padroniza erros e traduz erros esperados do Prisma para `404`/`409`; falhas inesperadas retornam `500` genérico.
- Configuração validada ao iniciar. Variáveis obrigatórias ausentes devem interromper a inicialização com mensagem que identifica a chave, sem seu valor secreto.
- `.env.example` documenta `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=1h`, `PORT=3001`, `CORS_ORIGINS` e variáveis do PostgreSQL no Compose.
- `JWT_SECRET` deve ter pelo menos 32 caracteres e vir do ambiente; não colocar segredo real no código ou git.
- CORS permite as origens locais configuradas (Vite e frontend Docker), sem wildcard por padrão.
- Logs de inicialização e falhas ajudam a demonstração; não registrar corpos de login, Authorization ou hashes.
- `GET /health` público verifica conectividade do banco e retorna `200 { "status": "ok" }` ou `503` padronizado.

## Banco e scripts

- Prisma define o schema PostgreSQL e versiona migrations no repositório.
- Scripts documentados: desenvolvimento, build, execução compilada, geração do cliente, migration de desenvolvimento, aplicação de migrations existentes, seed e testes.
- Gerar cliente durante build/instalação conforme a versão selecionada; artefatos necessários devem existir no container final.
- Definir versões compatíveis e suportadas de Node, NestJS, Prisma e PostgreSQL ao implementar; registrar em manifests, lockfiles e imagens. Não usar imagens `latest`.
- Scripts e configuração Prisma devem corresponder à versão escolhida, inclusive geração do cliente, adapter/conexão e seed, quando aplicável.
- Remover JSON Server das dependências e scripts. `db.json` pode ser removido na implementação; não é fonte de verdade do novo sistema.

## Docker Compose

- Serviços: `frontend`, `backend` e `postgres`.
- Portas para demonstração: frontend `4173`, API `3001`. A porta do PostgreSQL pode ser publicada para desenvolvimento, documentada no README.
- PostgreSQL tem volume nomeado e healthcheck; backend aguarda banco saudável.
- Backend aplica migrations versionadas antes de servir HTTP. Seed é um comando explícito após o primeiro start, não uma rotina que sobrescreve dados a cada reinício.
- Frontend mantém Nginx e proxy `/api/` removendo o prefixo, como no contrato atual. Exemplo: `/api/users` chega ao backend como `/users`.
- Vite tem proxy equivalente para desenvolvimento sem Docker.
- Segredos vêm de `.env` ignorado pelo git. Exemplo de configuração local pode usar credenciais claramente identificadas como de demonstração.
- README explica start, seed, acesso, logs, execução local e reset destrutivo opcional do volume apenas para este ambiente acadêmico.

## Critérios de aceite

- `docker compose up --build` sobe os três serviços e `/health` confirma acesso ao PostgreSQL.
- Reiniciar containers mantém registros já cadastrados.
- Banco vazio recebe todas as tabelas por migrations; seed é executável de forma explícita.
- Build do backend funciona e o container final inicia com os artefatos Prisma disponíveis.
- Ausência de configuração obrigatória falha de maneira compreensível.
- Uma entrada inválida recebe `400` padronizado; falha interna não revela detalhes do banco.
- As camadas respeitam as responsabilidades, e não há dependência de JSON Server no runtime.
