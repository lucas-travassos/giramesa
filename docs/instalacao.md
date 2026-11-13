# Instalação e execução — GiraMesa

Instruções de preparação do ambiente local, execução e recuperação. Os comandos partem da raiz do repositório, salvo indicação em contrário.

## Tecnologias e requisitos

- Frontend: Vue 3, Pinia, Vue Router, Bootstrap 5, Bootstrap Icons, Chart.js, vue-chartjs e axios `1.20.0`.
- Backend: Node.js, Express, Sequelize, MySQL, JWT, bcrypt, cors, dotenv `16.4.5`, Helmet `8.3.0` e express-rate-limit `8.7.2`.
- Node.js compatível com `^22.18.0 || >=24.12.0`, conforme `package.json`, e npm.
- Docker Desktop com mecanismo Linux operacional e Docker Compose; somente o banco utiliza container. MySQL `8.4.13`, tabelas InnoDB e volume persistente dedicado.
- Git e Git Bash no Windows. Os comandos deste guia seguem a sintaxe do Git Bash.

No PowerShell, utilizar `npm.cmd` no lugar de `npm` em todos os comandos abaixo: por exemplo, `npm.cmd ci`, `npm.cmd run seed:demo` e `npm.cmd run dev`. Isso evita o bloqueio do lançador `npm.ps1` pela política de scripts. Usar `Copy-Item .env.example .env` e `Copy-Item backend/.env.example backend/.env` para as cópias da etapa 2, somente em uma instalação nova.

Resultados de instalação, perfis, seeds e persistência ficam em [TESTES](TESTES.md). A instalação com npm ci em outra máquina não foi comprovada.

## 1. Obter o projeto e instalar dependências

```sh
git clone https://github.com/lucas-travassos/giramesa.git
cd giramesa
git switch develop
npm ci
cd backend
npm ci
cd ..
```

O frontend fica na raiz; o backend possui dependências e scripts próprios em `backend/`. O desenvolvimento ocorre em `develop`; entregas chegam à `main` por Pull Request.

## 2. Configurar os ambientes

Em uma instalação nova, a partir da raiz:

```sh
cp .env.example .env
cp backend/.env.example backend/.env
```

Em instalações existentes, preservar os arquivos locais. Os exemplos são versionados; os arquivos `.env` são ignorados pelo Git e não devem ser publicados.

Configuração do frontend, em `.env`:

```dotenv
VITE_API_URL=http://localhost:3001/api
```

Configuração do backend, em `backend/.env`, adaptando usuário e senha de acesso ao MySQL local:

```dotenv
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3309
DB_NAME=giramesa
DB_USER=giramesa_app
DB_PASS=senha_do_banco
JWT_SECRET=substitua_por_uma_chave_aleatoria_local
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
LOGIN_MAX_TENTATIVAS=10
LOGIN_JANELA_MS=900000
```

Para gerar uma chave JWT local, executar e copiar o resultado somente para `JWT_SECRET`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

A API usa as origens exatas de CORS_ORIGINS e limita falhas de login por IP conforme os dois parâmetros acima. O token expira após oito horas. Reiniciar o processo correspondente após alterar o ambiente; o Vite também precisa ser reiniciado quando a URL da API mudar.

Para o banco, criar a pasta local `.secrets.local` na raiz e dois arquivos de texto UTF-8 sem BOM: `mysql-root-password` e `mysql-app-password`, cada um com uma senha local forte distinta. Criar também `mysql-root-client.cnf` na mesma pasta para as ferramentas administrativas internas:

```ini
[client]
user=root
password=mesma_senha_local_de_mysql-root-password
```

Esses arquivos são ignorados pelo Git e montados pelo Compose como secrets. Usar em `DB_PASS` a mesma senha de `mysql-app-password`. Não publicar os arquivos ou exibir a configuração resolvida com segredos. Alterar os arquivos depois da primeira inicialização não redefine as contas já gravadas no volume. Na instalação migrada, esses arquivos já foram preparados; preservá-los.

