const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    if (usuario.status !== 'ativo') {
      return res.status(403).json({ erro: 'Usuário inativo.' });
    }

    const token = jwt.sign(
      { usuario_id: usuario.usuario_id, nivel_acesso: usuario.nivel_acesso },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        usuario_id: usuario.usuario_id,
        nome: usuario.nome,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
      },
    });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno ao autenticar.' });
  }
}

module.exports = { login };
