# Roteiro de apresentação — Nuvio

## Visão geral

**Tema:** sistema web de help desk e gestão de chamados  
**Duração sugerida:** 15 a 20 minutos  
**Apresentadores:** 4 pessoas  
**Foco:** back-end em PHP, API REST, banco de dados, autenticação e regras de negócio

### Distribuição do tempo

| Parte | Tempo |
|---|---:|
| Introdução e problema | 1 min |
| Visão geral e arquitetura | 2 min |
| Banco de dados | 3 min |
| Estrutura do back-end PHP | 3 min |
| Fluxo de autenticação | 2 min |
| Fluxo completo de um ticket | 5 min |
| Segurança, integrações e melhorias | 2 min |
| Encerramento | 1 min |

---

## Divisão entre os quatro apresentadores

Esta é a divisão principal recomendada. Cada pessoa fica responsável por um bloco completo e consegue responder às perguntas relacionadas à sua parte.

| Pessoa | Responsabilidade | Seções | Tempo aproximado |
|---|---|---|---:|
| **Pessoa 1** | Problema, solução e arquitetura | Abertura, visão geral e fluxo da requisição | 4 min |
| **Pessoa 2** | Banco, entrada da API e autenticação | Modelagem, rotas, JWT e autorização | 4–5 min |
| **Pessoa 3** | Regra central e demonstração | Ciclo completo do ticket em PHP | 5–6 min |
| **Pessoa 4** | Recursos complementares e qualidade | Usuários, uploads, e-mail, segurança, melhorias e encerramento | 4–5 min |

### Pessoa 1 — introdução e arquitetura

#### Responsabilidades

- Explicar o problema que o Nuvio resolve.
- Apresentar cliente, técnico e administrador.
- Mostrar rapidamente as principais telas.
- Explicar a separação entre front-end, back-end e banco.
- Mostrar a estrutura de pastas do back-end.
- Explicar o fluxo Next.js → PHP → MySQL.

#### Arquivos que deve conhecer

- `nuvio-front/src/lib/api.tsx`
- `nuvio-back/public/index.php`
- Estrutura geral da pasta `nuvio-back`

#### Transição para a Pessoa 2

> Agora que vimos como o sistema está dividido e como uma requisição chega ao PHP, a Pessoa 2 vai explicar como os dados estão estruturados e como o back-end identifica e protege cada usuário.

### Pessoa 2 — banco de dados, rotas e autenticação

#### Responsabilidades

- Mostrar as entidades e os relacionamentos principais.
- Destacar Ticket como entidade central.
- Explicar chaves estrangeiras, constraints e integridade.
- Mostrar como `routes/api.php` direciona as requisições.
- Explicar bcrypt, JWT, autenticação e autorização.
- Diferenciar as respostas 401 e 403.

#### Arquivos que deve conhecer

- `Nuvio.sql`
- `nuvio-back/routes/api.php`
- `nuvio-back/controllers/AuthController.php`
- `nuvio-back/config/jwt.php`
- `nuvio-back/middleware/auth.php`
- `nuvio-back/config/database.php`

#### Transição para a Pessoa 3

> Com o usuário autenticado e os relacionamentos protegidos no banco, podemos acompanhar a principal regra de negócio do sistema. A Pessoa 3 vai demonstrar o ciclo completo de um ticket e mostrar como o PHP coordena esse processo.

### Pessoa 3 — tickets e demonstração técnica

#### Responsabilidades

- Abrir um chamado pelo portal.
- Explicar o POST para `/portal/tickets`.
- Mostrar validação, prepared statements e transação.
- Abrir o chamado no painel interno.
- Alterar status ou prioridade.
- Explicar comparação de campos e gravação do histórico.
- Mostrar respostas do ticket e integração com o cliente.

#### Arquivos que deve conhecer

- `nuvio-back/controllers/PortalController.php`
- `nuvio-back/controllers/TicketController.php`
- `nuvio-back/models/Ticket.php`
- `nuvio-back/models/HistoricoTicket.php`
- `nuvio-back/models/RespostaTicket.php`

#### Transição para a Pessoa 4

> Esse fluxo reúne as principais responsabilidades do back-end: validação, persistência, transação e rastreabilidade. Para completar a solução, a Pessoa 4 vai mostrar os módulos complementares, as medidas de segurança e as próximas evoluções do projeto.

### Pessoa 4 — módulos complementares, segurança e conclusão

#### Responsabilidades

