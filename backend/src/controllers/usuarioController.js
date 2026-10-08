const bcrypt = require('bcrypt');
const { Usuario } = require('../models');

const camposPublicos = ['usuario_id', 'nome', 'email', 'nivel_acesso', 'status', 'created_at'];
const MSG_ULTIMO_ADMIN = 'Este é o único administrador ativo do sistema.';

// O sistema nunca pode ficar sem nenhum administrador ativo
async function ehUltimoAdminAtivo(usuario) {
  if (usuario.nivel_acesso !== 'administrador' || usuario.status !== 'ativo') return false;
  const ativos = await Usuario.count({ where: { nivel_acesso: 'administrador', status: 'ativo' } });
  return ativos <= 1;
}

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
  const { nome, email, senha, nivel_acesso } = req.body;

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
    res.status(500).json({ erro: 'Erro ao criar usuário.' });
  }
}

async function atualizar(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const { nome, email, senha, nivel_acesso, status } = req.body;

  const deixaDeSerAdminAtivo =
    (nivel_acesso && nivel_acesso !== 'administrador') || (status && status !== 'ativo');
  if (deixaDeSerAdminAtivo && (await ehUltimoAdminAtivo(usuario))) {
    return res.status(409).json({ erro: MSG_ULTIMO_ADMIN });
  }

  const dados = { nome, email, nivel_acesso, status };
  if (senha) dados.senha = await bcrypt.hash(senha, 10);

  try {
    await usuario.update(dados);
    const { senha: _omit, ...usuarioSemSenha } = usuario.toJSON();
    res.json(usuarioSemSenha);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Email já cadastrado.' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
}

async function remover(req, res) {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  if (await ehUltimoAdminAtivo(usuario)) {
    return res.status(409).json({ erro: MSG_ULTIMO_ADMIN });
  }

  await usuario.update({ status: 'inativo' });
  res.json({ mensagem: 'Usuário inativado com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
