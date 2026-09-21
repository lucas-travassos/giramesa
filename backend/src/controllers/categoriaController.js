const { Categoria, Produto } = require('../models');

async function listar(req, res) {
  const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
  res.json(categorias);
}

async function buscarPorId(req, res) {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
  res.json(categoria);
}

async function criar(req, res) {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome da categoria é obrigatório.' });

  try {
    const categoria = await Categoria.create({ nome });
    res.status(201).json(categoria);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Já existe uma categoria com esse nome.' });
    }
    res.status(500).json({ erro: 'Erro ao criar categoria.' });
  }
}

async function atualizar(req, res) {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });

  try {
    await categoria.update({ nome: req.body.nome });
    res.json(categoria);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Já existe uma categoria com esse nome.' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar categoria.' });
  }
}

async function remover(req, res) {
  const categoria = await Categoria.findByPk(req.params.id);
  if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });

  const produtoVinculado = await Produto.findOne({ where: { categoria_id: categoria.categoria_id } });
  if (produtoVinculado) {
    return res.status(409).json({ erro: 'Não é possível remover: existem produtos vinculados a esta categoria.' });
  }

  await categoria.destroy();
  res.json({ mensagem: 'Categoria removida com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
