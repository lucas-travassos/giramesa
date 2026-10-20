# Dashboard financeiro

## GET /api/dashboard

Autenticação: `Authorization: Bearer <token>`. Perfil permitido: somente `administrador`.
Sem parâmetros ou corpo. A consulta é somente de leitura.

## Critério aprovado (opção A)

- Somente pedidos com `status = finalizado`, agrupados por `data_fechamento`.
- Dia atual em `America/Sao_Paulo` (UTC-3). O Sequelize usa UTC nas colunas DATE; os limites da consulta são convertidos para UTC. O limite inicial é inclusivo e o final, meia-noite seguinte, exclusivo.
- Faturamento do dia: soma de `pedidos.valor_total`; total de pedidos: contagem de pedidos finalizados no dia; ticket médio: faturamento dividido pela contagem, arredondado em centavos. Sem pedidos, os três valores são zero.
- Série diária: últimos sete dias, incluindo hoje, em ordem crescente. Dias sem pedidos recebem zero.
- Categorias: soma de `quantidade * preco_unitario` dos itens dos pedidos finalizados hoje. Usa o preço vendido, mesmo após reajuste do produto. Não filtra produtos inativos com venda histórica.
- Formas de pagamento: soma de `pagamentos.valor` dos mesmos pedidos, agrupada por forma. A data do pagamento não define o período: pagamentos parciais anteriores entram juntos na data em que o pedido é finalizado.
- As agregações de pedidos, itens e pagamentos são separadas para evitar multiplicação de valores em joins.

## Resposta 200

Exemplo ilustrativo de contrato; não representa dados consultados do banco:

```json
{
  "data_referencia": "2026-10-19",
  "fuso_horario": "America/Sao_Paulo",
  "faturamento_dia": 70,
  "total_pedidos": 1,
  "ticket_medio": 70,
  "faturamento_semana": [
    { "dia": "2026-10-13", "valor": 0 },
    { "dia": "2026-10-14", "valor": 0 },
    { "dia": "2026-10-15", "valor": 0 },
    { "dia": "2026-10-16", "valor": 0 },
    { "dia": "2026-10-17", "valor": 0 },
    { "dia": "2026-10-18", "valor": 0 },
    { "dia": "2026-10-19", "valor": 70 }
  ],
  "vendas_por_categoria": [
    { "categoria_id": 100, "categoria": "Teste A", "valor": 60 },
    { "categoria_id": 101, "categoria": "Teste B", "valor": 10 }
  ],
  "vendas_por_forma_pagamento": [
    { "forma_pagamento": "dinheiro", "valor": 50 },
    { "forma_pagamento": "pix", "valor": 20 }
  ]
}
```

Os valores monetários são números em reais. Sem vendas no dia, as duas listas de agrupamentos são vazias; a série continua tendo sete pontos.

## Erros

| Status | Situação | Resposta |
|---|---|---|
| 401 | Token ausente | `{ "erro": "Token não fornecido." }` |
| 401 | Token inválido ou expirado | `{ "erro": "Token inválido ou expirado." }` |
| 403 | Garçom ou caixa | `{ "erro": "Você não tem permissão para acessar este recurso." }` |
| 500 | Falha na consulta | `{ "erro": "Não foi possível carregar o dashboard." }` |

## Tela

O administrador abre Dashboard pelo menu. A tela consulta a API ao entrar e no botão Atualizar. Mostra carregamento, indicadores, linha de sete dias e gráficos de categorias e pagamentos do dia. Falhas exibem mensagem e Tentar de novo, sem manter valores antigos visíveis. Valores usam formato monetário pt-BR; períodos vazios têm mensagens próprias.

## Limites da validação

Build, sintaxe, HTTP com banco simulado e store Pinia foram verificados. A integração SQL passou no MySQL real com registros novos dentro de transação revertida: múltiplos itens/pagamentos, preço vendido de produto inativo, exclusão de pedidos abertos/em fechamento, pagamentos anteriores, limites do dia e série de sete dias. Datas de virada de mês/ano e arredondamento de meio centavo também foram verificados com relógio/banco simulados. Lucas confirmou que todos os testes do roteiro pela interface passaram; essa validação foi informada pelo product owner, sem prints anexados.

O fluxo anterior de pagamento admite tolerância de um centavo, podendo gerar pequena diferença entre faturamento por consumo e soma dos pagamentos. Esse fluxo não foi alterado pelo 11.8.
