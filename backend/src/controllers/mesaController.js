const { Mesa, Pedido } = require('../models');

const MSG_STATUS =
  'O status ocupada/caixa é controlado pelo atendimento. O administrador só alterna entre disponível e inativa, com a mesa livre.';
const MSG_NUMERO =
  'Esta mesa já tem histórico de pedidos e seu número não pode ser alterado. Para trocar, inative-a e cadastre uma nova mesa.';

async function listar(req, res) {
  const mesas = await Mesa.findAll({ order: [['numero', 'ASC']] });

  // Consumo atual = valor_total do pedido ativo (aberto ou em fechamento) de cada mesa
  const pedidosAtivos = await Pedido.findAll({
    where: { status: ['aberto', 'em_fechamento'] },
    attributes: ['mesa_id', 'valor_total'],
  });
  const consumoPorMesa = {};
  pedidosAtivos.forEach((p) => {
    consumoPorMesa[p.mesa_id] = parseFloat(p.valor_total);
  });

  // Mesas que ja tiveram algum pedido: o numero delas fica travado
  const comPedidos = await Pedido.findAll({ attributes: ['mesa_id'], group: ['mesa_id'], raw: true });
  const idsComHistorico = new Set(comPedidos.map((p) => p.mesa_id));

  res.json(
    mesas.map((m) => ({
      ...m.toJSON(),
      consumo: consumoPorMesa[m.mesa_id] ?? 0,
      tem_historico: idsComHistorico.has(m.mesa_id),
    }))
  );
}

async function buscarPorId(req, res) {
  const mesa = await Mesa.findByPk(req.params.id);
  if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada.' });
  res.json(mesa);
}

async function criar(req, res) {
  const { numero } = req.body;
  if (!numero) return res.status(400).json({ erro: 'Número da mesa é obrigatório.' });

  try {
    const mesa = await Mesa.create({ numero, status: 'disponivel' });
    res.status(201).json(mesa);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Já existe uma mesa com esse número.' });
    }
    res.status(500).json({ erro: 'Erro ao criar mesa.' });
  }
}

async function atualizar(req, res) {
  const mesa = await Mesa.findByPk(req.params.id);
  if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada.' });

  const { numero, status } = req.body;

  // ocupada/caixa pertencem ao fluxo de pedido e checkout: aqui so disponivel <-> inativa
  if (status && status !== mesa.status) {
    const livres = ['disponivel', 'inativa'];
    if (!livres.includes(status) || !livres.includes(mesa.status)) {
      return res.status(409).json({ erro: MSG_STATUS });
    }
  }

  // o numero de uma mesa com pedidos e parte do historico: nao pode mudar
  if (numero !== undefined && Number(numero) !== mesa.numero) {
    const pedidos = await Pedido.count({ where: { mesa_id: mesa.mesa_id } });
    if (pedidos > 0) return res.status(409).json({ erro: MSG_NUMERO });
  }

  try {
    await mesa.update({ numero, status });
    res.json(mesa);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Já existe uma mesa com esse número.' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar mesa.' });
  }
}

async function remover(req, res) {
  const mesa = await Mesa.findByPk(req.params.id);
  if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada.' });

  if (mesa.status !== 'disponivel') {
    return res.status(409).json({ erro: 'Só é possível inativar mesas com status disponível.' });
  }

  await mesa.update({ status: 'inativa' });
  res.json({ mensagem: 'Mesa inativada com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