- Explicar gerenciamento de usuários e perfis.
- Apresentar categorias e SLA.
- Explicar uploads e validação de arquivos.
- Mostrar o serviço de e-mail com PHPMailer.
- Resumir as medidas de segurança.
- Apresentar limitações e melhorias futuras.
- Fazer o encerramento.

#### Arquivos que deve conhecer

- `nuvio-back/controllers/UsuarioController.php`
- `nuvio-back/controllers/ClienteController.php`
- `nuvio-back/controllers/UploadController.php`
- `nuvio-back/services/StorageService.php`
- `nuvio-back/services/EmailService.php`
- `nuvio-back/middleware/rate-limit.php`

#### Fala para iniciar o encerramento

> Além do fluxo de tickets, o PHP também sustenta os cadastros, os SLAs, os uploads e as comunicações por e-mail. Esses módulos completam a operação e mostram que o back-end foi pensado como uma API integrada, não como funções isoladas.

### Regra para perguntas da banca

Cada integrante responde primeiro às perguntas do próprio bloco:

- Arquitetura e comunicação com o front: **Pessoa 1**.
- Banco, JWT e permissões: **Pessoa 2**.
- Tickets, transações e histórico: **Pessoa 3**.
- Upload, e-mail, segurança e melhorias: **Pessoa 4**.

Se alguém não souber uma resposta, pode fazer uma passagem natural:

> Essa parte foi desenvolvida e estudada mais diretamente pela Pessoa X, que pode explicar o detalhe técnico melhor.

---

## 1. Abertura — o que é o Nuvio

### O que mostrar

Abra a página inicial do sistema e, rapidamente, o portal do cliente e o painel interno.

### Fala sugerida

> Boa noite. O nosso projeto se chama Nuvio. Ele é uma plataforma de help desk criada para centralizar a abertura, o acompanhamento e a resolução de chamados de suporte.
>
> O sistema atende dois lados: o cliente, que abre e acompanha seus chamados, e a equipe interna, que gerencia usuários, tickets, técnicos, categorias e regras de SLA.
>
> Embora eu vá mostrar brevemente a interface, o foco desta apresentação será o back-end: como o PHP recebe as requisições, autentica o usuário, aplica as regras de negócio e persiste os dados no MySQL.

### Resumo funcional

- Login e controle de sessão.
- Perfis de Cliente, Técnico e Administrador.
- CRUD de usuários, técnicos, categorias, SLAs, tickets, respostas, anexos e avaliações.
- Portal próprio para o cliente.
- Histórico de alterações do ticket.
- Respostas e notificações por e-mail.
- Upload de foto de perfil e anexos.

---

## 2. Arquitetura geral

### O que mostrar

Mostre as pastas na raiz:

```text
Nuvio/
├── nuvio-front/       Next.js, React e TypeScript
├── nuvio-back/        API em PHP
└── Nuvio.sql          estrutura principal do banco
```

Depois abra `nuvio-back` e mostre rapidamente `config`, `controllers`, `middleware`, `models`, `routes`, `services` e `public`.

### Fala sugerida

> O projeto foi separado em front-end e back-end. O front-end foi feito com Next.js, React e TypeScript. Ele é responsável pela interface e consome o back-end usando requisições HTTP e JSON.
>
> O back-end é uma API em PHP. Ele foi organizado em camadas inspiradas em MVC. As rotas recebem a requisição, os controllers validam e coordenam os casos de uso, os models executam a persistência com PDO e os services isolam integrações como e-mail e armazenamento.
>
> Essa separação reduz o acoplamento. A interface pode mudar sem alterar as regras centrais do back-end, e a mesma API poderia ser consumida por um aplicativo mobile.

### Fluxo de uma requisição

```text
Tela Next.js
    ↓ HTTP + JSON + Bearer Token
public/index.php
    ↓
routes/api.php
    ↓
middleware de autenticação/autorização
    ↓
Controller
    ↓
Model ou Service
    ↓
PDO / MySQL ou serviço externo
    ↓
Resposta JSON + status HTTP
```

### Arquivos para abrir

- `nuvio-back/public/index.php`
- `nuvio-back/routes/api.php`
- `nuvio-back/controllers/BaseController.php`
- `nuvio-front/src/lib/api.tsx`

### Ponto técnico importante

No `apiFetch`, o front-end recupera o token e envia:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

O back-end devolve JSON e usa códigos HTTP coerentes, como 200, 201, 400, 401, 403, 404, 409, 422, 429 e 500.

