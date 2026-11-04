# STATUS — GiraMesa

> Atualizado em 04/11/2026. Estado atual em STATUS; evidências em TESTES; histórico no Git/PRs.

## Repositório e ambiente

- Usar somente C:/Projetos/giramesa, branch develop. Ambiente/backend em d37f35f e frontend em 15205f3, ambos publicados; fechamento documental nesta entrega. Na árvore antiga C:/xampp/htdocs/giramesa somente STATUS encaminha a retomada.
- Conferência remota de 04/11: PR #2 integrado em 29/10; main em b29434b. A nova entrega segue em develop; não fazer merge automático. PRs curtos, com problema, mudança e validação relevante.
- MySQL 8.4.13 em Compose giramesa, 127.0.0.1:3309, volume giramesa_dados_mysql. Node/Vite locais em 3001/5173; acesso http://localhost:5173. API principal usa giramesa_validacao_manual_20261028. Docker Desktop 4.97.0; Node 24.19.0/npm 11.17.0.
- EstoqueFacil (estoque-api/3000 e estoque-db/3308) e MySQL80/3307 preservados. Não presumir MariaDB de recuperação na antiga porta 3308. Não desinstalar XAMPP.

## Bloco 14 — concluído e validado

- Todo o roteiro conjunto do bloco 14 foi aprovado manualmente em 04/11; o plano marca 14.0–14.8 concluídos. IDs dos novos registros manuais não foram informados. 12.4 e quatro passos financeiros de 14.0 tiveram aceite manual em 29/10. Os itens restantes foram agrupados: erros JSON, Helmet/rate limit/CORS, schemas nativos, snapshot do nome, integridade/migrations e services de pedidos/usuários. As bibliotecas novas autorizadas são helmet 8.3.0 e express-rate-limit 8.7.2; não há sequelize-cli ou biblioteca de schemas.
- Regras financeiras permanecem em centavos, com transações READ COMMITTED e bloqueios mesa -> pedido. pedidoService concentra atendimento/fechamento; usuarioService serializa alterações e protege o último administrador. O JWT identifica a conta; perfil e situação atuais são conferidos no banco a cada requisição.
- Nome vendido em itens_pedido.nome_produto; consumo e checkout priorizam esse campo. A API mantém nome/categoria do produto vendido travados. Dados anteriores receberam o nome disponível no cadastro, sem reconstrução de histórico ausente.
- npm run db:migrate aplica migrations explícitas, com advisory lock, checksum e retomada idempotente; não há sync ou alteração automática pela API. A migration 001 adiciona snapshot, checks positivos/não negativos e índice pedidos(status,data_fechamento). São sete tabelas de domínio mais schema_migrations.
- A migração foi aplicada ao banco da API em 04/11 após backup. Campos anteriores das sete tabelas permaneceram iguais por SHA-256; 23 pedidos, 32 pagamentos, consumo/pagamentos R$ 1.262,30. Repetição sem alterações e nenhum nome de item ausente. Esses valores antecedem o próximo aceite manual.
- npm test usa container mysql:8.4.13, volume anônimo, credenciais, banco/usuário e API próprios, em portas livres. Não usa o secret administrativo nem os volumes do banco principal. Verifica identidade antes da limpeza e assinatura da API antes de escrever. Testes destrutivos usam apenas fixtures novas.
- Em 04/11, 20 grupos aprovados: finanças, autenticação/perfis, concorrência/rollback, snapshot, schemas, headers/CORS/429, revogação de permissões, último administrador, migrations/checksum, seed repetido e backup/restauração. Build, ESLint sem --fix, sintaxe JS e diff --check aprovados. Evidências atuais e roteiro único em TESTES.
- Atualizações compatíveis de dependências existentes removeram os alertas alto/crítico; audit atual mantém dois apontamentos moderados do uuid transitivo via Sequelize, risco já aceito. Não houve audit fix --force ou downgrade do Sequelize.

## Preservação e recuperação

- Backups antes/depois da migration e manifesto privado: C:/Backups/GiraMesa/20261104. giramesa-antes-bloco14.sql (26.502 bytes), SHA-256 eb63d68455beb034aefffd159ce93ce9883423a064ef055af986354f623322fd. giramesa-apos-bloco14.sql (29.107 bytes), SHA-256 8112aa298302a7f5e69bc9c613648aea0b75bbcf3614af28fb986245ec73ac96. Não publicar dados ou configurações privadas.
- npm run db:backup -- caminho.sql exporta estrutura e dados para arquivo novo fora do repositório, usando a conexão da aplicação. A suíte aprovou restauração em outro banco com conteúdo idêntico. Procedimentos em docs/banco/migracoes.md e README; recuperação por projeto Compose alternativo não foi executada.
- Backups/cópias anteriores continuam em C:/Backups/GiraMesa/20261028. A migração 12.4 foi comparada com dump/conferência externa, sem revalidar a antiga origem online depois que 3308 passou ao EstoqueFacil. Cópia física antiga teve ibdata1/ib_logfile0 divergentes; usar dump lógico. Diferença preexistente do banco giramesa (R$ 2.615,00 versus R$ 2.597,00) não foi corrigida automaticamente.
- Houve travamento intermitente nos arquivos montados do Docker, recuperado por reinício autorizado. A suíte foi isolada em container sem mounts do Windows para dispensar reinícios compartilhados nas verificações. A causa do travamento não foi comprovada; não usar reset de fábrica ou remoção de volumes como atalho.

## Próximo passo e limites

- Aceite conjunto registrado em TESTES: cadastros, preservação do consumo após reajuste, quitação/dashboard e inativação de usuário novo com sessão aberta aprovados em 04/11. Resultados automatizados permanecem separados dos manuais.
- Publicação de 12.4/bloco 14 organizada em backend/ambiente, frontend e documentação. Próxima etapa: Fase B de UX/UI, priorizando formulários e fluxo mobile. Não abrir PR ou integrar main automaticamente.
- Resultados automatizados não equivalem a validação visual, teste de carga ou queda do MySQL. A falha concorrente do código antigo não foi reproduzida. Instalação com npm ci em outra máquina não comprovada. Migrations DDL não têm rollback automático; não editar arquivo já aplicado.
- Sistema e documentação até 20/11/2026; apresentação em 24/11/2026. Depois do bloco 14, priorizar 13.3/13.4 e documentação acadêmica/API/figuras/roteiro do plano. Não criar relatórios por checkpoint.
