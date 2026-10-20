# Ajuste da porta da API — GiraMesa

## Problema e decisão

A porta 3000 estava publicada pelo container Docker `estoque-api`. O front enviava o login para esse outro projeto e o navegador bloqueava a requisição por CORS. A API do GiraMesa passou a usar a porta 3001, preservando o serviço de estoque na porta 3000.

## Alterações

- `backend/server.js`: porta padrão 3001, mantendo configuração por `PORT`.
- `.env.example`: URL de exemplo do front atualizada para `http://localhost:3001/api`.
- `backend/.env.example`: exemplo das variáveis de porta, banco e JWT, sem credenciais reais.
- Configuração local: alteradas somente as linhas `PORT` do backend e `VITE_API_URL` do front, sem exibir os arquivos `.env`.
- `AGENTS.md`: referências de porta atualizadas.

O front continua em `http://localhost:5173`. Não houve instalação de dependências ou alteração das regras de autenticação.

## Verificações executadas

- API na porta 3001 respondeu `{"status":"GiraMesa API rodando"}`.
- Preflight `OPTIONS /api/auth/login`, com origem `http://localhost:5173`, respondeu 204 e cabeçalho `Access-Control-Allow-Origin: *`.
- Login da conta de teste administrador retornou token; o token não foi exibido ou registrado.
- Módulo servido pelo Vite confirmou uso da URL `http://localhost:3001/api`.

## Roteiro de validação manual

1. Abrir `http://localhost:5173` e recarregar a página.
2. Entrar com `admin@giramesa.com`; confirmar acesso ao salão.
3. Sair e repetir com `caixa@giramesa.com` e `garcom@giramesa.com`.
4. Confirmar que o administrador acessa cadastros/dashboard e que caixa e garçom veem somente as opções permitidas.
5. Sair e tentar senha incorreta: confirmar mensagem de credenciais inválidas.
6. No terminal do backend, interromper com Ctrl+C e tentar entrar: confirmar mensagem de falha de conexão.
7. Reiniciar o backend com `cd /c/xampp/htdocs/giramesa/backend && npm run dev`, confirmar conexão com MySQL e porta 3001 e repetir o login.

No encerramento deste ajuste, a validação pelo navegador e pelos demais perfis permanecia pendente e o dashboard ainda utilizava dados fictícios. A integração do dashboard e a validação dos três perfis foram registradas posteriormente no checkpoint 11.8.

## Commits

- `eb36408` — ajuste da porta padrão da API para 3001.
- `192519f` — atualização da URL da API no exemplo de ambiente do frontend.
