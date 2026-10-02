const { Pedido, ItemPedido, Produto, Categoria, Mesa, Usuario, Pagamento } = require('../models');

async function recalcularTotal(pedidoId) {
  const itens = await ItemPedido.findAll({ where: { pedido_id: pedidoId } });
  const total = itens.reduce((soma, item) => soma + (item.quantidade * parseFloat(item.preco_unitario)), 0);
  await Pedido.update({ valor_total: total.toFixed(2) }, { where: { pedido_id: pedidoId } });
  return total.toFixed(2);
}

async function somaPagamentos(pedidoId) {
  const pagamentos = await Pagamento.findAll({ where: { pedido_id: pedidoId } });
  return pagamentos.reduce((soma, p) => soma + parseFloat(p.valor), 0);
}

const includePedidoCompleto = [
  { model: Mesa, as: 'Mesa' },
  { model: Usuario, as: 'Usuario', attributes: ['usuario_id', 'nome'] },
  {
    model: ItemPedido,
    include: [{ model: Produto, as: 'Produto', attributes: ['produto_id', 'nome', 'preco'] }],
  },
];

async function abrirOuBuscarPedido(req, res) {
  const { mesa_id } = req.body;
  if (!mesa_id) return res.status(400).json({ erro: 'mesa_id é obrigatório.' });

  const mesa = await Mesa.findByPk(mesa_id);
  if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada.' });

  if (mesa.status === 'caixa') {
    return res.status(409).json({ erro: 'Mesa em fechamento, aguarde até ficar disponível.' });
  }

  if (mesa.status === 'inativa') {
    return res.status(409).json({ erro: 'Mesa inativa.' });
  }

  if (mesa.status === 'ocupada') {
    const pedidoAberto = await Pedido.findOne({
      where: { mesa_id, status: 'aberto' },
      include: includePedidoCompleto,
    });
    if (!pedidoAberto) {
      return res.status(409).json({ erro: 'Mesa ocupada, mas nenhum pedido aberto foi encontrado.' });
    }
    return res.json(pedidoAberto);
  }

  const usuario_id = req.usuario.usuario_id;
  const novoPedido = await Pedido.create({ mesa_id, usuario_id });
  await mesa.update({ status: 'ocupada' });

  const pedidoCompleto = await Pedido.findByPk(novoPedido.pedido_id, { include: includePedidoCompleto });
  res.status(201).json(pedidoCompleto);
}

async function buscarPorId(req, res) {
  const pedido = await Pedido.findByPk(req.params.id, { include: includePedidoCompleto });
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });
  res.json(pedido);
}

async function listar(req, res) {
  const { mesa_id, status } = req.query;
  const where = {};
  if (mesa_id) where.mesa_id = mesa_id;
  if (status) where.status = status;

  const pedidos = await Pedido.findAll({ where, include: includePedidoCompleto, order: [['data_abertura', 'DESC']] });
  res.json(pedidos);
}

async function adicionarItem(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  if (pedido.status !== 'aberto') {
    return res.status(409).json({ erro: 'Não é possível alterar um pedido que não está aberto.' });
  }

  const { produto_id, quantidade, observacao } = req.body;
  if (!produto_id) return res.status(400).json({ erro: 'produto_id é obrigatório.' });

  const produto = await Produto.findByPk(produto_id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
  if (produto.status !== 'ativo') {
    return res.status(409).json({ erro: 'Produto indisponível para venda.' });
  }

  const qtd = quantidade && quantidade > 0 ? quantidade : 1;
  const obs = observacao || null;

  const itemExistente = await ItemPedido.findOne({
    where: { pedido_id: pedido.pedido_id, produto_id, observacao: obs },
  });

  if (itemExistente) {
    await itemExistente.update({ quantidade: itemExistente.quantidade + qtd });
  } else {
    await ItemPedido.create({
      pedido_id: pedido.pedido_id,
      produto_id,
      quantidade: qtd,
      preco_unitario: produto.preco,
      observacao: obs,
    });
  }

  await recalcularTotal(pedido.pedido_id);
  const pedidoAtualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto });
  res.status(201).json(pedidoAtualizado);
}

async function atualizarItem(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  if (pedido.status !== 'aberto') {
    return res.status(409).json({ erro: 'Não é possível alterar um pedido que não está aberto.' });
  }

  const item = await ItemPedido.findOne({ where: { item_id: req.params.itemId, pedido_id: pedido.pedido_id } });
  if (!item) return res.status(404).json({ erro: 'Item não encontrado neste pedido.' });

  const { quantidade } = req.body;

  if (quantidade === undefined || quantidade <= 0) {
    await item.destroy();
  } else {
    await item.update({ quantidade });
  }

  await recalcularTotal(pedido.pedido_id);
  const pedidoAtualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto });
  res.json(pedidoAtualizado);
}

