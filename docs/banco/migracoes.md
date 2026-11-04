# Evolução e backup do banco

O SQL inicial cria a base de sete tabelas de domínio. Depois da importação, executar em `backend/`:

```sh
npm run db:migrate
```

O comando usa a conexão configurada para a aplicação. A API não executa `sync` nem altera o schema automaticamente. Antes de aplicar em banco existente, parar as escritas do GiraMesa e gerar backup fora do repositório:

```sh
npm run db:backup -- C:/Backups/GiraMesa/backup-antes-da-migracao.sql
npm run db:migrate
```

O diretório de destino deve existir. O backup recusa arquivos dentro do repositório e não sobrescreve um arquivo existente. Ele usa uma transação de leitura `REPEATABLE READ`, exporta estrutura e registros e inclui `schema_migrations` quando presente. Um arquivo parcial após erro não comprova recuperação; preservar a origem até validar a restauração.

## Controle de execução

`schema_migrations` guarda `nome`, `checksum` SHA-256 e `aplicada_em`. Um advisory lock por banco impede duas execuções simultâneas do migrador. A mesma conexão mantém esse lock durante os comandos DDL.

Migrations aplicadas não são alteradas: checksum divergente interrompe a execução. Para evoluir o schema, criar outro arquivo e adicioná-lo à lista em `src/migrations/index.js`. O MySQL faz commit implícito em DDL; não há rollback automático do conjunto. A migração atual verifica o que já existe para permitir retomada após falha parcial. O registro só é gravado ao concluir todas as etapas.

## Migração 001

- Verifica quantidades/preços/pagamentos positivos e totais não negativos antes de alterar as tabelas. Dados incompatíveis bloqueiam a aplicação; não são corrigidos silenciosamente.
- Acrescenta `itens_pedido.nome_produto VARCHAR(100) NOT NULL`. Registros anteriores recebem o nome disponível no cadastro atual; não é possível reconstruir nomes históricos ausentes. Novos itens gravam o nome durante a venda.
- Cria `ix_pedidos_status_fechamento (status, data_fechamento)`, correspondente ao filtro de pedidos finalizados e intervalo do dashboard. Os índices de FKs existentes são mantidos; não houve medição de ganho de desempenho.
- Cria checks: `pedidos.valor_total >= 0`, `pagamentos.valor > 0`, `itens_pedido.quantidade > 0`, `itens_pedido.preco_unitario > 0` e `produtos.preco > 0`.

O banco passa a ter sete tabelas de domínio e uma tabela técnica. As regras que exigem consultar outros registros, como saldo e último administrador ativo, continuam nos services e nas transações da aplicação.

## Restauração

Restaurar o backup somente em banco **novo e vazio**, selecionado no cliente MySQL. O arquivo não contém criação de contas nem troca automática de banco; executar `source caminho-do-backup.sql;`. Confirmar que o destino selecionado é o novo banco antes desse comando.

Configurar a aplicação para o destino restaurado, executar `npm run db:migrate` e conferir conteúdo e totais antes do uso. Se a versão anterior da aplicação precisar voltar, preservar o banco atual e as escritas novas; não remover colunas ou checks para tentar um downgrade automático. O roteiro de recuperação por outro volume do Compose está no README.

## Evidências atuais

Em 04/11/2026, a suíte descartável aprovou preflight com dados incompatíveis, backfill, repetição, recusa de checksum alterado e restauração integral de backup em outro banco. A migração no banco da API preservou os campos anteriores das sete tabelas por SHA-256, com 23 pedidos e R$ 1.262,30 em consumo e pagamentos. Backups privados antes/depois e manifesto estão em `C:/Backups/GiraMesa/20261104`. A última execução detalhada fica em [TESTES](../TESTES.md).