---

## 3. Banco de dados e modelagem

### O que mostrar

Abra `Nuvio.sql` e apresente as tabelas por grupos, sem ler todo o arquivo.

### Fala sugerida

> O banco principal é relacional e utiliza MySQL. A entidade central é Ticket. Ela se relaciona com o usuário solicitante, o técnico responsável, uma categoria e um SLA.
>
> A modelagem também registra respostas, anexos, avaliações e um histórico de mudanças. Assim, não armazenamos apenas o estado atual do chamado: conseguimos saber quem alterou um campo, quando alterou, qual era o valor anterior e qual passou a ser o novo valor.

### Tabelas principais

| Tabela | Responsabilidade |
|---|---|
| `tipoUsuario` | Define Cliente, Técnico ou Administrador |
| `Usuario` | Dados de acesso e perfil |
| `Tecnico` | Especialidade e situação do técnico |
| `Administrador` | Nível e permissões administrativas |
| `Categoria` | Classificação do chamado |
| `SLA` | Prazos de resposta e resolução |
| `Ticket` | Entidade principal do atendimento |
| `HistoricoTicket` | Auditoria das mudanças do ticket |
| `respostaTicket` | Conversa vinculada ao chamado |
| `anexo` | Metadados dos arquivos enviados |
| `avaliacaoTicket` | Nota e comentário do cliente |

Há também migrations para perfis e tags de clientes, índices, auditoria e otimizações.

### Regras garantidas pelo banco

- E-mail de usuário único.
- Chaves estrangeiras entre as entidades.
- Apenas prioridades `Alta`, `Media` ou `Baixa`.
- Apenas estados `Aberto`, `Em atendimento`, `Resolvido` ou `Fechado`.
- Nota de avaliação entre 1 e 5.
- Data de fechamento não pode ser anterior à abertura.
- Um ticket só pode ter uma avaliação.

### Frase de destaque

> Algumas regras são verificadas no PHP para oferecer mensagens amigáveis, mas também são reforçadas no banco. Isso protege a consistência mesmo se outro cliente consumir a API.

---

## 4. Entrada e roteamento da API em PHP

### O que mostrar

Abra `public/index.php` e depois `routes/api.php`.

### Fala sugerida

> Todas as chamadas entram pelo `public/index.php`. Ele configura CORS, define a resposta como JSON, encerra requisições OPTIONS de preflight e encaminha a execução para o arquivo de rotas.
>
> Em `routes/api.php`, a aplicação identifica o método HTTP e a URI. A partir disso, seleciona o controller adequado. As rotas públicas são apenas registro e login; as demais passam pela validação do JWT.

### Exemplos de endpoints para citar

| Método | Endpoint | Função |
|---|---|---|
| POST | `/auth/login` | Autenticar e emitir JWT |
| GET | `/auth/verificar` | Consultar a sessão atual |
| GET | `/tickets` | Listar tickets |
| POST | `/tickets` | Criar ticket |
| PUT | `/tickets/{id}` | Atualizar ticket |
| GET | `/tickets/{id}/historico` | Consultar auditoria |
| POST | `/tickets/{id}/responder-email` | Responder por e-mail |
| GET/POST | `/portal/tickets` | Listar ou abrir chamados do cliente |
| GET/POST | `/portal/tickets/{id}/mensagens` | Conversa do cliente |
| POST | `/upload/foto` | Foto de perfil |
| POST | `/upload/anexo` | Anexo de ticket |

### BaseController

Mostre os métodos `body`, `respond`, `missing` e `existeRegistro`.

> O `BaseController` concentra comportamentos repetidos: leitura do JSON, respostas padronizadas, validação de campos obrigatórios e verificação de relacionamentos. Os outros controllers herdam essa base.

---

## 5. Autenticação e autorização

### O que mostrar

Abra, nesta ordem:

1. `controllers/AuthController.php`, método `login`.
2. `config/jwt.php`, métodos `gerar` e `validar`.
3. `middleware/auth.php`, funções `autenticar` e `autenticarEAutorizar`.

### Fala sugerida

> No login, o PHP valida se e-mail e senha foram informados, valida o formato do e-mail e busca o usuário por meio de uma query preparada.
>
> A senha não é comparada diretamente. Ela é armazenada como hash usando bcrypt e conferida com `password_verify`. Quando as credenciais são válidas, o servidor gera um JWT assinado com HMAC SHA-256 e prazo de expiração configurável.
>
> Nas próximas requisições, o token chega no cabeçalho Authorization. O middleware confere formato, assinatura e expiração. Para operações administrativas, ele consulta também o perfil do usuário e pode devolver 403 quando a permissão é insuficiente.

