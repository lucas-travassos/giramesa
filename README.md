# GiraMesa

Sistema web de gerenciamento de mesas, pedidos e pagamentos para restaurantes. O atendimento prioriza o uso mobile pelo garçom; caixa e administração também podem ser utilizados no desktop.

## Perfis e fluxo de atendimento

| Perfil | Ações |
|---|---|
| Garçom | Consultar o salão, selecionar produtos e enviar pedidos |
| Caixa | Ações do garçom, fechamento, pagamentos e reabertura antes do primeiro pagamento |
| Administrador | Atendimento completo, cadastros e dashboard financeiro |

O pedido é criado ao enviar o carrinho. O fechamento leva a mesa ao caixa; a quitação finaliza o pedido e libera a mesa. O dashboard considera pedidos finalizados pela data de fechamento no dia de São Paulo.

## Tecnologias e requisitos

- Frontend: Vue 3, Pinia, Vue Router, Bootstrap 5, Bootstrap Icons, Chart.js, vue-chartjs e axios `1.20.0`.
- Backend: Node.js, Express, Sequelize, MySQL, JWT, bcrypt, cors e dotenv `16.4.5`.
- Node.js compatível com `^22.18.0 || >=24.12.0`, conforme `package.json`, e npm.
- MySQL disponibilizado pelo XAMPP, com tabelas InnoDB. Para utilizar o phpMyAdmin, iniciar também o Apache do XAMPP.
- Git e Git Bash no Windows. Os comandos deste README seguem a sintaxe do Git Bash.

No PowerShell, utilizar `npm.cmd` no lugar de `npm` em todos os comandos abaixo: por exemplo, `npm.cmd ci`, `npm.cmd run seed:demo` e `npm.cmd run dev`. Isso evita o bloqueio do lançador `npm.ps1` pela política de scripts. Usar `Copy-Item .env.example .env` e `Copy-Item backend/.env.example backend/.env` para as cópias da etapa 2, somente em uma instalação nova.

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
DB_HOST=localhost
DB_PORT=3306
DB_NAME=giramesa
DB_USER=usuario_do_banco
DB_PASS=senha_do_banco
JWT_SECRET=substitua_por_uma_chave_aleatoria_local
```

Para gerar uma chave JWT local, executar e copiar o resultado somente para `JWT_SECRET`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

O token expira após oito horas. Reiniciar o processo correspondente após alterar o ambiente; o Vite também precisa ser reiniciado quando a URL da API mudar.

## 3. Preparar um banco novo

1. Iniciar o MySQL e o Apache pelo XAMPP e abrir o phpMyAdmin.
2. Criar um banco **novo e vazio**, por exemplo `giramesa`, com codificação `utf8mb4` e collation `utf8mb4_unicode_ci`. Usar esse nome em `DB_NAME`.
3. Selecionar o banco criado e importar [docs/banco/instalacao-inicial.sql](docs/banco/instalacao-inicial.sql).

O SQL contém as sete tabelas compatíveis com os models, relacionamentos, três contas fictícias, seis mesas disponíveis e quatro categorias iniciais. Não contém registros exportados do banco de desenvolvimento. Produtos, pedidos e pagamentos são preparados pelos scripts da etapa seguinte.

O arquivo é exclusivo para instalação inicial: não deve ser importado no banco de desenvolvimento existente nem reutilizado como migration. Não remove tabelas ou atualiza contas; uma segunda importação encontra tabelas já existentes e deve ser interrompida. Se a primeira importação falhar, verificar o erro e utilizar um banco novo e vazio para repetir. A API apenas verifica a conexão; ela não cria as tabelas automaticamente.

## 4. Preparar o cardápio e o histórico de demonstração

Com o MySQL ligado, executar a partir da raiz:

```sh
cd backend
npm run seed
npm run seed:demo
```

`seed` cadastra oito produtos nas categorias iniciais. `seed:demo` adiciona categorias e produtos identificados como demonstração, uma mesa dedicada e 21 pedidos finalizados distribuídos nos últimos sete dias, com itens e pagamentos. Reexecutar na mesma data não duplica registros; em dias seguintes, apenas datas ausentes da janela são completadas. Esses scripts se conectam diretamente ao banco e não exigem que o Express esteja em execução.

Detalhes e valores esperados em [Dados de demonstração](docs/banco/seed-demo.md).

## 5. Iniciar backend e frontend

Manter o MySQL ligado e usar **dois terminais simultâneos**.

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
| `npm test` | Placeholder existente: informa ausência de testes e retorna erro |

Para verificar o frontend com o ESLint existente sem modificar arquivos, executar `./node_modules/.bin/eslint src` na raiz.

## Conferência e problemas de execução

- **API não inicia:** confirmar MySQL ligado, nome do banco, tabelas importadas e configuração local do backend. Executar o comando dentro de `backend/` para carregar o ambiente correto.
- **Falha de conexão no login:** confirmar os dois terminais ativos e `VITE_API_URL=http://localhost:3001/api`. A porta 3000 pode responder por outro projeto.
- **Credenciais inválidas:** confirmar a conta no banco selecionado e a importação dos dados iniciais. Reentrar após a expiração do token.
- **Dashboard vazio:** executar `seed:demo` no banco da API e clicar Atualizar como administrador. Garçom e caixa não têm acesso ao dashboard.
- **Carrinho perdido após recarregar:** o carrinho é local ao Pinia; navegar pela interface durante o atendimento. A sessão de autenticação é restaurada do `localStorage`.
- **Falha de rede:** com a API desligada, as telas devem informar o erro. Reiniciar o backend e usar a ação de nova tentativa da tela.

Na cópia de validação do 12.3, o Vite não carregou a URL do arquivo de ambiente; a causa permanece sem diagnóstico conclusivo. O fluxo funcional foi aprovado usando a configuração temporária abaixo no PowerShell, a partir da raiz. Ela vale somente para essa sessão; a configuração persistente será resolvida no checkpoint 12.4. Não foi comprovada uma instalação totalmente reproduzível neste ambiente.

```powershell
$env:VITE_API_URL = "http://localhost:3001/api"
npm.cmd run dev
```

## Documentação e validação

- [Índice técnico e materiais da entrega](docs/README.md)
- [Estado atual](docs/STATUS.md) e [plano de construção](docs/plano-construcao.md)
- [Contrato do dashboard](docs/api/dashboard.md)
- [Roteiros e resultados atuais de testes, incluindo a instalação inicial](docs/TESTES.md)

O projeto é um entregável acadêmico. A documentação registra somente implementações, verificações executadas e limitações identificadas; resultados de scripts e validações manuais são apresentados separadamente.
