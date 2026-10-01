# 06 — Frontend, Swagger, seed e validação

## Frontend

Manter layout, páginas e CRUD existentes, adaptando os contratos alterados pelas specs. Não implementar portais adicionais.

### Sessão e rotas

- Criar `/login` com email, senha, estado de envio e mensagem de erro.
- Guardar accessToken em `sessionStorage` para a demonstração acadêmica; não guardar senha. Carregar identidade por `/auth/me` ao restaurar sessão.
- Proteger toda a árvore de `AppLayout` com autenticação e perfil admin. Não montar hooks de dados antes de validar a sessão.
- Usuário admin autenticado acessa o painel; usuário student/instructor vê mensagem de que o painel é exclusivo de administrador, com opção de sair.
- Header inclui identidade e logout. Logout apaga token e dados em memória e redireciona ao login.
- `401` em qualquer request protegida limpa sessão e leva ao login. Credenciais incorretas no login apenas mostram erro no formulário.
- `403` mostra falta de permissão; `400` mostra validação; `409` mostra regra impeditiva. Falha de rede é distinta de sessão expirada e não apaga sessão.
- Não apagar a sessão por resposta antiga de uma requisição iniciada antes de um novo login; cancelar requisições/invalidar resultados da sessão anterior ao trocar usuário.

### Camada de API

- Manter `VITE_API_URL` e fallback `/api`. Vite e Nginx encaminham `/api` para o backend sem prefixo.
- Incluir Authorization Bearer nas requisições protegidas; login não exige token.
- Corrigir composição de headers para que RequestInit não sobrescreva o conjunto final de Content-Type e Authorization.
- Interpretar o corpo de erro padronizado e propagar mensagens úteis para os hooks; não substituir toda falha por texto genérico.
- Remover deleteMany e rotinas do cliente de limpeza de relacionamentos. Uma exclusão de recurso dispara uma única operação de backend.
- Criar/alterar trilha envia courseIds diretamente em `/tracks`.
- Reordenar usa endpoints de lote das specs; não vários PUT independentes.
- Após mutações, recarregar dados como já faz o frontend. Para o volume acadêmico, manter carregamento agregado de arrays; paginação fica fora da entrega.

### Tipos e formulários

- UserResponse sem passwordHash; UserPayload usa password e inclui role admin. Separar payloads de criação/edição para senha opcional no PUT.
- Remover edição de createdAt; criar campo de senha e indicação de que vazio na edição preserva a senha (omitir do payload).
- Curso exibe totalLessons/totalHours calculados, sem inputs editáveis nem envio desses campos.
- Matrícula exibe completedAt calculado, sem edição/envio.
- Certificado exibe verificationCode/issuedAt gerados; criação envia somente aluno, curso e contexto opcional. PUT mantém alvo e altera contexto.
- Para campos opcionais anuláveis, enviar null ao limpar. `trackId` no modelo passa a `number | null`.
- Price/amountPaid usam string decimal nos modelos da API e nos formulários. Não usar `Number` para serializar os valores de entrada.
- Resumos financeiros podem usar conversão para centavos inteiros para soma e formatação em BRL; não somar decimais binários e tratar o resultado como valor financeiro exato.
- DTOs removidos dos formulários não podem continuar sendo enviados por spread de objetos antigos.
- Controles de alvo imutável ficam desabilitados na edição de matrícula, progresso e certificado.
- Datas em formulários de dia são convertidas de maneira determinística para UTC (00:00:00Z); backend recebe ISO com fuso. Renderizar datas de dia sem deslocamento indevido pelo fuso do navegador.
- Ao concluir progresso, campo de data pode ser omitido para usar agora; limpar data de estado concluído deve causar orientação no formulário, não envio de null.
- Confirmações de exclusão descrevem cascatas ou impedimentos conforme recurso.

## Swagger/OpenAPI