### Diferencie os conceitos

- **Autenticação:** comprovar quem é o usuário; falha retorna 401.
- **Autorização:** decidir o que esse usuário pode fazer; falha retorna 403.

### Medidas complementares

- Hash de senha com `password_hash` e `password_verify`.
- Prepared statements contra SQL injection.
- CORS limitado a origens autorizadas.
- Rate limit de login: até 10 tentativas em 15 minutos por IP, quando habilitado.
- Segredos e credenciais carregados por variáveis de ambiente.
- Normalização de roles para evitar diferenças de acentuação e capitalização.

---

## 6. Demonstração principal — ciclo completo de um ticket

Esta é a parte mais importante da apresentação.

### Etapa A — abrir o chamado pelo portal

#### O que fazer na tela

1. Entre no portal como cliente.
2. Clique em **Novo chamado**.
3. Preencha assunto, prioridade e descrição.
4. Envie.

#### Fala enquanto demonstra

> Neste momento, o front-end faz um POST para `/portal/tickets`. O token identifica o cliente, por isso o front não precisa enviar nem escolher o proprietário do chamado.

#### O que abrir no código

`controllers/PortalController.php`, método `create`.

#### Explique o processamento

1. O PHP lê e valida o corpo JSON.
2. Aceita somente as prioridades previstas.
3. Localiza técnico, categoria e SLA padrão.
4. Inicia uma transação no banco.
5. Insere o ticket com status `Aberto`.
6. Insere a criação em `HistoricoTicket`.
7. Confirma a transação com `commit`.
8. Tenta enviar o e-mail de confirmação.
9. Retorna HTTP 201 e o ID do ticket.

### Frase de destaque sobre transação

> A criação do ticket e seu primeiro histórico formam uma única operação lógica. Se uma das duas gravações falhar, o código executa rollback. Assim, não existe ticket criado sem o respectivo histórico.

### Etapa B — listar e consultar

#### O que fazer na tela

Abra a tela interna de chamados e selecione o chamado criado.

#### O que mostrar no código

- `models/Ticket.php`, métodos `getAll` e `getById`.
- Os `INNER JOIN` com usuário, técnico, categoria e SLA.

#### Fala sugerida

> Para evitar que o front tenha de fazer várias consultas, o model retorna o ticket já enriquecido com o nome do solicitante, técnico, categoria e SLA. Isso é feito com joins no banco.

### Etapa C — atualizar status ou prioridade

#### O que fazer na tela

Altere o ticket de `Aberto` para `Em atendimento` e, se possível, mude também sua prioridade.

#### O que mostrar no código

`controllers/TicketController.php`, método `update`.

#### Fala sugerida

> O endpoint de atualização usa PUT e aceita somente uma lista explícita de campos. O proprietário do chamado, por exemplo, não pode ser trocado nesse fluxo.
>
> O controller carrega o estado anterior, compara cada campo e cria uma lista de mudanças. Depois, dentro de uma transação, atualiza o ticket e grava cada alteração no histórico com valor anterior, valor novo, usuário e data.
>
> Se o status virar Fechado, o model registra a data de fechamento. Se o chamado for reaberto, essa data é removida. Após o commit, o sistema tenta enviar uma notificação por e-mail ao cliente.

### Etapa D — mostrar o histórico

Faça ou simule um GET em `/tickets/{id}/historico`.

> Aqui conseguimos demonstrar rastreabilidade. Em um sistema de atendimento não basta conhecer o estado atual; é importante saber toda a evolução do chamado e quem realizou cada ação.

### Etapa E — responder ao cliente

Na tela de atendimento, envie uma mensagem ou mostre o composer de resposta.

> A resposta pode ser persistida em `respostaTicket` e enviada ao cliente por SMTP usando PHPMailer. O envio de e-mail foi isolado no `EmailService`, para não misturar configuração SMTP com as regras do ticket.

---

## 7. Outros módulos do PHP

Apresente esta seção rapidamente para mostrar a abrangência sem perder o foco.

### Usuários e perfis

- `UsuarioController`: CRUD de usuários.
- Ao criar um Técnico ou Administrador, o sistema cria também o registro especializado correspondente.
- `ClienteController`: cria usuário, perfil do cliente e tags dentro de uma transação.

