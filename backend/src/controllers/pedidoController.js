const { Pedido, ItemPedido, Produto, Categoria, Mesa, Usuario } = require('../models');

async function recalcularTotal(pedidoId) {
  const itens = await ItemPedido.findAll({ where: { pedido_id: pedidoId } });
  const total = itens.reduce((soma, item) => soma + (item.quantidade * parseFloat(item.preco_unitario)), 0);
  await Pedido.update({ valor_total: total.toFixed(2) }, { where: { pedido_id: pedidoId } });
  return total.toFixed(2);
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

module.exports = {
  abrirOuBuscarPedido,
  buscarPorId,
  listar,
  adicionarItem,
  atualizarItem,
  removerItem,
};