Sem `VITE_API_URL`, o cliente utiliza `http://localhost:3001/api`. Uma variável configurada continua tendo prioridade. Isso evita requisições de login para a origem do frontend quando a variável estiver ausente; não determina a causa da falha de carregamento observada na cópia antiga.

## 3. Preparar um banco novo

1. Confirmar `docker version` e `docker compose version`; o mecanismo Linux precisa responder. Verificar se `3309` está livre, sem parar serviços de outros projetos.
2. Na raiz, executar `docker compose config --quiet` e `docker compose up -d --wait`. O Compose cria o banco vazio `giramesa`, a conta `giramesa_app` e o volume `giramesa_dados_mysql`. Node/Vite permanecem locais. Conferir `docker compose ps`.
3. Copiar o SQL: `docker compose cp docs/banco/instalacao-inicial.sql db:/tmp/instalacao-inicial.sql`.
4. Abrir o cliente: `docker compose exec db mysql --default-character-set=utf8mb4 -u giramesa_app -p giramesa`. Digitar a senha somente no prompt do cliente e executar `source /tmp/instalacao-inicial.sql;`. Sair com `exit`.

O SQL define `utf8mb4_unicode_ci` nas tabelas. O banco do Compose é criado somente na primeira inicialização do volume; confirmar que está vazio antes da importação. O roteiro acima é para instalação nova. Para dados existentes, seguir a migração e o retorno abaixo, sem aplicar o SQL inicial sobre as tabelas migradas.

O SQL contém a base de sete tabelas de domínio, relacionamentos, três contas fictícias, seis mesas disponíveis e quatro categorias iniciais. Após a importação, executar npm run db:migrate em backend/: a migração adiciona o nome vendido no item, checks, índice do dashboard e a tabela técnica schema_migrations. Não contém registros exportados do banco de desenvolvimento. Produtos, pedidos e pagamentos são preparados pelos scripts da etapa seguinte.

O arquivo é exclusivo para instalação inicial: não deve ser importado no banco de desenvolvimento existente nem reutilizado como migration. Não remove tabelas ou atualiza contas; uma segunda importação encontra tabelas já existentes e deve ser interrompida. Se a primeira importação falhar, verificar o erro e utilizar um banco novo e vazio para repetir. A API apenas verifica a conexão; ela não cria ou migra tabelas automaticamente. As migrations são executadas explicitamente antes da API e dos seeds.

## 4. Preparar o cardápio e o histórico de demonstração

Com o MySQL ligado, executar a partir da raiz:

```sh
cd backend
npm run db:migrate
npm run seed
npm run seed:demo
```

`seed` cadastra oito produtos nas categorias iniciais. `seed:demo` adiciona categorias e produtos identificados como demonstração, uma mesa dedicada e 21 pedidos finalizados distribuídos nos últimos sete dias, com itens e pagamentos. Reexecutar na mesma data não duplica registros; em dias seguintes, apenas datas ausentes da janela são completadas. Esses scripts se conectam diretamente ao banco e não exigem que o Express esteja em execução.

Detalhes e valores esperados em [Dados de demonstração](banco/seed-demo.md).

## 5. Iniciar backend e frontend

Manter o Docker Desktop e o banco ligados (`docker compose up -d --wait`) e usar **dois terminais simultâneos**.

Terminal 1, na raiz do projeto:

```sh
cd backend
npm run dev
```

Confirmar `Conexao com MySQL estabelecida.` e o servidor na porta `3001`. Para conferir a API, abrir `http://localhost:3001/` e esperar `{"status":"GiraMesa API rodando"}`.

Terminal 2, na raiz:

```sh
npm run dev
```

Abrir `http://localhost:5173` e navegar pelos menus após o login. A API usa a porta 3001 para evitar conflito com outros projetos na porta 3000. Se alguma porta for alterada, manter `PORT`, `VITE_API_URL` e a URL aberta no navegador consistentes com os processos em execução.

## Contas fictícias de demonstração

