const { Produto, Categoria } = require('../models');

async function listar(req, res) {
  const produtos = await Produto.findAll({
    include: { model: Categoria, as: 'categoria', attributes: ['categoria_id', 'nome'] },
    order: [['nome', 'ASC']],
  });
  res.json(produtos);
}

async function buscarPorId(req, res) {
  const produto = await Produto.findByPk(req.params.id, {
    include: { model: Categoria, as: 'categoria', attributes: ['categoria_id', 'nome'] },
  });
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(produto);
}

async function criar(req, res) {
  const { categoria_id, nome, descricao, preco } = req.body;
  if (!categoria_id || !nome || !descricao || preco === undefined) {
    return res.status(400).json({ erro: 'Categoria, nome, descrição e preço são obrigatórios.' });
  }

  try {
    const produto = await Produto.create({ categoria_id, nome, descricao, preco });
    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
}

async function atualizar(req, res) {
  const produto = await Produto.findByPk(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const { categoria_id, nome, descricao, preco, status } = req.body;

  try {
    await produto.update({ categoria_id, nome, descricao, preco, status });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar produto.' });
  }
}

async function remover(req, res) {
  const produto = await Produto.findByPk(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

  await produto.update({ status: 'inativo' });
  res.json({ mensagem: 'Produto inativado com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
