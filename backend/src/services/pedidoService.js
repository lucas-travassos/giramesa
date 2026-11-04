const { Transaction } = require('sequelize');
const { sequelize, Pedido, ItemPedido, Produto, Mesa, Usuario, Pagamento } = require('../models');
const { emCentavos, formatarCentavos, LIMITE_CENTAVOS } = require('../utils/dinheiro');

const { exigir } = require('../utils/erroHttp');

function executarTransacao(operacao) {
  return sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED }, operacao);
}

async function bloquearPedido(id, transaction) {
  const referencia = await Pedido.findByPk(id, { attributes: ['mesa_id'], transaction });
  exigir(referencia, 404, 'Pedido não encontrado.');
  // Todas as mutacoes seguem mesa -> pedido. READ COMMITTED evita somas antigas apos aguardar o bloqueio.
  const mesa = await Mesa.findByPk(referencia.mesa_id, { transaction, lock: transaction.LOCK.UPDATE });
  exigir(mesa, 404, 'Mesa não encontrada.');
  const pedido = await Pedido.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
  exigir(pedido, 404, 'Pedido não encontrado.');
  return { pedido, mesa };
}

function exigirAberto(pedido, mesa) {
  exigir(pedido.status === 'aberto', 409, 'Não é possível alterar um pedido que não está aberto.');
  exigir(!['caixa', 'inativa'].includes(mesa.status), 409, 'Mesa indisponível para alterar consumo.');
}

function quantidadeInteira(valor) {
  const numero = (typeof valor === 'number' || (typeof valor === 'string' && valor.trim())) ? Number(valor) : NaN;
  exigir(Number.isSafeInteger(numero) && Math.abs(numero) <= 2147483647, 400, 'Quantidade deve ser um número inteiro válido.');
  return numero;
}

async function recalcularTotal(pedido, transaction) {
  const itens = await ItemPedido.findAll({ where: { pedido_id: pedido.pedido_id }, transaction });
  const total = itens.reduce((soma, item) => soma + item.quantidade * emCentavos(item.preco_unitario), 0);
  exigir(Number.isSafeInteger(total) && total <= LIMITE_CENTAVOS, 409, 'Total do pedido excede o limite permitido.');
  await pedido.update({ valor_total: formatarCentavos(total) }, { transaction });
}

async function somaPagamentos(pedidoId, transaction) {
  const pagamentos = await Pagamento.findAll({ where: { pedido_id: pedidoId }, transaction });
  return pagamentos.reduce((soma, pagamento) => soma + emCentavos(pagamento.valor), 0);
}

const includePedidoCompleto = [
  { model: Mesa, as: 'Mesa' },
  { model: Usuario, as: 'Usuario', attributes: ['usuario_id', 'nome'] },
  {
    model: ItemPedido,
    include: [{ model: Produto, as: 'Produto', attributes: ['produto_id', 'nome', 'preco'] }],
  },
];

async function abrirOuBuscarPedido({ body, usuarioId }) {
  const { mesa_id } = body;
  return executarTransacao(async (transaction) => {
    const mesa = await Mesa.findByPk(mesa_id, { transaction, lock: transaction.LOCK.UPDATE });
    exigir(mesa, 404, 'Mesa não encontrada.');
    exigir(mesa.status !== 'caixa', 409, 'Mesa em fechamento, aguarde até ficar disponível.');
    exigir(mesa.status !== 'inativa', 409, 'Mesa inativa.');
    if (mesa.status === 'ocupada') {
      const aberto = await Pedido.findOne({ where: { mesa_id, status: 'aberto' }, transaction, lock: transaction.LOCK.UPDATE });
      exigir(aberto, 409, 'Mesa ocupada, mas nenhum pedido aberto foi encontrado.');
      return { pedido: await Pedido.findByPk(aberto.pedido_id, { include: includePedidoCompleto, transaction }), criado: false };
    }
    const pedido = await Pedido.create({ mesa_id, usuario_id: usuarioId }, { transaction });
    await mesa.update({ status: 'ocupada' }, { transaction });
    return { pedido: await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction }), criado: true };
  });
}

async function buscarPorId({ id }) {
  const pedido = await Pedido.findByPk(id, { include: includePedidoCompleto });
  exigir(pedido, 404, 'Pedido não encontrado.');
  return pedido;
}

async function listar({ query = {} }) {
  const { mesa_id, status } = query;
  const where = {};
  if (mesa_id) where.mesa_id = mesa_id;
  if (status) where.status = status;

  const pedidos = await Pedido.findAll({ where, include: includePedidoCompleto, order: [['data_abertura', 'DESC']] });
  return pedidos;
}

async function adicionarItem({ id, body = {} }) {
  return executarTransacao(async (transaction) => {
    const { pedido, mesa } = await bloquearPedido(id, transaction);
    exigirAberto(pedido, mesa);
    const { produto_id, quantidade, observacao } = body;
    exigir(produto_id, 400, 'produto_id é obrigatório.');
    const produto = await Produto.findByPk(produto_id, { transaction });
    exigir(produto, 404, 'Produto não encontrado.');
    exigir(produto.status === 'ativo', 409, 'Produto indisponível para venda.');
    const qtd = quantidade === undefined ? 1 : quantidadeInteira(quantidade);
    exigir(Number.isSafeInteger(qtd) && qtd > 0, 400, 'Quantidade deve ser um inteiro maior que zero.');
    const obs = observacao || null;
    const existente = await ItemPedido.findOne({ where: { pedido_id: pedido.pedido_id, produto_id, observacao: obs }, transaction });
    if (existente) {
      exigir(existente.quantidade + qtd <= 2147483647, 409, 'Quantidade excede o limite permitido.');
      await existente.update({ quantidade: existente.quantidade + qtd }, { transaction });
    } else {
      await ItemPedido.create({ pedido_id: pedido.pedido_id, produto_id, quantidade: qtd, preco_unitario: produto.preco, nome_produto: produto.nome, observacao: obs }, { transaction });
    }
    await recalcularTotal(pedido, transaction);
    return Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction });
  });
}