| Perfil | E-mail | Senha pública de demonstração |
|---|---|---|
| Administrador | `admin@giramesa.com` | `123456` |
| Caixa | `caixa@giramesa.com` | `123456` |
| Garçom | `garcom@giramesa.com` | `123456` |

Essas contas são criadas pelo SQL inicial com hash bcrypt. A senha é um dado público e fictício para uso local de demonstração. O acesso ao MySQL e a chave JWT são configurados separadamente nos arquivos de ambiente locais.

O script `npm run seed:senhas`, executado em `backend/`, redefine a senha de **todas as contas do banco selecionado** para `123456`. Ele não é necessário após a importação inicial e só deve ser utilizado em um banco dedicado à demonstração, quando essa redefinição for intencional. Não cria usuários ou tabelas.

## Scripts disponíveis

Na raiz:

| Comando | Finalidade |
|---|---|
| `npm run dev` | Iniciar o Vite para desenvolvimento |
| `npm run build` | Gerar os arquivos de produção em `dist/` |
| `npm run preview` | Servir localmente o build gerado; a API continua separada |
| `npm run lint` | Executar os dois linters com correção automática |
| `npm run lint:oxlint` | Executar oxlint com `--fix` |
| `npm run lint:eslint` | Executar ESLint com `--fix` e cache |
| `npm run format` | Formatar os arquivos de `src/` com Prettier |

Em `backend/`:

| Comando | Finalidade |
|---|---|
| `npm run dev` | Iniciar a API com nodemon |
| `npm run seed` | Cadastrar os produtos iniciais; exige categorias existentes |
| `npm run seed:demo` | Preparar o histórico financeiro fictício sem duplicação por data |
| `npm run seed:senhas` | Redefinir todas as senhas do banco selecionado para o valor de demonstração |
| `npm test` | Executar a suíte em container MySQL e API descartáveis próprios |
| `npm run db:migrate` | Aplicar migrations pendentes; conferir checksum das já aplicadas |
| `npm run db:backup -- caminho.sql` | Exportar estrutura e dados para arquivo novo fora do repositório |

Para verificar o frontend com o ESLint existente sem modificar arquivos, executar `./node_modules/.bin/eslint src` na raiz.

## Testes repetíveis dos fluxos críticos

Com o Docker Desktop operacional, executar em backend/:

```sh
npm test
```

A suíte cria um container MySQL 8.4.13 com porta local livre, banco/usuário e credenciais temporários. A API de teste também usa porta livre e chave JWT própria. Os registros são fixtures novas, sem alterar contas ou dados de seed do ambiente principal. Não há pastas do Windows montadas nesse container nem acesso ao secret administrativo do Compose. A primeira execução precisa da imagem disponível localmente ou de conexão para baixá-la.

A suíte cobre fluxo financeiro, autenticação/perfis, concorrência, rollback, migrations, snapshot, integridade, backup/restauração e proteções HTTP. O resumo sai no terminal; falha de teste ou limpeza retorna código de erro. Última execução e aceite manual ficam separados em [TESTES](TESTES.md).

O encerramento remove apenas a API e o container identificados como pertencentes à execução, incluindo seu volume anônimo. Em encerramento abrupto, conferir o nome exclusivo informado no início e o label giramesa.teste antes de qualquer limpeza; não remover recursos por prefixo indiscriminadamente. Os volumes dos projetos GiraMesa e EstoqueFacil não são usados pela suíte.

## Conferência e problemas de execução

- **API não inicia:** confirmar MySQL ligado, nome do banco, tabelas importadas e configuração local do backend. Executar o comando dentro de `backend/` para carregar o ambiente correto.
- **Falha de conexão no login:** confirmar os dois terminais ativos e `VITE_API_URL=http://localhost:3001/api`. A porta 3000 pode responder por outro projeto.
- **Credenciais inválidas:** confirmar a conta no banco selecionado e a importação dos dados iniciais. Reentrar após a expiração do token.
- **Dashboard vazio:** executar `seed:demo` no banco da API e clicar Atualizar como administrador. Garçom e caixa não têm acesso ao dashboard.
- **Carrinho perdido após recarregar:** o carrinho é local ao Pinia; navegar pela interface durante o atendimento. A sessão de autenticação é restaurada do `localStorage`.
- **Falha de rede:** com a API desligada, as telas devem informar o erro. Reiniciar o backend e usar a ação de nova tentativa da tela.

