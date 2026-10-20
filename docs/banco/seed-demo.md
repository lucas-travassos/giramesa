# Dados de demonstração do GiraMesa

## Execução

Com o MySQL do XAMPP ligado, executar em `backend/`:

```sh
npm run seed:demo
```

O comando usa a configuração local do backend e se conecta diretamente ao MySQL. A API Express não precisa estar em execução para gerar os dados; para visualizar o dashboard, iniciar backend e frontend normalmente e acessar Dashboard pelo menu do administrador.

Pré-requisitos: tabelas existentes com suporte a transações (InnoDB) e usuário `garcom@giramesa.com` ativo, com perfil `garcom`. A seed não cria usuários, redefine senhas ou executa sincronização de schema.

## Conteúdo gerado

Na primeira execução, são criados:

- Uma mesa com o próximo número disponível, mantendo status `disponivel`.
- Três categorias: `Demo - Pratos`, `Demo - Bebidas` e `Demo - Sobremesas`.
- Três produtos identificados como demonstração: refeição de R$ 25,00, suco de R$ 8,00 e sobremesa de R$ 12,00.
- Três pedidos finalizados por dia nos últimos sete dias de São Paulo, incluindo o dia da execução: 21 pedidos, 49 linhas de itens e 28 pagamentos.
- As quatro formas de pagamento: dinheiro, débito, crédito e Pix. Um pedido de cada dia é dividido em duas partes; as partes somam exatamente o total em centavos.

As datas de fechamento de hoje não ultrapassam o momento da execução. As vendas dos dias anteriores recebem horários de fechamento às 12h, 15h e 18h. A abertura fica 30 minutos antes do fechamento.

Para o dia da primeira execução, os três pedidos somam R$ 148,00 e ticket médio de R$ 49,33, considerando apenas a seed. Distribuição do dia: pratos R$ 100,00, bebidas R$ 24,00 e sobremesas R$ 24,00; dinheiro R$ 33,00, débito R$ 39,00, crédito R$ 39,00 e Pix R$ 37,00. Os dados reais ou testes já existentes continuam compondo os totais do dashboard.

## Reexecução e preservação dos dados

Cada pedido recebe um identificador nas observações de seus itens, no formato `giramesa:demo:v1:AAAA-MM-DD:N`, em que N varia de 1 a 3. Categorias e produtos são identificados pelos nomes reservados com prefixo `Demo -`; a mesa é recuperada pelo histórico dos itens marcados.

Reexecutar no mesmo dia não duplica pedidos ou pagamentos. Em dias seguintes, são criados apenas os pedidos das datas ausentes na janela de sete dias. O histórico anterior é preservado e não tem datas, quantidades ou preços reescritos.

A seed não altera cadastros existentes, preços atuais, situação de mesas ou contas de usuário. Produtos e categorias de demonstração existentes são reutilizados sem atualização. A mesa criada passa a ter histórico e, pelas regras do sistema, seu número não pode ser alterado após as vendas. Os produtos de demonstração vendidos também seguem as restrições de edição aplicáveis ao histórico.

Os preços dos itens gerados são os valores fixos da demonstração, gravados em `preco_unitario`. Não são recalculados a partir de alterações posteriores no cadastro.

## Transação e falhas

Todos os registros de uma execução são gravados em uma transação. O bloqueio temporário da linha do usuário de demonstração serializa execuções concorrentes da seed, sem modificar a conta. Uma falha antes da confirmação reverte as inserções da execução, evitando pedidos incompletos ou mesas em fechamento.

Em caso de erro, o comando retorna código 1 e orienta a verificar conexão, tabelas e conta de demonstração. Não informa sucesso nem imprime credenciais. Registros confirmados em execuções anteriores são preservados.

## Verificações registradas

Os testes do checkpoint 12.1 cobriram totais no dashboard real, reexecução, execução concorrente, novo dia, limites de data, rollback e falha de conexão controlada. A validação manual foi aprovada conforme o roteiro do checkpoint; resultado informado pelo responsável pelo produto, sem capturas de tela anexadas. Resultados e roteiro em [12.1 — Seed de demonstração](../checkpoints/12.1-seed-demonstracao.md).