async function atualizarItem({ id, itemId, body = {} }) {
  return executarTransacao(async (transaction) => {
    const { pedido, mesa } = await bloquearPedido(id, transaction);
    exigirAberto(pedido, mesa);
    const item = await ItemPedido.findOne({ where: { item_id: itemId, pedido_id: pedido.pedido_id }, transaction });
    exigir(item, 404, 'Item não encontrado neste pedido.');
    const { quantidade } = body;
    const qtd = quantidade === undefined ? 0 : quantidadeInteira(quantidade);
    if (qtd <= 0) {
      await item.destroy({ transaction });
    } else {
      await item.update({ quantidade: qtd }, { transaction });
    }
    await recalcularTotal(pedido, transaction);
    return Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction });
  });
}

async function removerItem({ id, itemId }) {
  return executarTransacao(async (transaction) => {
    const { pedido, mesa } = await bloquearPedido(id, transaction);
    exigirAberto(pedido, mesa);
    const item = await ItemPedido.findOne({ where: { item_id: itemId, pedido_id: pedido.pedido_id }, transaction });
    exigir(item, 404, 'Item não encontrado neste pedido.');
    await item.destroy({ transaction });
    await recalcularTotal(pedido, transaction);
    return Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction });
  });
}

async function iniciarFechamento({ id }) {
  return executarTransacao(async (transaction) => {
    const { pedido, mesa } = await bloquearPedido(id, transaction);
    exigirAberto(pedido, mesa);
    exigir(emCentavos(pedido.valor_total) > 0, 409, 'Não é possível fechar um pedido sem consumo registrado.');
    await pedido.update({ status: 'em_fechamento' }, { transaction });
    await mesa.update({ status: 'caixa' }, { transaction });
    return Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction });
  });
}

async function cancelarFechamento({ id }) {
  return executarTransacao(async (transaction) => {
    const { pedido, mesa } = await bloquearPedido(id, transaction);
    exigir(pedido.status === 'em_fechamento', 409, 'Só é possível cancelar o fechamento de um pedido em fechamento.');
    exigir(await somaPagamentos(pedido.pedido_id, transaction) === 0, 409, 'Não é possível cancelar: já existem pagamentos registrados para este pedido.');
    await pedido.update({ status: 'aberto' }, { transaction });
    await mesa.update({ status: 'ocupada' }, { transaction });
    return Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction });
  });
}

async function registrarPagamento({ id, body = {} }) {
  return executarTransacao(async (transaction) => {
    const { pedido, mesa } = await bloquearPedido(id, transaction);
    exigir(pedido.status === 'em_fechamento', 409, 'Só é possível registrar pagamento em um pedido com fechamento iniciado.');
    const { forma_pagamento, valor } = body || {};
    const centavos = emCentavos(valor);
    exigir(['dinheiro', 'debito', 'credito', 'pix'].includes(forma_pagamento), 400, 'Forma de pagamento inválida.');
    exigir(centavos !== null && centavos > 0, 400, 'Valor deve ser maior que zero, com no máximo duas casas decimais.');
    const totalPago = await somaPagamentos(pedido.pedido_id, transaction);
    const saldo = emCentavos(pedido.valor_total) - totalPago;
    exigir(centavos <= saldo, 409, 'Valor excede o saldo restante de R$ ' + formatarCentavos(saldo) + '.');
    await Pagamento.create({ pedido_id: pedido.pedido_id, forma_pagamento, valor: formatarCentavos(centavos) }, { transaction });
    const saldoRestante = saldo - centavos;
    if (saldoRestante === 0) {
      await pedido.update({ status: 'finalizado', data_fechamento: new Date() }, { transaction });
      await mesa.update({ status: 'disponivel' }, { transaction });
    }
    const pagamentos = await Pagamento.findAll({ where: { pedido_id: pedido.pedido_id }, transaction });
    const atualizado = await Pedido.findByPk(pedido.pedido_id, { include: includePedidoCompleto, transaction });
    return { pedido: atualizado, pagamentos, saldo_restante: formatarCentavos(saldoRestante) };
  });
}

async function listarPagamentos({ id }) {
  return executarTransacao(async (transaction) => {
    const { pedido } = await bloquearPedido(id, transaction);
    const pagamentos = await Pagamento.findAll({ where: { pedido_id: pedido.pedido_id }, order: [['data_pagamento', 'ASC']], transaction });
    const pago = pagamentos.reduce((soma, p) => soma + emCentavos(p.valor), 0);
    return { pagamentos, valor_total: pedido.valor_total, total_pago: formatarCentavos(pago), saldo_restante: formatarCentavos(emCentavos(pedido.valor_total) - pago) };
  });
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