## Migração, persistência e retorno

- Trabalhar na cópia ativa indicada em STATUS, fora do XAMPP. Não excluir a instalação anterior ou seus arquivos privados como parte da limpeza do repositório.
- Preservar backup lógico externo antes de migrations ou troca de destino. Volume persistente não substitui backup; não usar cópia física de uma instância ativa como prova de recuperação.
- Restaurar em banco novo, conferir estrutura, conteúdo, totais e permissões e executar as migrations antes de iniciar a aplicação. Não importar tabelas internas mysql.* entre produtos nem substituir contas do servidor.
- DB_NAME deve corresponder ao banco validado. Evitar atendimento simultâneo em duas instalações; reconciliar quaisquer escritas posteriores ao backup antes de uma troca ou retorno.
- Para reiniciar apenas o banco do projeto, usar docker compose restart db. docker compose down seguido de docker compose up -d --wait preserva o volume nomeado; não usar down -v ou limpeza global de volumes.
- Após mudar a configuração, iniciar API/Vite em terminais novos, conferir a URL de login no navegador e repetir o roteiro aplicável de TESTES. O cliente tem URL local padrão quando VITE_API_URL está ausente.
- Preservar serviços de outros projetos. A antiga porta 3308 pertence ao EstoqueFacil; não usar configurações antigas sem identificar novamente a instância. Para voltar a uma instalação anterior, preservar as escritas novas e confirmar compatibilidade antes de alterar o destino.

### Recuperar o destino sem remover o volume anterior

Parar apenas API/Vite do GiraMesa e preservar quaisquer escritas novas antes da recuperação. Os backups mais recentes do banco da API ficam em C:/Backups/GiraMesa/20261104. O script db:backup exporta um banco, sem criar contas ou selecionar outro destino no arquivo SQL.

Para restaurar em outro projeto/volume, com os mesmos secrets locais:

```sh
docker compose stop db
docker compose -p giramesa-recuperacao up -d --wait
docker compose -p giramesa-recuperacao cp C:/Backups/GiraMesa/20261104/giramesa-apos-bloco14.sql db:/tmp/recuperacao.sql
docker compose -p giramesa-recuperacao exec db mysql --default-character-set=utf8mb4 -u giramesa_app -p giramesa
```

Digitar a senha apenas no prompt do cliente. Confirmar que o banco giramesa do projeto de recuperação está **vazio** e executar source /tmp/recuperacao.sql;. Ajustar DB_NAME para esse novo destino, executar npm run db:migrate e conferir conteúdo/totais antes de reiniciar API/Vite. Se forem necessárias escritas posteriores ao backup, reconciliá-las antes de voltar ao uso.

Enquanto a recuperação estiver ativa, usar -p giramesa-recuperacao nos comandos de banco; ambos publicam 3309, então não devem iniciar simultaneamente. O volume anterior permanece preservado. A suíte aprovou a restauração integral de backup em banco novo; este roteiro de projeto Compose alternativo não foi executado. Retorno ao MariaDB antigo exige reidentificar a instância, pois 3308 pertence ao EstoqueFacil.

## Documentação e validação

- [Índice técnico e materiais da entrega](README.md)
- [Estado atual](STATUS.md) e [plano de construção](plano-construcao.md)
- [Contrato do dashboard](api/dashboard.md)
- [Pedidos e pagamentos](api/pedidos.md), [proteções e validações](api/seguranca-validacoes.md)
- [Migrations e backup](banco/migracoes.md)
- [Roteiros e resultados atuais de testes, incluindo a instalação inicial](TESTES.md)

O projeto é um entregável acadêmico. A documentação registra somente implementações, verificações executadas e limitações identificadas; resultados de scripts e validações manuais são apresentados separadamente.