async function removerItem(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  if (pedido.status !== 'aberto') {
    return res.status(409).json({ erro: 'Não é possível alterar um pedido que não está aberto.' });
  }

  const item = await ItemPedido.findOne({ where: { item_id: req.params.itemId, pedido_id: pedido.pedido_id } });
  if (!item) return res.status(404).json({ erro: 'Item não encontrado neste pedido.' });

  await item.destroy();
  await recalcularTotal(pedido.pedido_id);
  const pedidoAtualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto });
  res.json(pedidoAtualizado);
}

async function iniciarFechamento(req, res) {
  const pedido = await Pedido.findByPk(req.params.id, { include: [{ model: Mesa, as: 'Mesa' }] });
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  if (pedido.status !== 'aberto') {
    return res.status(409).json({ erro: 'Só é possível iniciar fechamento de um pedido aberto.' });
  }

  if (parseFloat(pedido.valor_total) <= 0) {
    return res.status(409).json({ erro: 'Não é possível fechar um pedido sem consumo registrado.' });
  }

  await pedido.update({ status: 'em_fechamento' });
  await Mesa.update({ status: 'caixa' }, { where: { mesa_id: pedido.mesa_id } });

  const pedidoAtualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto });
  res.json(pedidoAtualizado);
}

async function cancelarFechamento(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  if (pedido.status !== 'em_fechamento') {
    return res.status(409).json({ erro: 'Só é possível cancelar o fechamento de um pedido em fechamento.' });
  }

  const totalPago = await somaPagamentos(pedido.pedido_id);
  if (totalPago > 0) {
    return res.status(409).json({ erro: 'Não é possível cancelar: já existem pagamentos registrados para este pedido.' });
  }

  await pedido.update({ status: 'aberto' });
  await Mesa.update({ status: 'ocupada' }, { where: { mesa_id: pedido.mesa_id } });

  const pedidoAtualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto });
  res.json(pedidoAtualizado);
}

async function registrarPagamento(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  if (pedido.status !== 'em_fechamento') {
    return res.status(409).json({ erro: 'Só é possível registrar pagamento em um pedido com fechamento iniciado.' });
  }

  const { forma_pagamento, valor } = req.body;
  if (!forma_pagamento || !valor || valor <= 0) {
    return res.status(400).json({ erro: 'forma_pagamento e valor (maior que zero) são obrigatórios.' });
  }

  const totalPago = await somaPagamentos(pedido.pedido_id);
  const saldoRestante = parseFloat(pedido.valor_total) - totalPago;

  if (valor > saldoRestante + 0.01) {
    return res.status(409).json({ erro: `Valor excede o saldo restante de R$ ${saldoRestante.toFixed(2)}.` });
  }

  await Pagamento.create({ pedido_id: pedido.pedido_id, forma_pagamento, valor });

  const novoTotalPago = totalPago + parseFloat(valor);
  const quitado = novoTotalPago >= parseFloat(pedido.valor_total) - 0.01;

  if (quitado) {
    await pedido.update({ status: 'finalizado', data_fechamento: new Date() });
    await Mesa.update({ status: 'disponivel' }, { where: { mesa_id: pedido.mesa_id } });
  }

  const pagamentos = await Pagamento.findAll({ where: { pedido_id: pedido.pedido_id } });
  const pedidoAtualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto });

  res.status(201).json({
    pedido: pedidoAtualizado,
    pagamentos,
    saldo_restante: quitado ? '0.00' : (saldoRestante - valor).toFixed(2),
  });
}

async function listarPagamentos(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

  const pagamentos = await Pagamento.findAll({ where: { pedido_id: pedido.pedido_id }, order: [['data_pagamento', 'ASC']] });
  const totalPago = await somaPagamentos(pedido.pedido_id);
  const saldoRestante = (parseFloat(pedido.valor_total) - totalPago).toFixed(2);

  res.json({ pagamentos, valor_total: pedido.valor_total, total_pago: totalPago.toFixed(2), saldo_restante: saldoRestante });
}

module.exports = {
  abrirOuBuscarPedido,
  buscarPorId,
  listar,
  adicionarItem,
  atualizarItem,
  removerItem,
  iniciarFechamento,
  cancelarFechamento,
  registrarPagamento,
  listarPagamentos,
};
