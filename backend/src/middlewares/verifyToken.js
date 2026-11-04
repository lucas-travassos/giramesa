const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return res.status(401).json({ erro: 'Token mal formatado.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
  const usuario = await Usuario.findByPk(payload.usuario_id, { attributes: ['usuario_id', 'nivel_acesso', 'status'] });
  if (!usuario || usuario.status !== 'ativo') return res.status(401).json({ erro: 'Usuário inativo ou inexistente.' });
  req.usuario = { usuario_id: usuario.usuario_id, nivel_acesso: usuario.nivel_acesso };
  next();
}

module.exports = verifyToken;
