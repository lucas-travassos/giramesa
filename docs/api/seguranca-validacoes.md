# Proteções e validações da API

## Autenticação e acesso

JWT identifica a conta e expira em oito horas. Em cada requisição autenticada, a API confere o usuário no banco e usa seu perfil atual. Conta inativa/inexistente retorna 401; mudança de perfil passa a valer na próxima requisição. Menus de uma sessão já aberta podem exigir nova entrada para refletir a mudança visualmente; a API já recusa as ações não permitidas.

Alterações de usuários bloqueiam os administradores na mesma ordem dentro de uma transação. Duas tentativas simultâneas de retirar os últimos administradores não podem deixar o sistema sem um administrador ativo.

## Helmet, CORS e login

- Helmet `8.3.0` acrescenta headers de segurança e remove `X-Powered-By`. HSTS e upgrade automático de HTTP foram desativados para o ambiente local HTTP; publicação HTTPS exige revisão própria.
- `CORS_ORIGINS` recebe origens exatas separadas por vírgula. O padrão permite `http://localhost:5173` e `http://127.0.0.1:5173`. Origem não autorizada retorna 403 em JSON. Clientes sem `Origin` continuam sujeitos a JWT e permissões; CORS não substitui autenticação.
- express-rate-limit `8.7.2` limita tentativas de login por IP. O padrão é dez tentativas malsucedidas em quinze minutos; sucessos são descontados. Excesso retorna 429 com JSON e `Retry-After`.
- `LOGIN_MAX_TENTATIVAS` e `LOGIN_JANELA_MS` aceitam inteiros positivos. O armazenamento é em memória e reinicia com o processo, adequado à API local única. O projeto não configura confiança em proxies.

## Schemas nativos

Validadores compartilhados conferem objetos JSON, IDs positivos, nomes não vazios, tamanhos dos campos, e-mail, enums e dinheiro com até duas casas. Cadastros de senha seguem o mínimo de seis caracteres já exigido pela interface e o limite de 72 bytes do bcrypt. Na edição de usuário, senha vazia mantém a anterior. A descrição de produto continua opcional.

Controllers cuidam de HTTP e validação; `pedidoService` concentra transações e regras financeiras. `usuarioService` protege as alterações de contas. Cadastros simples permanecem nos controllers para evitar camadas que apenas repassem chamadas.

## Erros

Os erros passam pelo middleware comum e usam `{ "erro": "mensagem" }`: 400 para dados/JSON inválidos, 401 para autenticação, 403 para acesso, 404 para recurso/rota inexistente, 409 para conflitos, 413 para corpo maior que 16 KB, 429 para limite de login e 500 para falha interna. SQL, stack e credenciais não são enviados ao cliente.

## Validação e limites

A suíte de 04/11 aprovou headers, CORS, JSON inválido/excedente, recuperação do limite de login, cadastros, histórico, mudança de perfil/inativação com token existente e concorrência do último administrador. As verificações foram feitas com registros próprios em container descartável; o roteiro visual conjunto também foi aprovado em 04/11, com resultados registrados em [TESTES](../TESTES.md).

As atualizações compatíveis das dependências existentes removeram os alertas alto/crítico reportados durante esta etapa. Permanecem os dois apontamentos moderados do mesmo `uuid` transitivo via Sequelize, risco já registrado no projeto; não foi feito downgrade do Sequelize nem `audit fix --force`.

Referências técnicas consultadas: [Helmet](https://helmet.js.org/) e [express-rate-limit](https://express-rate-limit.mintlify.app/reference/configuration).