- Disponibilizar UI em `http://localhost:3001/docs` e JSON em `/docs-json`.
- Usar integração oficial NestJS Swagger, com tags: Auth, Users, Categories, Courses, Modules, Lessons, Tracks, TrackCourses, Enrollments, LessonProgress, Certificates, Plans, Subscriptions, Payments e Health.
- Documentar todos os DTOs de entrada/saída, inclusive erros, enums, campos calculados, nullable, formatos de datas/decimais e filtros.
- Configurar esquema HTTP Bearer JWT e botão Authorize para testar rotas protegidas.
- Rotas públicas devem ser identificadas como públicas; documentação informa quais perfis podem executar cada operação e o escopo dos registros.
- Documentar respostas 200/201/204 e erros aplicáveis 400/401/403/404/409; `/health` também documenta 503.
- Exemplo de usuário e qualquer schema público não inclui passwordHash.
- Testar operações pela URL direta da API para evitar diferença de prefixo do proxy.

## Seed de demonstração

- Execução explícita e repetível: segunda execução não duplica registros nem apaga cadastros feitos pela interface.
- Definir chaves determinísticas/IDs conhecidos para fixtures; criar sequência/IDs seguintes corretamente quando necessário. Atualizar fixtures não deve truncar o banco.
- Criar admin, instructor e dois students com emails de demonstração e senhas bcrypt. Credenciais locais devem estar documentadas no README como dados de teste.
- Criar ao menos duas categorias, dois cursos do instructor, módulos/aulas, uma trilha com cursos ordenados, um plano, assinatura e pagamento simulado.
- Um estudante tem curso totalmente concluído e certificado; outro tem matrícula e progresso parcial. Datas, ordens, vínculos e totalizações são consistentes.
- Usar código de certificado e referência de pagamento determinísticos somente nas fixtures para permitir idempotência.
- Seed deve respeitar invariantes de negócio; usar serviços ou construir fixtures equivalentes validadas por testes. Não inserir hashes fictícios.

## Validação obrigatória

### Automatizada

- Build backend e frontend; lint de ambos conforme scripts configurados.
- Integração/e2e com PostgreSQL real em banco isolado: autenticação, autorização por registro, constraints, cascatas, transações e precisão financeira.
- Testar cenários de aceite das specs, priorizando comportamento externo; não criar testes que apenas reproduzam getters ou wrappers.
- Teste de contrato confirma arrays planos, enums do progresso, valores Decimal como string, datas ISO e ausência de hash.
- Testar rollback de criação/alteração de trilha com referência inválida e reordenação inválida sem alteração parcial.
- Testar operações concorrentes relevantes: matrícula duplicada e alterações de progresso/reordenação, com estado final consistente.
- Testes nunca usam/resetam o banco de demonstração; ambiente de teste possui URL/volume próprios.
- Seed executado duas vezes mantém as fixtures sem duplicidade e preserva um registro adicional criado durante o teste.

### Demonstração manual

1. Subir Compose, executar seed e abrir login.
2. Entrar como admin; verificar todas as páginas atuais.
3. Cadastrar usuário com senha e confirmar que consegue autenticar via Swagger.
4. Criar categoria, curso, módulo, aulas e trilha; reordenar e recarregar.
5. Matricular aluno, registrar progresso até conclusão e emitir certificado.
6. Cadastrar plano, assinatura e pagamento; verificar resumo e restrição de exclusão do plano.
7. Testar aluno consultando apenas seus dados e instrutor consultando apenas seus cursos pelo Swagger.
8. Sair, tentar acessar URL protegida e verificar redirecionamento; demonstrar expiração com TTL reduzido em ambiente de teste.
9. Reiniciar containers e confirmar persistência.
10. Excluir recursos de demonstração e confirmar cascatas/impedimentos com mensagens úteis.

## Documentação final

Atualizar README principal com stack, versões/requisitos, variáveis, comandos de start/seed/teste, URLs, credenciais de demonstração, permissões e limitações acadêmicas. Incluir link para este conjunto de specs.

Registrar validações realmente executadas e limitações encontradas na entrega; não declarar testes ou demonstração como concluídos sem execução.

## Critérios de aceite final

- Nenhuma tela depende do JSON Server ou recebe passwordHash.
- Interface mantém as funcionalidades atuais, respeitando campos calculados e regras novas.
- Swagger permite autenticar e executar todas as operações autorizadas, com contratos iguais aos usados pelo frontend.
- Seed e migrations reproduzem o projeto em um ambiente novo.
- Testes obrigatórios e builds passam; demonstração manual cobre fluxo acadêmico e financeiro completos.
- README permite que outra pessoa da faculdade execute e apresente o sistema.
