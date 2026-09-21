const { Mesa } = require('../models');

async function listar(req, res) {
  const mesas = await Mesa.findAll({ order: [['numero', 'ASC']] });
  res.json(mesas);
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