### Categorias e SLA

- Controllers e models próprios.
- Validação de duplicidade.
- Verificação de vínculos antes da exclusão.
- SLA registra prazo de primeira resposta e de resolução.

### Uploads

- Validação de tamanho, extensão e MIME type.
- Foto de perfil limitada a 2 MB e armazenada como data URI no banco.
- Anexos limitados a 25 MB e salvos no diretório público.
- Nome de arquivo aleatório para reduzir colisões.
- Bloqueio de `..` para prevenir directory traversal.

### E-mail

- PHPMailer via Composer.
- SMTP configurado por variáveis de ambiente.
- Confirmação de novo ticket.
- Atualização de status.
- Resposta do atendente.
- Boas-vindas ao cliente.

### Portal do cliente

> Um detalhe importante é a verificação de propriedade: ao consultar um chamado pelo portal, a query exige ao mesmo tempo o ID do ticket e o ID do usuário autenticado. Assim, um cliente não acessa o chamado de outro apenas trocando o número na URL.

---

## 8. Segurança e qualidade

### Pontos implementados

- Senhas com hash bcrypt.
- JWT com assinatura e expiração.
- Autorização por perfil.
- PDO sem emulação de prepared statements.
- Transações em operações compostas.
- Sanitização básica com `trim`, `strip_tags` e `htmlspecialchars`.
- Validação de IDs, e-mails, enums e arquivos.
- CORS configurável.
- Rate limiting no login.
- Credenciais fora do código por `.env`.
- Histórico de ticket e estrutura adicional de auditoria em migration.

### Como falar sobre limitações

> O projeto está funcional, mas também identificamos evoluções importantes antes de considerá-lo pronto para uma operação de grande escala. Enxergar essas limitações faz parte do trabalho de back-end.

### Próximos passos reais

1. Remover ou bloquear em produção os scripts públicos de teste, seed e criação de tabelas.
2. Tornar obrigatório um `JWT_SECRET` forte, eliminando a chave padrão de desenvolvimento.
3. Refinar autorização por perfil em todas as rotas de escrita, não apenas em algumas.
4. Mover o rate limit de arquivos locais para Redis em uma implantação com múltiplas instâncias.
5. Consolidar todas as migrations e incluir a tabela `Notificacao` no schema versionado.
6. Armazenar anexos em um serviço persistente, pois discos de algumas plataformas são efêmeros.
7. Criar testes automatizados unitários e de integração para autenticação, autorização e tickets.
8. Padronizar nomes de colunas e remover compatibilidades legadas quando todos os bancos estiverem migrados.
9. Documentar a API com OpenAPI/Swagger.

---

## 9. Encerramento

### Fala sugerida

> Para concluir, o Nuvio não é apenas uma interface de chamados. O núcleo do projeto está no back-end PHP: ele autentica usuários, protege rotas, valida dados, executa regras de negócio, mantém relacionamentos no MySQL, garante atomicidade com transações e registra o histórico completo do atendimento.
>
> O fluxo que mostramos conecta todas as camadas: uma ação no Next.js vira uma requisição HTTP, passa pelo roteamento e pelos middlewares, chega ao controller, é persistida pelo model com PDO e retorna como JSON para a interface.
>
> Com isso, conseguimos entregar uma base organizada e extensível para uma plataforma real de suporte. Obrigado. Agora podemos responder às perguntas.

---

## 10. Perguntas que podem surgir

### “Por que usar JWT?”

> Porque a API e o front-end são separados. O token permite autenticar cada requisição sem manter uma sessão PHP tradicional no servidor. Ele contém o identificador e o perfil do usuário, tem expiração e sua assinatura impede alterações sem o segredo.

### “JWT criptografa os dados?”

> Não. O JWT usado é assinado, não criptografado. O payload pode ser decodificado, por isso colocamos apenas dados não sensíveis. A segurança do transporte depende também de HTTPS.

### “Como vocês evitam SQL injection?”

> Usamos PDO com prepared statements reais. Os valores são enviados separadamente da instrução SQL, e IDs e enums ainda passam por validação antes da consulta.

### “Por que usar transações?”

> Porque algumas ações alteram mais de uma tabela. Na criação ou atualização de um ticket, os dados principais e o histórico precisam ser gravados juntos. Commit confirma tudo; rollback desfaz tudo se houver falha.

### “Qual é a diferença entre controller e model?”

