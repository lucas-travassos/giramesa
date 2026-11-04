const { validar } = require('../validations/schemas');
const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const camposPublicos = ['usuario_id', 'nome', 'email', 'nivel_acesso', 'status', 'created_at'];
const usuarios = require('../services/usuarioService');

async function listar(req, res) {
  const usuarios = await Usuario.findAll({ attributes: camposPublicos, order: [['nome', 'ASC']] });
  res.json(usuarios);
}

async function buscarPorId(req, res) {
  const usuario = await Usuario.findByPk(req.params.id, { attributes: camposPublicos });
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json(usuario);
}

async function criar(req, res) {
  const { nome, email, senha, nivel_acesso } = validar(req.body, 'usuario');

  if (!nome || !email || !senha || !nivel_acesso) {
    return res.status(400).json({ erro: 'Nome, email, senha e nível de acesso são obrigatórios.' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senha: senhaHash, nivel_acesso });
    const { senha: _omit, ...usuarioSemSenha } = usuario.toJSON();
    res.status(201).json(usuarioSemSenha);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Email já cadastrado.' });
    }
    throw err;
  }
}

async function atualizar(req, res) {
  const dados = validar(req.body, 'usuarioEditar', true);
  try {
    const usuario = await usuarios.alterar(req.params.id, dados);
    const { senha: omitida, ...publico } = usuario.toJSON();
    res.json(publico);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ erro: 'Email já cadastrado.' });
    throw err;
  }
}

async function remover(req, res) {
  await usuarios.alterar(req.params.id, { status: 'inativo' });
  res.json({ mensagem: 'Usuário inativado com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
