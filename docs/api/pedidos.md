# Pedidos e fechamento financeiro

Todas as rotas usam JWT em `Authorization: Bearer ...`. O prefixo é `/api/pedidos`.

| Operação | Perfis | Resultado |
|---|---|---|
| `POST /` com `mesa_id` | garçom, caixa, administrador | 201 ao criar; 200 ao retornar pedido aberto existente |
| `GET /`, `GET /:id` | garçom, caixa, administrador | 200 com pedidos/consumo |
| `POST /:id/itens` | garçom, caixa, administrador | 201; recebe `produto_id`, quantidade inteira positiva opcional e observação opcional |
| `PUT /:id/itens/:itemId` | garçom, caixa, administrador | 200; altera quantidade inteira; quantidade ausente ou não positiva remove o item |
| `DELETE /:id/itens/:itemId` | garçom, caixa, administrador | 200; remove e recalcula o consumo |
| `POST /:id/fechar` | caixa, administrador | 200; pedido aberto com consumo passa a `em_fechamento`, mesa a `caixa` |
| `POST /:id/cancelar-fechamento` | caixa, administrador | 200; reabre somente antes de qualquer pagamento, mesa a `ocupada` |
| `POST /:id/pagamentos` | caixa, administrador | 201; recebe `forma_pagamento` e `valor` |
| `GET /:id/pagamentos` | caixa, administrador | 200; pagamentos, `valor_total`, `total_pago` e `saldo_restante` |

## Valores e consistência

- Formas permitidas: `dinheiro`, `debito`, `credito`, `pix`.
- Valor de pagamento: número JSON ou texto decimal com ponto, positivo, até duas casas e no máximo R$ 999.999,99 (`DECIMAL(8,2)`). Booleanos, objetos, texto com vírgula, notação científica textual e frações de centavo são recusados. Um número JSON é validado após sua interpretação pelo JavaScript.
- Consumo, pagamentos e saldo são calculados em centavos inteiros. Um centavo acima do saldo retorna 409; um centavo pendente mantém `em_fechamento`/`caixa`. Somente saldo exatamente zero finaliza, grava `data_fechamento` e libera a mesa.
- Abertura, alterações de itens, fechamento, pagamento e reabertura usam transações. Os caminhos de pedidoService bloqueiam primeiro a mesa e depois o pedido, com isolamento `READ COMMITTED`. Uma operação que aguarda o bloqueio verifica novamente o estado e lê os pagamentos já confirmados.
- O recálculo e a alteração do item ocorrem na mesma transação. Falha em uma gravação reverte as anteriores; a resposta de sucesso só é enviada após o commit. Controllers traduzem HTTP; as regras transacionais ficam em pedidoService.
- A listagem de pagamentos usa a mesma sequência de bloqueios para retornar pagamento e saldo coerentes.
- O item grava nome_produto na inclusão; o frontend prioriza esse snapshot no consumo e no checkout. Reajustes e alterações externas posteriores no catálogo não mudam o texto preservado. A API continua bloqueando mudança de nome/categoria de produto vendido.
- A migração faz backfill do nome antigo a partir do cadastro disponível, sem reconstruir nomes históricos que não tenham sido armazenados.

Exemplo de pagamento:

```json
{"forma_pagamento":"pix","valor":"39.33"}
```

Resposta 201: `{ pedido, pagamentos, saldo_restante }`, com saldo textual em duas casas, por exemplo `"0.01"` ou `"0.00"`. O formato consumido pelo checkout foi preservado.

## Erros

Erros usam `{ "erro": "mensagem" }`: 400 para valor/forma/quantidade inválidos; 401 para autenticação; 403 para perfil; 404 para recurso inexistente; 409 para estado incompatível, excesso, ausência de consumo ou limite do total; 413 para JSON excedente; 429 para excesso de tentativas no login; 500 para falha interna, sem detalhes internos do banco.

## Verificação

`npm test`, em `backend/`, prepara container, banco e usuário exclusivos e inicia uma API em porta livre. A suíte usa `assert`, `fetch` e processos nativos do Node, além do driver MySQL já instalado. Inclui concorrência e falhas induzidas por triggers apenas no banco novo. A última execução e o roteiro manual ficam em [TESTES](../TESTES.md); a existência do script não equivale a resultado aprovado.

Proteções, schemas e atualização de permissões: [segurança e validações](seguranca-validacoes.md). Evolução do schema: [migrations](../banco/migracoes.md).