> O controller coordena a requisição, valida o caso de uso e define a resposta HTTP. O model concentra o acesso e o mapeamento dos dados. Essa divisão evita colocar regra HTTP dentro das consultas e SQL dentro da interface.

### “Como um cliente é impedido de acessar o ticket de outro?”

> Nas rotas do portal, a consulta usa simultaneamente `idTicket` e o `idUsuario` extraído do JWT. Mesmo que o cliente altere o ID na URL, a query não devolve um ticket que não pertença a ele.

### “O que acontece se o e-mail falhar?”

> Nos fluxos de criação e mudança de status, o e-mail é complementar. O dado principal é salvo primeiro e uma falha SMTP é registrada sem desfazer o ticket. Na rota específica de resposta por e-mail, a API informa a falha ao atendente.

### “Por que PHP sem framework?”

> Neste projeto, a implementação manual tornou explícitos conceitos fundamentais do back-end: roteamento, middleware, status HTTP, JSON, autenticação, controllers, models e PDO. Para uma evolução maior, um framework como Laravel poderia padronizar migrations, validações, filas e testes.

### “Como o sistema poderia escalar?”

> A API pode ser tornada stateless, com Redis para rate limiting e filas, object storage para anexos, workers para e-mail, cache para consultas frequentes e múltiplas instâncias atrás de um balanceador.

---

## 11. Checklist antes da apresentação

- [ ] Confirmar que front-end, back-end e banco estão disponíveis.
- [ ] Separar uma conta de Cliente e uma de Administrador/Técnico.
- [ ] Testar o login das duas contas.
- [ ] Criar previamente categoria, SLA e técnico válidos.
- [ ] Abrir um ticket de ensaio e atualizar seu status.
- [ ] Confirmar se a configuração SMTP funciona; se não funcionar, explicar que é integração externa.
- [ ] Deixar abertas as abas dos arquivos que serão mostrados.
- [ ] Aumentar a fonte do editor e do navegador.
- [ ] Ocultar arquivos `.env`, senhas, tokens e credenciais.
- [ ] Ter screenshots ou um vídeo curto como plano B.
- [ ] Não executar scripts `seed.php`, `create_tables.php` ou migrations durante a apresentação.
- [ ] Definir previamente quem será Pessoa 1, 2, 3 e 4.
- [ ] Ensaiar as três transições entre os apresentadores.
- [ ] Cada integrante deve saber explicar sua parte sem ler o documento inteiro.
- [ ] Todos devem conhecer, pelo menos, o fluxo geral de autenticação e criação do ticket.
- [ ] Cronometrar o ensaio para evitar que a demonstração da Pessoa 3 tire o tempo da conclusão.

### Abas de código recomendadas

1. `Nuvio.sql`
2. `nuvio-back/public/index.php`
3. `nuvio-back/routes/api.php`
4. `nuvio-back/controllers/AuthController.php`
5. `nuvio-back/config/jwt.php`
6. `nuvio-back/middleware/auth.php`
7. `nuvio-back/controllers/TicketController.php`
8. `nuvio-back/models/Ticket.php`
9. `nuvio-back/models/HistoricoTicket.php`
10. `nuvio-back/services/EmailService.php`
11. `nuvio-front/src/lib/api.tsx`

---

## 12. Versão curta — apresentação de 8 a 10 minutos

Se o tempo for menor, use esta ordem:

1. **Problema e solução — 1 min:** explique o Nuvio e seus dois públicos.
2. **Arquitetura — 1 min:** Next.js → API PHP → MySQL.
3. **Banco — 1 min:** destaque Ticket, Usuario, SLA e HistoricoTicket.
4. **Autenticação — 2 min:** login, bcrypt, emissão e validação do JWT.
5. **Demonstração — 3 min:** criar ticket, atualizar status e mostrar histórico.
6. **Segurança e encerramento — 1 min:** PDO, transações, autorização e próximos passos.

Evite abrir todos os CRUDs. Use o ticket como fio condutor, pois ele demonstra roteamento, validação, relacionamentos, transação, histórico e integração por e-mail em um único fluxo.

### Divisão curta entre quatro pessoas

| Pessoa | Conteúdo | Tempo |
|---|---|---:|
| **Pessoa 1** | Problema, solução e arquitetura | 2 min |
| **Pessoa 2** | Banco, rotas e autenticação JWT | 2 min |
| **Pessoa 3** | Demonstração do ciclo do ticket | 3 min |
| **Pessoa 4** | Segurança, melhorias e conclusão | 2 min |
