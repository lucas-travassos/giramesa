const { Produto, Categoria, ItemPedido } = require('../models');

const MSG_VENDIDO =
  'Este produto já foi vendido e seu nome e categoria não podem ser alterados. Para trocar, inative-o e cadastre um novo produto.';
const MSG_PRECO = 'O preço deve ser maior que zero.';

const includeCategoria = { model: Categoria, as: 'categoria', attributes: ['categoria_id', 'nome'] };

async function listar(req, res) {
  const produtos = await Produto.findAll({ include: includeCategoria, order: [['nome', 'ASC']] });

  // Produtos que ja aparecem em algum item de pedido: nome e categoria ficam travados
  const vendidos = await ItemPedido.findAll({ attributes: ['produto_id'], group: ['produto_id'], raw: true });
  const idsVendidos = new Set(vendidos.map((i) => i.produto_id));

  res.json(produtos.map((p) => ({ ...p.toJSON(), tem_historico: idsVendidos.has(p.produto_id) })));
}

async function buscarPorId(req, res) {
  const produto = await Produto.findByPk(req.params.id, { include: includeCategoria });
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(produto);
}

async function criar(req, res) {
  const { categoria_id, nome, descricao, preco } = req.body;
  if (!categoria_id || !nome || preco === undefined) {
    return res.status(400).json({ erro: 'Categoria, nome e preço são obrigatórios.' });
  }
  if (!(Number(preco) > 0)) return res.status(400).json({ erro: MSG_PRECO });
  if (!(await Categoria.findByPk(categoria_id))) {
    return res.status(400).json({ erro: 'Categoria inválida.' });
  }

  try {
    const produto = await Produto.create({ categoria_id, nome, descricao: descricao || '', preco });
    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar produto.' });
  }
}

async function atualizar(req, res) {
  const produto = await Produto.findByPk(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

  const { categoria_id, nome, descricao, preco, status } = req.body;

  if (preco !== undefined && !(Number(preco) > 0)) {
    return res.status(400).json({ erro: MSG_PRECO });
  }

  // nome e categoria de um produto ja vendido fazem parte do historico: nao podem mudar
  const mudouNome = nome !== undefined && String(nome).trim() !== produto.nome;
  const mudouCategoria = categoria_id !== undefined && Number(categoria_id) !== produto.categoria_id;
  if (mudouNome || mudouCategoria) {
    const vendas = await ItemPedido.count({ where: { produto_id: produto.produto_id } });
    if (vendas > 0) return res.status(409).json({ erro: MSG_VENDIDO });
  }

  const dados = Object.fromEntries(
    Object.entries({ categoria_id, nome, descricao, preco, status }).filter(([, v]) => v !== undefined)
  );

  try {
    await produto.update(dados);
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
