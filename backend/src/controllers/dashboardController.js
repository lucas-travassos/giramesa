const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

async function resumir(req, res) {
  try {
    // O Sequelize grava DATE em UTC; o dia do restaurante segue Sao Paulo (UTC-3).
    const hoje = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Sao_Paulo',
    }).format(new Date());
    const inicioDia = new Date(`${hoje}T00:00:00-03:00`);
    const fimDia = new Date(inicioDia.getTime() + 86400000);
    const inicioSemana = new Date(inicioDia.getTime() - 6 * 86400000);
    const paraSql = (data) => data.toISOString().slice(0, 19).replace('T', ' ');
    const opcoes = {
      type: QueryTypes.SELECT,
      replacements: {
        inicioDia: paraSql(inicioDia),
        fimDia: paraSql(fimDia),
        inicioSemana: paraSql(inicioSemana),
      },
    };

    // Agregacoes separadas impedem multiplicar itens pelos pagamentos do pedido.
    const [dias, categorias, pagamentos] = await Promise.all([
      sequelize.query(`
        SELECT DATE_FORMAT(CONVERT_TZ(data_fechamento, '+00:00', '-03:00'), '%Y-%m-%d') AS dia,
               COUNT(*) AS total_pedidos, SUM(valor_total) AS faturamento
        FROM pedidos
        WHERE status = 'finalizado'
          AND data_fechamento >= :inicioSemana AND data_fechamento < :fimDia
        GROUP BY dia ORDER BY dia
      `, opcoes),
      sequelize.query(`
        SELECT c.categoria_id, c.nome AS categoria,
               SUM(i.quantidade * i.preco_unitario) AS valor
        FROM itens_pedido i
        JOIN pedidos p ON p.pedido_id = i.pedido_id
        JOIN produtos pr ON pr.produto_id = i.produto_id
        JOIN categorias c ON c.categoria_id = pr.categoria_id
        WHERE p.status = 'finalizado'
          AND p.data_fechamento >= :inicioDia AND p.data_fechamento < :fimDia
        GROUP BY c.categoria_id, c.nome ORDER BY c.nome
      `, opcoes),
      sequelize.query(`
        SELECT pg.forma_pagamento, SUM(pg.valor) AS valor
        FROM pagamentos pg
        JOIN pedidos p ON p.pedido_id = pg.pedido_id
        WHERE p.status = 'finalizado'
          AND p.data_fechamento >= :inicioDia AND p.data_fechamento < :fimDia
        GROUP BY pg.forma_pagamento ORDER BY pg.forma_pagamento
      `, opcoes),
    ]);

    const diaAtual = dias.find((dia) => dia.dia === hoje);
    const faturamentoCentavos = Math.round(Number(diaAtual?.faturamento ?? 0) * 100);
    const faturamento = faturamentoCentavos / 100;
    const totalPedidos = Number(diaAtual?.total_pedidos ?? 0);
    const faturamentoSemana = Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(inicioSemana.getTime() + indice * 86400000)
        .toISOString().slice(0, 10);
      return { dia: data, valor: Number(dias.find((dia) => dia.dia === data)?.faturamento ?? 0) };
    });

    res.json({
      data_referencia: hoje,
      fuso_horario: 'America/Sao_Paulo',
      faturamento_dia: faturamento,
      total_pedidos: totalPedidos,
      ticket_medio: totalPedidos ? Math.round(faturamentoCentavos / totalPedidos) / 100 : 0,
      faturamento_semana: faturamentoSemana,
      vendas_por_categoria: categorias.map((categoria) => ({ ...categoria, valor: Number(categoria.valor) })),
      vendas_por_forma_pagamento: pagamentos.map((pagamento) => ({ ...pagamento, valor: Number(pagamento.valor) })),
    });
  } catch {
    res.status(500).json({ erro: 'Não foi possível carregar o dashboard.' });
  }
}

module.exports = { resumir };
